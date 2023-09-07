import { NextResponse } from "next/server";
import lz from "lz-string";

import { SERVER_RECEIVE_URI } from "@sa/utils/src/constants";

import { type InternalUser } from "@/lib/getUser";
import { redis } from "@/lib/redis";

import { messageExtractionTeam } from "./message";

export async function GET() {
  return new NextResponse("Hello world!");
}

export async function POST(req: Request) {
  const auth = req.headers.get("Auth");
  if (auth !== process.env.SERVER_TOKEN)
    return new NextResponse("Missing Auth", { status: 401 });

  const users = (await redis.get(`users`)) as { [key: string]: InternalUser };

  for (const userId in users) {
    if (Object.prototype.hasOwnProperty.call(users, userId)) {
      const user = users[userId]!;
      const phoneNumber = user.phoneNumber;
      if (!phoneNumber) continue;

      const resp = await fetch(`${SERVER_RECEIVE_URI}/${phoneNumber}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Auth: auth,
        },
        credentials: "include",
      });
      const result = await resp.json();

      const ttl = await redis.pttl(`recent_messages_${userId}`);
      const composed =
        ttl > 0
          ? JSON.parse(
              lz.decompressFromUTF16(
                (await redis.get(`recent_messages_${userId}`))!,
              ),
            )
          : [];
      const extracted = messageExtractionTeam(result, phoneNumber);
      if (!extracted || !extracted.length) continue;
      composed.push(...extracted);
      const compressed = lz.compressToUTF16(JSON.stringify(composed));

      await redis.set(`recent_messages_${userId}`, `${compressed}`, {
        ex: ttl > 0 ? Math.floor(ttl / 1000) : 60 * 60 * 8,
      });
    }
  }

  return new NextResponse("Success", { status: 200 });
}
