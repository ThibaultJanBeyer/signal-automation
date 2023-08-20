import {
  MESSAGE_RECEIVER_PATH,
  MESSAGE_RECEIVER_URL,
  UPSTASH_PUBLISH_URI,
  UPSTASH_SCHEDULES_URI,
} from "@sa/utils/src/constants";

import { Schedule } from "@/app/(pages)/schedules/page";

export const setupSchedule = async () => {
  const response = await fetch(`${UPSTASH_SCHEDULES_URI}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.UPSTASH_TOKEN}`,
    },
  });
  const res: Schedule[] = await response.json();
  const receiveScheduleIds = res?.filter(
    (r) => r.destination.url === MESSAGE_RECEIVER_PATH,
  );
  if (receiveScheduleIds.length > 0)
    await Promise.all(
      receiveScheduleIds.map(
        async (r) =>
          await fetch(`${UPSTASH_SCHEDULES_URI}/${r.scheduleId}`, {
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
};
