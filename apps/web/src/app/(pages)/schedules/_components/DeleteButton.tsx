"use client";

import { startTransition } from "react";

import { Button } from "@sa/ui/button";

import { deleteAction } from "../_actions/deleteAction";

export default function DeleteButton({
  _id,
  onComplete,
}: {
  _id: string;
  onComplete?: (value: { _id: string } | null) => void;
}) {
  const onClick = () => {
    if (!confirm(`Are you sure to delete ${_id}?`)) return;
    startTransition(() => {
      deleteAction({ _id })
        .then(onComplete)
        .catch((error) => {
          console.log("error", error);
        });
    });
  };

  return (
    <Button onClick={onClick} variant="destructive" type="button">
      Delete
    </Button>
  );
}
