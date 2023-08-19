import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";

import { Skeleton } from "@sa/ui/skeleton";
import { UPSTASH_SCHEDULES_URI } from "@sa/utils/src/constants";

import { FormData } from "../FormFields";
import { Schedule } from "../page";
import { UpdateForm } from "./UpdateForm";

const getData = async (id: string): Promise<FormData | null> => {
  const { userId } = await auth();
  if (!userId) return redirect("/");
  const res = await fetch(`${UPSTASH_SCHEDULES_URI}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.UPSTASH_TOKEN}`,
    },
  });
  const data: Schedule = await res.json();

  if (!data) return null;
  const body: FormData = JSON.parse(
    Buffer.from(data.content.body, "base64").toString(),
  );

  return body;
};

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const data = await getData(id);
  if (!data) return "Not Found";

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-10">
      <div>
        <h1 className="mb-10 text-center text-lg">{"Update" || "loading…"}</h1>
        {data ? (
          <UpdateForm id={id} data={data} />
        ) : (
          <>
            <Skeleton className="w-full" />
            <Skeleton className="w-full" />
            <Skeleton className="w-full" />
          </>
        )}
      </div>
    </main>
  );
}
