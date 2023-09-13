"use server";

import { createAction } from "./createAction";
import { deleteAction } from "./deleteAction";
import { type RemoteFormData } from "./getSchedules";

export async function updateAction(data: RemoteFormData) {
  await createAction(data);
  await deleteAction(data);
}
