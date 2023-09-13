import React from "react";
import Link from "next/link";

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

import { getAllSchedules } from "./_actions/getSchedules";
import DeleteButton from "./_components/DeleteButton";
import LuckField from "./_components/LuckField";

export default async function StandupList() {
  const data = await getAllSchedules();

  return (
    <main className="mx-auto w-full max-w-5xl">
      <div className="text-center">
        <Button asChild className="mx-auto my-10" variant="outlinePrimary">
          <Link href={`/schedules/create`}>Create New Schedule</Link>
        </Button>
      </div>
      <Table>
        <TableCaption>A list of your automation.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Cron</TableHead>
            <TableHead>Last changed</TableHead>
            <TableHead>Recipients</TableHead>
            <TableHead>Luck</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((schedule) => {
            const { name, scheduleCron, createdAt, recipients, _id } = schedule;
            const date = new Date(createdAt);
            const { cron } = parseCustomCronString(scheduleCron);
            return (
              <TableRow key={_id}>
                <TableCell className="font-medium">
                  <Link href={`/schedules/${_id}`} className="block">
                    {name}
                  </Link>
                </TableCell>
                <TableCell>{cron}</TableCell>
                <TableCell>{date.toLocaleString()}</TableCell>
                <TableCell>{recipients.map((v) => v.value)}</TableCell>
                <TableCell>
                  <LuckField {...schedule} />
                </TableCell>
                <TableCell>
                  <div>
                    <Button asChild>
                      <Link href={`/schedules/${_id}`} className="block">
                        Open
                      </Link>
                    </Button>
                    <DeleteButton _id={_id} />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </main>
  );
}
