import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import lz from "lz-string";

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
import { parseCustomCronString } from "@sa/utils/src/parseCustomCronString";

import { getUser } from "@/lib/getUser";

import { FormData } from "./FormFields";

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

const getData = async (): Promise<
  ({ id: string; createdAt: string } & FormData)[]
> => {
  const { userId } = await auth();
  if (!userId) return redirect("/");
  const user = await getUser(userId);
  if (!user) return redirect("/");
  return Object.keys(user.schedules || {}).map((id) => {
    const schedule = user.schedules![id]!;
    const decompressed = lz.decompressFromUTF16(schedule.body);
    return {
      id,
      createdAt: schedule.createdAt,
      cron: schedule.cron,
      ...JSON.parse(decompressed),
    };
  });
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
            <TableHead>Name</TableHead>
            <TableHead>Cron</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Recipients</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(({ name, scheduleCron, createdAt, recipients, id }) => {
            const date = new Date(createdAt);
            const { cron } = parseCustomCronString(scheduleCron);
            return (
              <TableRow key={id}>
                <TableCell className="font-medium">
                  <Link href={`/schedules/${id}`} className="block">
                    {name}
                  </Link>
                </TableCell>
                <TableCell>{cron}</TableCell>
                <TableCell>{date.toLocaleString()}</TableCell>
                <TableCell>{recipients.map((v) => v.value)}</TableCell>
                <TableCell>
                  <Button asChild>
                    <Link href={`/schedules/${id}`} className="block">
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
