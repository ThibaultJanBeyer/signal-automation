import {
  MESSAGE_RECEIVER_URL,
  UPSTASH_PUBLISH_URI,
  UPSTASH_SCHEDULES_URI,
} from "@sa/utils/src/constants";

import { Schedule } from "@/app/(pages)/schedules/page";

import { redis } from "./redis";

export const setupSchedule = async () => {
  const receiveScheduleIds =
    ((await redis.get(
      `receiveScheduleIds_${MESSAGE_RECEIVER_URL}`,
    )) as string[]) || [];
  if (receiveScheduleIds.length > 0)
    await Promise.all(
      receiveScheduleIds.map(
        async (r) =>
          await fetch(`${UPSTASH_SCHEDULES_URI}/${r}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.UPSTASH_TOKEN}`,
            },
          }),
      ),
    );

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
  receiveScheduleIds.push(result.scheduleId);
  await redis.set(
    `receiveScheduleIds_${MESSAGE_RECEIVER_URL}`,
    receiveScheduleIds,
  );
};
