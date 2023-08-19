"use server";

import { auth } from "@clerk/nextjs";

import {
  MESSAGE_HANDLER_URL,
  UPSTASH_PUBLISH_URI,
} from "@sa/utils/src/constants";
import { parseCustomCronString } from "@sa/utils/src/parseCustomCronString";

import { type FormData } from "./FormFields";

export async function createAction(data: FormData) {
  const { userId } = await auth();
  if (!userId) return null;

  const { cron, timeZone } = parseCustomCronString(data.scheduleCron);

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
    body: JSON.stringify(data),
  });

  // redirect in here is broken
}
