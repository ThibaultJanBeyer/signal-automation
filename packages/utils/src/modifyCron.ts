import cronParser from "cron-parser";

export const addMinutes = (cronExpression: string, minutes: number) => {
  const parsed = cronParser.parseExpression(cronExpression);
  const date = parsed.next().toDate();
  date.setMinutes(date.getMinutes() + minutes);
  const fields = JSON.parse(JSON.stringify(parsed.fields));
  fields.hour = [date.getHours()];
  fields.minute = [date.getMinutes()];
  const modifiedInterval = cronParser.fieldsToExpression(fields);
  return modifiedInterval.stringify();
};
