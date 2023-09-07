import React from "react";
import Link from "next/link";

import { Button } from "@sa/ui/button";
import { LINK_PATH } from "@sa/utils/src/constants";

export default function Home() {
  return (
    <main className="w-full px-16 py-10">
      Welcome. If you have any issues or something does not seem to work, try
      re-linking your number:{" "}
      <Link href={`${LINK_PATH}`} className="underline">
        Link Number
      </Link>{" "}
      If the issue still persists, please open an issue on{" "}
      <Link
        href="https://github.com/ThibaultJanBeyer/signal-automation"
        className="underline"
      >
        GitHub
      </Link>
    </main>
  );
}
