// @todo move this into a cloudflare worker
import {
  MESSAGE_RECEIVER_URL,
  UPSTASH_PUBLISH_URI,
  UPSTASH_SCHEDULES_URI,
} from "@sa/utils/src/constants";

import { type Schedule } from "@/app/(pages)/schedules/_actions/getSchedules";

let isRunning = false;

export const setupSchedule = async () => {
  if (isRunning) return;
  isRunning = true;

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

  if (receiveSchedulesIds.length > 0) {
    await Promise.all(
      receiveSchedulesIds.map(async (id) => {
        const res = await fetch(`${UPSTASH_SCHEDULES_URI}/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.UPSTASH_TOKEN}`,
          },
        });
        if (!res.ok)
          throw new Error(`Error deleting schedule ${res.statusText}`);
        console.log(`Deleted schedule ${id}`);
      }),
    );
  }

  if (
    MESSAGE_RECEIVER_URL !== "https://signal-automation.vercel.app/api/receive"
  ) {
    const resp = await fetch(`${UPSTASH_PUBLISH_URI}/${MESSAGE_RECEIVER_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_TOKEN}`,
        "Content-Type": "application/json",
        "Upstash-Cron": "*/6 * * * *",
        "Upstash-Forward-Auth": process.env.SERVER_TOKEN!,
      },
      credentials: "include",
    });
    const result = await resp.json();
    console.log(`Created schedule ${result.scheduleId}`);
  } else {
    console.log(`Not creating schedule`, MESSAGE_RECEIVER_URL);
  }

  isRunning = false;
};
