"use client";

import { startTransition } from "react";
import { Submit } from "@radix-ui/react-form";

import { Button } from "@sa/ui/button";
import { SCHEDULES_PATH } from "@sa/utils/src/constants";

import { createAction } from "../_actions/createAction";
import FormFields, { FormData } from "../_components/FormFields";

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
        <div className="mb-10">
          Note following for delivery to work:
          <br />- You need to have had an interaction first with all recipients
          in the last 20 minutes
          <br />- Make sure that the recipients number is exactly the same as
          the number listed in Signal app for that user
          <br />- Make sure that you are logged in here with the same phone
          number as the one you have connected with in the Signal app
        </div>
        <Submit asChild>
          <Button type="submit" variant="outlinePrimary" loading={false}>
            Create
          </Button>
        </Submit>
      </FormFields>
    </main>
  );
}
