import { redirect } from "next/navigation";

import { Skeleton } from "@sa/ui/skeleton";
import { SCHEDULES_PATH } from "@sa/utils/src/constants";

import { getSchedule } from "../_actions/getSchedules";
import { UpdateForm } from "../_components/UpdateForm";

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const data = await getSchedule(id);
  if (!data) {
    console.info("not found", id);
    return redirect(SCHEDULES_PATH);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-10">
      <div>
        <h1 className="mb-10 text-center text-lg">{"Update" || "loading…"}</h1>
        {data ? (
          <UpdateForm data={data} />
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
