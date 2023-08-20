import {
  MESSAGE_RECEIVER_URL,
  UPSTASH_PUBLISH_URI,
  UPSTASH_SCHEDULES_URI,
} from "@sa/utils/src/constants";

import { redis } from "./redis";

export const setupSchedule = async () => {
  const receiveSchedule = await redis.get(`receiveSchedule`);
  if (receiveSchedule)
    await fetch(`${UPSTASH_SCHEDULES_URI}/${receiveSchedule}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.UPSTASH_TOKEN}`,
      },
    });

  const resp = await fetch(`${UPSTASH_PUBLISH_URI}/${MESSAGE_RECEIVER_URL}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
      "Upstash-Cron": "*/20 * * * *",
      "Upstash-Forward-Auth": process.env.SERVER_TOKEN!,
    },
    credentials: "include",
  });
  const result = await resp.json();
  await redis.set(`receiveSchedule`, result.scheduleId);
};
