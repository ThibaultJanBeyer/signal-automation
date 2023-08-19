"use-client";

import { useState } from "react";
import { Button } from "@sa/ui/button";
import { Edit3Icon } from "@sa/ui/icons";
import { Input } from "@sa/ui/input";
import { parseCustomCronString } from "@sa/utils/src/parseCustomCronString";
import { UseFormRegisterReturn, useWatch } from "react-hook-form";
import { Cron } from "react-js-cron";

type Props = {
  registered: UseFormRegisterReturn<string>;
  onChange: (val: string) => void;
};

export const CronPicker = ({ registered, onChange }: Props) => {
  const [showRaw, setShowRaw] = useState(false);

  const value = useWatch({ name: registered.name });
  const { cron, timeZone = "Etc/GMT" } = parseCustomCronString(value);
  const onChangeExpression = (val: string) =>
    val !== cron ? onChange(`${val} {${timeZone}}`) : null;
  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplate: `
          'input button'
          'select select' / 1fr auto
        `,
      }}
    >
      <div style={{ gridArea: "input" }}>
        <Cron
          clockFormat={"24-hour-clock"}
          defaultPeriod="week"
          leadingZero={true}
          className={`${showRaw ? "hidden" : ""} cron-picker`}
          clearButton={false}
          value={cron}
          setValue={onChangeExpression}
        />
        <Input
          {...registered}
          value={cron}
          onChange={(e) => onChangeExpression(e.target.value)}
          onBlur={(e) => onChangeExpression(e.target.value)}
          className={showRaw ? "" : "hidden"}
        />
      </div>
      <Button
        style={{ gridArea: "button " }}
        type="button"
        variant="ghost"
        onClick={() => {
          setShowRaw(!showRaw);
        }}
      >
        <Edit3Icon>Edit Raw Cron</Edit3Icon>
      </Button>
    </div>
  );
};
