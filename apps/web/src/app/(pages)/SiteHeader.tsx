import * as React from "react";
import Link from "next/link";
import {
  auth,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

import { Button } from "@sa/ui/button";
import {
  HISTORY_PATH,
  LINK_PATH,
  SCHEDULES_PATH,
} from "@sa/utils/src/constants";

export function SiteHeader() {
  const { userId } = auth();
  return (
    <>
      <header className="pointer-events-none fixed top-0 z-40 w-full">
        <div className="m-auto grid grid-cols-[auto_1fr_auto] p-4">
          <div className="pointer-events-auto">
            <Button asChild variant="ghost">
              <Link href={`/`}>SA</Link>
            </Button>
          </div>
          <div></div>
          <div className="pointer-events-auto flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <SignedIn>
                <Button asChild variant="outline">
                  <Link href={`${LINK_PATH}`}>Link Number</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`${SCHEDULES_PATH}`}>Schedules</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`${HISTORY_PATH}`}>History</Link>
                </Button>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <Button asChild variant="outline" className="mr-5">
                  <div>
                    <SignInButton />
                  </div>
                </Button>
                <Button asChild variant="outline">
                  <div>
                    <SignUpButton />
                  </div>
                </Button>
              </SignedOut>
            </nav>
          </div>
        </div>
      </header>
      <div className="mb-28"></div>
    </>
  );
}
