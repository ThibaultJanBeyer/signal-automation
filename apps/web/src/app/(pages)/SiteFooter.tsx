import Link from "next/link";

import { CopyrightIcon, GithubIcon } from "@sa/ui/icons";

export function SiteFooter() {
  return (
    <footer className="pointer-events-none fixed bottom-0 z-40 grid w-full grid-cols-[auto_1fr_auto] gap-10 p-4 text-xs">
      <div className="pointer-events-auto">
        <CopyrightIcon className="inline-block h-3 w-3" /> SA
      </div>
      <div></div>
      <div className="pointer-events-auto hover:underline">
        <Link href="https://github.com/ThibaultJanBeyer/signal-automation">
          <GithubIcon className="inline-block h-3 w-3" /> Github
        </Link>
      </div>
    </footer>
  );
}
