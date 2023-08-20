import { clerkClient } from "@clerk/nextjs";

import { redis } from "./redis";

export type InternalUser = {
  phoneNumber?: string;
};

export const getUser = async (userId: string) => {
  const users = (await redis.get(`users`)) as { [key: string]: InternalUser };

  const user = await clerkClient.users.getUser(userId!);
  const userPhoneNumber = user.phoneNumbers.find(
    (p) => p.id === user.primaryPhoneNumberId,
  )?.phoneNumber;
  if (users?.[userId]?.phoneNumber !== userPhoneNumber)
    await redis.set(`users`, {
      ...users,
      [userId]: {
        ...users?.[userId],
        phoneNumber: userPhoneNumber,
      },
    });

  return users?.[userId];
};
