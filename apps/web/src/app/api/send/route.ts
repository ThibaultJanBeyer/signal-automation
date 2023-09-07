import { NextResponse } from "next/server";
import lz from "lz-string";

import { SERVER_POST_URI, UPSTASH_PUBLISH_URI } from "@sa/utils/src/constants";
import { getRandomItemFromArray, isSelected } from "@sa/utils/src/random";

import { FormData } from "@/app/(pages)/schedules/FormFields";
import { getUser } from "@/lib/getUser";

export async function GET() {
  return new NextResponse("Hello world!");
}

async function fetchAndEncodeImage(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64data = buffer.toString("base64");
  return `${base64data}`;
}

export async function POST(req: Request) {
  const auth = req.headers.get("Auth");
  const userId = req.headers.get("UserId");
  const user = await getUser(userId!);
  const json: { body: string } = await req.json();

  if (!user?.phoneNumber)
    return new NextResponse("Missing User", { status: 401 });
  if (auth !== process.env.SERVER_TOKEN)
    return new NextResponse("Missing Auth", { status: 401 });

  const decompressed = lz.decompressFromUTF16(json.body);
  const body: FormData = JSON.parse(decompressed);

  const msg = getRandomItemFromArray(body.messages)?.value;
  const stkr = getRandomItemFromArray(body.stickers)?.value;
  const img = getRandomItemFromArray(body.images)?.value;
  const shouldSend = Boolean(
    isSelected(Number(body.luck)) && (msg || stkr || img),
  );
  if (!shouldSend)
    return new NextResponse(
      `Not sending ${body.luck} – ${msg || stkr || img}`,
      {
        status: 200,
      },
    );

  const message = {
    ...(msg ? { message: msg } : {}),
    ...(stkr ? { sticker: stkr } : {}),
    ...(img ? { base64_attachments: [await fetchAndEncodeImage(img)] } : {}),
    number: user?.phoneNumber,
    recipients: body.recipients.map((r) => r.value),
  };

  const resp = await fetch(`${UPSTASH_PUBLISH_URI}/${SERVER_POST_URI}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
      "Upstash-Delay": `${Math.random() * Number(body.scheduleDelay || 0)}m`,
      "Upstash-Forward-Auth": auth,
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
