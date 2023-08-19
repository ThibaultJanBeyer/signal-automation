"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Form from "@radix-ui/react-form";
import {
  FieldErrors,
  FormProvider,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import * as zod from "zod";

import { Button } from "@sa/ui/button";
import { DeleteIcon } from "@sa/ui/icons";
import { Input } from "@sa/ui/input";

import { CronPicker } from "@/components/CronPicker";

export type FormData = {
  messages: { value: string }[];
  recipients: { value: string }[];
  scheduleCron: string;
  scheduleDelay: string;
};

type Props = {
  onSubmit: SubmitHandler<FormData>;
  children: React.ReactNode;
  data?: FormData;
};

export default function FormFields({ onSubmit, data, children }: Props) {
  const form = useForm({
    resolver: zodResolver(zod.object(schema).strict()),
    mode: "onChange",
    defaultValues: getDefaultValues(data),
  });

  const {
    fields: messagesFields,
    append,
    remove,
  } = useFieldArray({
    name: "messages",
    control: form.control,
  });

  const {
    fields: recipientsFields,
    append: appendRecipients,
    remove: removeRecipients,
  } = useFieldArray({
    name: "recipients",
    control: form.control,
  });

  const errors = form.formState.errors;

  return (
    <FormProvider {...form}>
      {errors ? (
        <div className="text-red-600">
          {Object.values(errors).map((error) => (
            <div key={error.message}>{error.message}</div>
          ))}
        </div>
      ) : null}
      <Form.Root onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="scheduleCron"
          errors={errors}
          label="Select time to send-out (in UTC):"
        >
          <CronPicker
            onChange={(val: string) => form.setValue("scheduleCron", val)}
            registered={form.register("scheduleCron")}
          />
        </FormField>
        <FormField
          name="scheduleDelay"
          errors={errors}
          label={
            <>
              Select the delay for send-out (in minutes)
              <br />
              Will be a random number from 0–X:
            </>
          }
        >
          <Input {...form.register("scheduleDelay")} />
        </FormField>
        <FormField
          name="messages"
          errors={errors}
          label="Messages to randomly chose from:"
        >
          <>
            {messagesFields.map((field, index) => (
              <React.Fragment key={field.id}>
                {Boolean(
                  (errors as any).questions?.[index]?.value?.message,
                ) && (
                  <Form.Message className="text-red-600">
                    {(errors as any).questions?.[index]?.value?.message}
                  </Form.Message>
                )}
                <div
                  key={field.id}
                  className={`${
                    index === messagesFields.length - 1 ? "" : "mb-2"
                  } grid grid-cols-[1fr_auto] gap-2`}
                >
                  <Form.Control asChild>
                    <Input
                      key={field.id} // important to include key with field's id
                      {...form.register(`messages.${index}.value`)}
                    />
                  </Form.Control>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => remove(index)}
                  >
                    <DeleteIcon>Delete</DeleteIcon>
                  </Button>
                </div>
              </React.Fragment>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ value: "" })}
            >
              Add Message
            </Button>
          </>
        </FormField>

        <FormField name="recipients" errors={errors} label="Recipients:">
          <>
            {recipientsFields.map((field, index) => (
              <React.Fragment key={field.id}>
                {Boolean(
                  (errors as any).questions?.[index]?.value?.message,
                ) && (
                  <Form.Message className="text-red-600">
                    {(errors as any).questions?.[index]?.value?.message}
                  </Form.Message>
                )}
                <div
                  key={field.id}
                  className={`${
                    index === recipientsFields.length - 1 ? "" : "mb-2"
                  } grid grid-cols-[1fr_auto] gap-2`}
                >
                  <Form.Control asChild>
                    <Input
                      key={field.id} // important to include key with field's id
                      {...form.register(`recipients.${index}.value`)}
                    />
                  </Form.Control>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeRecipients(index)}
                  >
                    <DeleteIcon>Delete</DeleteIcon>
                  </Button>
                </div>
              </React.Fragment>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => appendRecipients({ value: "" })}
            >
              Add Recipient
            </Button>
          </>
        </FormField>

        {children}
      </Form.Root>
    </FormProvider>
  );
}

const FormField = <T extends keyof FormData>({
  name,
  label,
  errors,
  children,
}: {
  name: T;
  label: React.ReactNode;
  errors: FieldErrors<FormData>;
  children: React.ReactNode;
}) => {
  const error = errors[name]?.message;
  return (
    <Form.Field name={name} className="mb-10">
      <Form.Label className="mb-2 block font-bold">
        {label}
        {error && (
          <Form.Message className="font-normal text-red-600">
            {` (${error})`}
          </Form.Message>
        )}
      </Form.Label>
      <Form.Control asChild>{children}</Form.Control>
    </Form.Field>
  );
};

const schema = {
  messages: zod
    .array(
      zod.object({
        value: zod.string().nonempty({ message: "Message(s) is required" }),
      }),
    )
    .nonempty({ message: "Message(s) are required" }),
  recipients: zod
    .array(
      zod.object({
        value: zod.string().nonempty({ message: "Recipient(s) is required" }),
      }),
    )
    .nonempty({ message: "Recipient(s) are required" }),
  scheduleCron: zod.string().nonempty({ message: "Schedule is required" }),
  scheduleDelay: zod.string().nonempty({ message: "Delay is required" }),
};

const getDefaultValues = (data?: FormData): FormData => ({
  scheduleCron:
    data?.scheduleCron ||
    `30 8 * * * {${Intl.DateTimeFormat().resolvedOptions().timeZone}}`,
  scheduleDelay: data?.scheduleDelay || `1`,
  messages: data?.messages || [{ value: "Hi :)" }],
  recipients: data?.recipients || [{ value: "+4917645708999" }],
});
