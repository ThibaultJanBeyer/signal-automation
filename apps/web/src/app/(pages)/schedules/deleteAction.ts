"use server";

import { auth } from "@clerk/nextjs";

import { UPSTASH_SCHEDULES_URI } from "@sa/utils/src/constants";

export async function deleteAction({ id }: { id: string }) {
  const { userId } = await auth();
  if (!userId) return null;

  await fetch(`${UPSTASH_SCHEDULES_URI}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.UPSTASH_TOKEN}`,
    },
    credentials: "include",
  });

  return {
    id,
  };

  // redirect in here is broken
}
