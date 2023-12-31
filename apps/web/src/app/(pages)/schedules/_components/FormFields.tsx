/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Form from "@radix-ui/react-form";
import {
  FormProvider,
  useFieldArray,
  useForm,
  type FieldErrors,
  type UseFormReturn,
} from "react-hook-form";
import * as zod from "zod";

import { Button } from "@sa/ui/button";
import { DeleteIcon } from "@sa/ui/icons";
import { Input } from "@sa/ui/input";
import { cn } from "@sa/ui/utils";

import { CronPicker } from "@/components/CronPicker";

export type XFormData = {
  name: string;
  messages: { value?: string }[];
  images: { value?: string }[];
  stickers: { value?: string }[];
  recipients: { value: string }[];
  luck: string;
  scheduleCron: string;
  scheduleDelay: string;
};

type Props = {
  onSubmit: (data: XFormData) => void;
  children: React.ReactNode;
  data?: XFormData;
};

export default function FormFields({ onSubmit, data, children }: Props) {
  const form = useForm({
    resolver: zodResolver(zod.object(schema).strict()),
    mode: "onChange",
    defaultValues: getDefaultValues(data),
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
        <FormField name="name" errors={errors} label="Name of the schedule:">
          <Input {...form.register("name")} />
        </FormField>
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
          <Input
            {...form.register("scheduleDelay", { valueAsNumber: true })}
            type="number"
            min={0}
            max={300}
          />
        </FormField>
        <MultiFormField
          name="messages"
          form={form}
          label="Message(s) (one, randomly selected):"
        />
        <MultiFormField
          name="images"
          form={form}
          label="URL(s) to Images (one, randomly selected):"
        />
        <MultiFormField
          name="stickers"
          form={form}
          label="Stickers(s) (one, randomly selected):"
        />
        <FormField
          name="luck"
          errors={errors}
          label="How often should the message be actually send? (0–100%)"
        >
          <Input
            {...form.register("luck", { valueAsNumber: true })}
            type="number"
            min={0}
            max={100}
          />
        </FormField>
        <MultiFormField name="recipients" form={form} label="Recipient(s):" />
        {children}
      </Form.Root>
    </FormProvider>
  );
}

const FormField = <T extends keyof XFormData>({
  name,
  label,
  errors,
  children,
}: {
  name: T;
  label: React.ReactNode;
  errors: FieldErrors<XFormData>;
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

const MultiFormField = <T extends keyof XFormData>({
  name,
  label,
  form,
}: {
  name: T;
  form: UseFormReturn<XFormData, any, undefined>;
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
        {name === "stickers" && Boolean(values.length) && (
          <>
            <p className="text-orange-400">
              Note: for stickers to work, remove messages and images.
            </p>
            <p>
              The format is <em>fe4947796aab26324240fece95824d3e:1-10</em> while
              fe4947796aab26324240fece95824d3e is the sticker pack id and 1-10
              is the range of stickers to use, or a single number for a specific
              sticker.
            </p>
          </>
        )}
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
                  name === "images"
                    ? "grid-cols-[auto_1fr_auto]"
                    : "grid-cols-[1fr_auto]",
                )}
              >
                {name === "images" && (
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

const phoneRegex = new RegExp(
  /\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/,
);

const schema = {
  name: zod.string().nonempty({ message: "Name is required" }),
  messages: zod.array(
    zod.object({
      value: zod.string().nonempty({ message: "Message(s) is required" }),
    }),
  ),
  images: zod.array(
    zod.object({
      value: zod.string().nonempty({ message: "images(s) is required" }),
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
        value: zod
          .string()
          .regex(
            phoneRegex,
            "Phone number needs to be in international format (i.e. +4917605708001",
          )
          .nonempty({ message: "Recipient(s) is required" }),
      }),
    )
    .nonempty({ message: "Recipient(s) are required" }),
  luck: zod.number().min(0).max(100),
  scheduleCron: zod.string().nonempty({ message: "Schedule is required" }),
  scheduleDelay: zod.number().min(0).max(300),
};

const getDefaultValues = (data?: XFormData): XFormData => ({
  name: data?.name || "My Schedule",
  scheduleCron:
    data?.scheduleCron ||
    `30 8 * * * {${Intl.DateTimeFormat().resolvedOptions().timeZone}}`,
  scheduleDelay: data?.scheduleDelay || `1`,
  messages: data?.messages || [],
  luck: data?.luck || `100`,
  images: data?.images || [],
  stickers: data?.stickers || [],
  recipients: data?.recipients || [{ value: "+4917645708000" }],
});
