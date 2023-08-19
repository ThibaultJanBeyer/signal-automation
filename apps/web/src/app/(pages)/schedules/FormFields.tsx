/* eslint-disable @next/next/no-img-element */
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
  UseFormReturn,
} from "react-hook-form";
import * as zod from "zod";

import { Button } from "@sa/ui/button";
import { DeleteIcon } from "@sa/ui/icons";
import { Input } from "@sa/ui/input";
import { cn } from "@sa/ui/utils";

import { CronPicker } from "@/components/CronPicker";

export type FormData = {
  messages: { value?: string }[];
  attachments: { value?: string }[];
  stickers: { value?: string }[];
  recipients: { value: string }[];
  attachmentsLuck: string;
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

  const attachments = form.watch("attachments");
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
          <Input {...form.register("scheduleDelay")} type="number" />
        </FormField>
        <MultiFormField
          name="messages"
          form={form}
          label="Message(s) (one, randomly selected):"
        />
        <MultiFormField
          name="attachments"
          form={form}
          label="Attachment(s) (one, randomly selected, base64 encoded):"
        />
        {attachments.length > 0 && (
          <FormField
            name="attachmentsLuck"
            errors={errors}
            label="How often should an attachment be picked? (0–100%)"
          >
            <Input
              {...form.register("attachmentsLuck")}
              type="number"
              min={0}
              max={100}
            />
          </FormField>
        )}
        {/* <MultiFormField
          name="stickers"
          form={form}
          label="Stickers(s) (one, randomly selected):"
        /> */}
        <MultiFormField name="recipients" form={form} label="Recipient(s):" />
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

const MultiFormField = <T extends keyof FormData>({
  name,
  label,
  form,
}: {
  name: T;
  form: UseFormReturn<FormData, any, undefined>;
  label: React.ReactNode;
}) => {
  const { fields, append, remove } = useFieldArray({
    name: name as any,
    control: form.control,
  });

  const values = form.watch(name as any);
  const errors = form.formState.errors;

  return (
    <FormField name={name} errors={errors} label={label}>
      <>
        {fields.map((field, index) => {
          return (
            <React.Fragment key={field.id}>
              {Boolean((errors as any).questions?.[index]?.value?.message) && (
                <Form.Message className="text-red-600">
                  {(errors as any).questions?.[index]?.value?.message}
                </Form.Message>
              )}
              <div
                key={field.id}
                className={cn(
                  "grid",
                  index === fields.length - 1 ? "" : "mb-2",
                  name === "attachments"
                    ? "grid-cols-[auto_1fr_auto]"
                    : "grid-cols-[1fr_auto]",
                )}
              >
                {name === "attachments" && (
                  <img src={values[index].value} alt="" className="h-10 w-10" />
                )}
                <Form.Control asChild>
                  <Input
                    key={field.id} // important to include key with field's id
                    {...form.register(`${name}.${index}.value` as any)}
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
          );
        })}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => append({ value: "" })}
        >
          Add
        </Button>
      </>
    </FormField>
  );
};

const schema = {
  messages: zod.array(
    zod.object({
      value: zod.string().nonempty({ message: "Message(s) is required" }),
    }),
  ),
  attachments: zod.array(
    zod.object({
      value: zod.string().nonempty({ message: "attachments(s) is required" }),
    }),
  ),
  stickers: zod.array(
    zod.object({
      value: zod.string().nonempty({ message: "Stickers(s) is required" }),
    }),
  ),
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
  messages: data?.messages || [{ value: "Hi 👋" }],
  attachmentsLuck: data?.attachmentsLuck || `100`,
  attachments: data?.attachments || [],
  stickers: data?.stickers || [],
  recipients: data?.recipients || [{ value: "+4917645708999" }],
});
