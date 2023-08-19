import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";

import { SERVER_QR_URI } from "@sa/utils/src/constants";

const getData = async () => {
  const { userId } = await auth();
  if (!userId) return redirect("/");
  const res = await fetch(`${SERVER_QR_URI}-${userId}`, {
    method: "GET",
    headers: {
      Auth: `${process.env.SERVER_TOKEN}`,
    },
  });
  const arrayBuffer = await res.arrayBuffer();
  if (!arrayBuffer) return null;
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");
  return `data:image/png;base64,${base64}`;
};

export default async function StandupList() {
  const data = await getData();

  return (
    <main className="mx-auto w-full max-w-5xl text-center">
      <h1 className="mb-10 text-6xl font-bold">Link your device</h1>
      <div className="mb-10">
        Scan the QR Code from within your Signal Messenger to Link your device
        to this app.
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="inline-block"
        src={data!}
        alt="QR Code to link your device"
      />
    </main>
  );
}
