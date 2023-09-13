import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import lz from "lz-string";

import { UPSTASH_SCHEDULES_URI } from "@sa/utils/src/constants";

import { redis } from "@/lib/redis";

import { type XFormData } from "../_components/FormFields";

export type Schedule = {
  scheduleId: string;
  cron: string;
  createdAt: number;
  content: {
    header: { [key: string]: string };
    body: string; // BASE64 body
  };
  destination: { type: string; url: string };
  settings: { retries: 3 };
};

export type RemoteFormData = { _id: string; createdAt: number } & XFormData;

export const getAllSchedules = async (): Promise<RemoteFormData[] | null> => {
  const { userId } = await auth();
  if (!userId) return redirect("/");

  // get all schedules
  const res = await fetch(`${UPSTASH_SCHEDULES_URI}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.UPSTASH_TOKEN}`,
    },
  });
  const schedules = (await res.json()) as Schedule[];
  if (!schedules || (schedules as any)?.error) {
    console.error((schedules as any)?.error);
    return null;
  }

  // filter down to only user owned schedules
  const userScheduleIds: string[] =
    (await redis.get(`schedules_${userId}`)) || [];
  const data = schedules.filter((d) => userScheduleIds.includes(d.scheduleId));

  // return all schedules
  return data
    .map((d) => ({
      ...parseData(d),
      _id: d.scheduleId,
      createdAt: d.createdAt,
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
};

export const getSchedule = async (
  id: string,
): Promise<RemoteFormData | null> => {
  const data = await getAllSchedules();
  const schedule = data?.find((d) => d._id === id);
  if (!schedule) return null;
  return schedule;
};

const parseData = (schedule: Schedule): RemoteFormData => {
  const buffer = Buffer.from(schedule.content.body, "base64").toString();
  const decompressed = lz.decompressFromUTF16(JSON.parse(buffer).body);
  const body: RemoteFormData = JSON.parse(decompressed);
  return body;
};
