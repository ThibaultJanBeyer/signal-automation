"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

import { Button } from "@sa/ui/button";
import {
  MESSAGE_RECEIVER_URL,
  SERVER_RECEIVE_URI,
} from "@sa/utils/src/constants";

import { messageExtractionTeam } from "@/app/api/receive/message";

const fetchData = async ({ setLoading, user }: any) => {
  console.log("fetchData", { user });

  setLoading(true);
  const phoneNumber = user!.primaryPhoneNumber!.phoneNumber!;
  if (!user?.primaryPhoneNumber?.phoneNumber) {
    console.error("No phone number found", user);
    return;
  }
  console.log(`"YOLO" ${SERVER_RECEIVE_URI}/${phoneNumber}`);

  const resp = await fetch(`${SERVER_RECEIVE_URI}/${phoneNumber}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Auth: process.env.SERVER_TOKEN!,
    },
    credentials: "include",
  });
  const result = await resp.json();
  const extracted = messageExtractionTeam(result, phoneNumber);
  if (!extracted || !extracted.length) return;
  console.log({ extracted });

  const resp2 = await fetch(`${MESSAGE_RECEIVER_URL}/manual`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Auth: process.env.SERVER_TOKEN!,
    },
    credentials: "include",
    body: JSON.stringify({ extracted }),
  });
  const result2 = await resp.json();
  console.log({ result2, resp2 });

  setLoading(false);
};

export default function PollButton() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  return (
    <Button onClick={() => fetchData({ setLoading, user })} loading={loading}>
      Refresh
    </Button>
  );
}
