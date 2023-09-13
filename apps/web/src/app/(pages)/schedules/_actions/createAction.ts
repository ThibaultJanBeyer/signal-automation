"use server";

import { auth } from "@clerk/nextjs";
import lz from "lz-string";

import {
  MESSAGE_HANDLER_URL,
  UPSTASH_PUBLISH_URI,
} from "@sa/utils/src/constants";
import { parseCustomCronString } from "@sa/utils/src/parseCustomCronString";

import { redis } from "@/lib/redis";

import { type XFormData } from "../_components/FormFields";
import { type RemoteFormData } from "./getSchedules";

export async function createAction(data: XFormData | RemoteFormData) {
  const { userId } = await auth();
  if (!userId) return null;

  const { cron } = parseCustomCronString(data.scheduleCron);
  const stringified = JSON.stringify(data);
  const body = lz.compressToUTF16(stringified);

  if (data.messages[0]?.value?.includes("test_direct_")) {
    const resp = await fetch("http://localhost:3000/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Auth: process.env.SERVER_TOKEN!,
        UserId: userId,
      },
      credentials: "include",
      body: JSON.stringify({ body }),
    });
    if (!resp.ok) throw new Error(`Error creating schedule ${resp.statusText}`);
    return;
  }

  const resp = await fetch(`${UPSTASH_PUBLISH_URI}/${MESSAGE_HANDLER_URL}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
      "Upstash-Cron": cron,
      "Upstash-Forward-Auth": process.env.SERVER_TOKEN!,
      "Upstash-Forward-UserId": userId,
    },
    credentials: "include",
    body: JSON.stringify({ body }),
  });
  if (!resp.ok) throw new Error(`Error creating schedule ${resp.statusText}`);
  const result = await resp.json();

  const prev: string[] = (await redis.get(`schedules_${userId}`)) || [];
  prev.push(result.scheduleId);
  await redis.set(`schedules_${userId}`, prev);
}
