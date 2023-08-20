"use server";

import { auth } from "@clerk/nextjs";
import lz from "lz-string";

import {
  MESSAGE_HANDLER_URL,
  UPSTASH_PUBLISH_URI,
} from "@sa/utils/src/constants";
import { parseCustomCronString } from "@sa/utils/src/parseCustomCronString";

import { redis } from "@/lib/redis";

import { type FormData } from "./FormFields";

export async function createAction(data: FormData) {
  const { userId } = await auth();
  if (!userId) return null;

  const { cron, timeZone } = parseCustomCronString(data.scheduleCron);
  const stringified = JSON.stringify(data);
  const body = lz.compressToUTF16(stringified);

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

  const prev = (await redis.get(`schedules_${userId}`)) as any;
  await redis.set(`schedules_${userId}`, {
    ...prev,
    [result.scheduleId]: {
      cron,
      createdAt: new Date().toISOString(),
      body: `${body}`,
    },
  });

  // redirect in here is broken
}
