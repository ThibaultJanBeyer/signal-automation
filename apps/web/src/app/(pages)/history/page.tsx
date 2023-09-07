import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import lz from "lz-string";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sa/ui/table";

import { type ExtractedMessage } from "@/app/api/receive/message";
import { redis } from "@/lib/redis";

import PollButton from "./PollButton";

const getData = async (): Promise<ExtractedMessage[]> => {
  const { userId } = await auth();
  if (!userId) return redirect("/");
  const raw = (await redis.get(`recent_messages_${userId}`)) as string | null;
  if (!raw) return [];
  return JSON.parse(lz.decompressFromUTF16(raw));
};

export default async function StandupList() {
  const data = await getData();
  const sorted = data.sort((a, b) => b.timestamp - a.timestamp);
  return (
    <main className="mx-auto w-full max-w-5xl">
      <PollButton />
      <Table>
        <TableCaption>
          Latest messages from your interactions in the last minutes.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>SourceName</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted?.map((m, id) => {
            if (!m.received && !m.sent && m.isSelf) return null;
            return (
              <TableRow key={id}>
                <TableCell className="font-medium">{m.sourceName}</TableCell>
                <TableCell>
                  {JSON.stringify(m.received || m.sent || m.status, null, 2)}
                </TableCell>
                <TableCell>{new Date(m?.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </main>
  );
}
