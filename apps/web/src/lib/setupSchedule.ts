import {
  MESSAGE_RECEIVER_URL,
  UPSTASH_PUBLISH_URI,
  UPSTASH_SCHEDULES_URI,
} from "@sa/utils/src/constants";

import { Schedule } from "@/app/(pages)/schedules/page";

let isRunning = false;

export const setupSchedule = async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    const res = await fetch(`${UPSTASH_SCHEDULES_URI}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    const receiveSchedules: Schedule[] = await res.json();
    const receiveSchedulesIds = receiveSchedules
      .filter((r) => r.destination.url == MESSAGE_RECEIVER_URL)
      .map((r) => r.scheduleId);

    if (receiveSchedulesIds.length > 0)
      await Promise.all(
        receiveSchedulesIds.map(async (id, index) => {
          const res = await fetch(`${UPSTASH_SCHEDULES_URI}/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.UPSTASH_TOKEN}`,
            },
          });
          const result = await res.json();
          console.log(`Deleted schedule ${result.scheduleId}`);
        }),
      );

    if (MESSAGE_RECEIVER_URL.includes("signal-automation-git-"))
      throw new Error("Not on git branch urls");

    const resp = await fetch(`${UPSTASH_PUBLISH_URI}/${MESSAGE_RECEIVER_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_TOKEN}`,
        "Content-Type": "application/json",
        "Upstash-Cron": "*/11 * * * *",
        "Upstash-Forward-Auth": process.env.SERVER_TOKEN!,
      },
      credentials: "include",
    });
    const result = await resp.json();
    console.log(`Created schedule ${result.scheduleId}`);
  } catch (err: any) {
    if (err.message.includes("Not on git branch urls")) console.info(err);
    else console.error(err);
  }

  isRunning = false;
};
