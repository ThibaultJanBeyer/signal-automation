"use client";

import { startTransition } from "react";
import * as Form from "@radix-ui/react-form";

import { Button } from "@sa/ui/button";

import { type RemoteFormData } from "../_actions/getSchedules";
import { updateAction } from "../_actions/updateAction";
import DeleteButton from "./DeleteButton";
import StandupsFormFields, { type XFormData } from "./FormFields";

export const UpdateForm = ({ data: remoteData }: { data: RemoteFormData }) => {
  const onSubmit = (data: XFormData) => {
    startTransition(() => {
      updateAction({ ...remoteData, ...data }).catch((error) => {
        console.log("error", error);
      });
    });
  };

  return (
    <StandupsFormFields onSubmit={onSubmit} data={remoteData}>
      <div className="mt-10 grid grid-cols-2 gap-10">
        <Form.Submit asChild>
          <Button type="submit" variant="outlinePrimary" loading={false}>
            Update Schedule
          </Button>
        </Form.Submit>
        <DeleteButton _id={remoteData._id} />
      </div>
    </StandupsFormFields>
  );
};
