import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";

import { Button } from "@sa/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sa/ui/table";
import { UPSTASH_SCHEDULES_URI } from "@sa/utils/src/constants";

export type Schedule = {
  scheduleId: string;
  cron: string;
  createdAt: number;
  content: {
    header: { [key: string]: string };
    body: string; // JWT body
  };
  destination: { type: string; url: string };
  settings: { retries: 3 };
};

const getData = async (): Promise<Schedule[] | null> => {
  const { userId } = await auth();
  if (!userId) return redirect("/");
  const res = await fetch(`${UPSTASH_SCHEDULES_URI}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.UPSTASH_TOKEN}`,
    },
  });
  const data: Schedule[] | null = await res.json();
  if (!data) return null;

  return data;
};

export default async function StandupList() {
  const data = await getData();

  return (
    <main className="mx-auto w-full max-w-5xl">
      <div className="text-center">
        <Button asChild className="mx-auto my-10" variant="outlinePrimary">
          <Link href={`/schedules/create`}>Create New Schedule</Link>
        </Button>
      </div>
      <Table>
        <TableCaption>A list of your workspaces standups.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead>Cron</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map(({ scheduleId, createdAt, cron }) => {
            const date = new Date(createdAt as any as string);
            return (
              <TableRow key={scheduleId}>
                <TableCell className="font-medium">
                  <Link href={`/schedules/${scheduleId}`} className="block">
                    {scheduleId}
                  </Link>
                </TableCell>
                <TableCell>{cron}</TableCell>
                <TableCell>{date.toLocaleString()}</TableCell>
                <TableCell>
                  <Button asChild>
                    <Link href={`/schedules/${scheduleId}`} className="block">
                      Open
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </main>
  );
}
