"use client";

import { startTransition, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Form from "@radix-ui/react-form";
import { FormProvider, useForm } from "react-hook-form";
import * as zod from "zod";

import { Input } from "@sa/ui/input";

import { type RemoteFormData } from "../_actions/getSchedules";
import { updateAction } from "../_actions/updateAction";

const schema = {
  luck: zod.number().min(0).max(100),
};

export default function LuckField(data: RemoteFormData) {
  const { luck } = data;

  const [loading, isLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(zod.object(schema).strict()),
    mode: "onChange",
    defaultValues: { luck },
  });
  form.reset();

  const onSubmit = ({ luck }: { luck: string }) => {
    isLoading(true);
    startTransition(() => {
      updateAction({ ...data, luck })
        .then(() => {
          isLoading(false);
        })
        .catch((error) => {
          console.log("error", error);
          isLoading(false);
        });
    });
  };

  const errors = form.formState.errors;

  return (
    <FormProvider {...form}>
      <Form.Root
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-[5rem]"
      >
        {errors ? (
          <div className="text-red-600">
            {Object.values(errors).map((error) => (
              <div key={error.message}>{error.message}</div>
            ))}
          </div>
        ) : null}
        <Input
          {...form.register("luck", { valueAsNumber: true })}
          disabled={loading}
          type="number"
          min={0}
          max={100}
        />
      </Form.Root>
    </FormProvider>
  );
}
