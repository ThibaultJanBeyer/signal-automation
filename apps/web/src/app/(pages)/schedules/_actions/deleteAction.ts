"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs";

import { SCHEDULES_PATH, UPSTASH_SCHEDULES_URI } from "@sa/utils/src/constants";

import { redis } from "@/lib/redis";

export async function deleteAction({ _id }: { _id: string }) {
  const { userId } = await auth();
  if (!userId) return null;

  const resp = await fetch(`${UPSTASH_SCHEDULES_URI}/${_id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.UPSTASH_TOKEN}`,
    },
    credentials: "include",
  });
  if (!resp.ok) throw new Error(`Error deleting schedule ${resp.statusText}`);

  let prev: string[] = (await redis.get(`schedules_${userId}`)) || [];
  if (typeof prev === "string") prev = JSON.parse(prev);
  prev.splice(prev.indexOf(_id), 1);
  await redis.set(`schedules_${userId}`, prev);

  revalidatePath(SCHEDULES_PATH);
  return { _id };
}
