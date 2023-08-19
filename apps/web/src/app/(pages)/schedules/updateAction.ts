"use server";

import { createAction } from "./createAction";
import { deleteAction } from "./deleteAction";
import { type FormData } from "./FormFields";

export async function updateAction(data: FormData & { id: string }) {
  await deleteAction({ id: data.id });
  await createAction(data);
}
