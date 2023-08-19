import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs";

import { SERVER_POST_URI, UPSTASH_PUBLISH_URI } from "@sa/utils/src/constants";
import { getRandomItemFromArray } from "@sa/utils/src/random";

import { FormData } from "../(pages)/schedules/FormFields";

export async function GET() {
  return new NextResponse("Hello world!");
}

export async function POST(req: Request) {
  const auth = req.headers.get("Auth");
  const userId = req.headers.get("UserId");
  const user = await clerkClient.users.getUser(userId!);
  const userPhoneNumber = user.phoneNumbers.find(
    (p) => p.id === user.primaryPhoneNumberId,
  )?.phoneNumber;
  console.log(
    "user",
    user.phoneNumbers.find((p) => p.id === user.primaryPhoneNumberId)
      ?.phoneNumber,
  );

  const body: FormData = await req.json();

  if (auth !== process.env.SERVER_TOKEN)
    return new NextResponse("Missing Auth", { status: 401 });

  const msg = getRandomItemFromArray(body.messages)?.value;
  const stkr = getRandomItemFromArray(body.stickers)?.value;
  const att = getRandomItemFromArray(body.attachments)?.value;
  const message = {
    ...(msg ? { message: msg } : {}),
    ...(stkr ? { sticker: stkr } : {}),
    ...(att ? { base64_attachments: att } : {}),
    number: userPhoneNumber,
    recipients: body.recipients.map((r) => r.value),
  };

  console.log("message", message, body);

  const resp = await fetch(`${UPSTASH_PUBLISH_URI}/${SERVER_POST_URI}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
      "Upstash-Delay": `${Math.random() * Number(body.scheduleDelay || 0)}m`,
      "Upstash-Forward-Auth": process.env.SERVER_TOKEN!,
    },
    credentials: "include",
    body: JSON.stringify(message),
  });
  const result = await resp.json();

  if (result) {
    return new NextResponse("Success", { status: 200 });
  } else {
    return new NextResponse("Error", { status: 500 });
  }
}
