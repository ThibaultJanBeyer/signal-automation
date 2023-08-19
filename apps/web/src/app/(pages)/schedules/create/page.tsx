// @TODO: fix issue with bot login

"use client";

import { startTransition } from "react";
import { Submit } from "@radix-ui/react-form";

import { Button } from "@sa/ui/button";
import { SCHEDULES_PATH } from "@sa/utils/src/constants";

import { createAction } from "../createAction";
import FormFields, { FormData } from "../FormFields";

export default function Page() {
  const onSubmit = (data: FormData) => {
    startTransition(() => {
      createAction(data)
        .then((ok) => (location.href = SCHEDULES_PATH))
        .catch((error) => {
          console.log("error", error);
        });
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <FormFields onSubmit={onSubmit}>
        <Submit asChild>
          <Button type="submit" variant="outlinePrimary" loading={false}>
            Create
          </Button>
        </Submit>
      </FormFields>
    </main>
  );
}
