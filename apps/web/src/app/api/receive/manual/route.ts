import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import lz from "lz-string";

import { type InternalUser } from "@/lib/getUser";
import { redis } from "@/lib/redis";

export async function GET() {
  return new NextResponse("Hello world!");
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("No User ID", { status: 404 });
  const users = (await redis.get(`users`)) as { [key: string]: InternalUser };
  const phoneNumber = users?.[userId]?.phoneNumber;
  if (!phoneNumber) return new NextResponse("No Phone Number", { status: 404 });
  const body = await req.json();
  const extracted = body.extracted;
  if (!extracted || !extracted.length)
    return new NextResponse("Ok, but no news", { status: 200 });

  const ttl = await redis.pttl(`recent_messages_${userId}`);
  const composed =
    ttl > 0
      ? JSON.parse(
          lz.decompressFromUTF16(
            (await redis.get(`recent_messages_${userId}`))!,
          ),
        )
      : [];
  composed.push(...extracted);
  const compressed = lz.compressToUTF16(JSON.stringify(composed));

  await redis.set(`recent_messages_${userId}`, `${compressed}`, {
    ex: ttl > 0 ? Math.floor(ttl / 1000) : 60 * 60 * 8,
  });

  return new NextResponse("Success", { status: 200 });
}
