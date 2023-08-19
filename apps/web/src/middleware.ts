import { authMiddleware, clerkClient } from "@clerk/nextjs";

import { LINK_HANDLER_URL, SERVER_SEARCH_URI } from "@sa/utils/src/constants";
import { cacheItem } from "@sa/utils/src/simpleMemoryCache";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/nextjs/middleware for more information about configuring your middleware
export default authMiddleware({
  afterAuth: async (auth, req) => {
    if (req.url.includes("/link")) return;
    console.log("User logged in", auth.userId);

    const user = await clerkClient.users.getUser(auth.userId!);
    const userPhoneNumber = user.phoneNumbers.find(
      (p) => p.id === user.primaryPhoneNumberId,
    )?.phoneNumber;

    const resp = await fetch(
      `${SERVER_SEARCH_URI}?numbers=${encodeURIComponent(
        userPhoneNumber || "",
      )}`,
      {
        method: "GET",
        headers: {
          Auth: process.env.SERVER_TOKEN!,
        },
        credentials: "include",
      },
    );
    const data = await resp.json();
    const isRegistered = data?.find(
      (d: { number: string; registered: boolean }) => d.registered,
    );
    cacheItem("isRegistered", isRegistered);
    if (isRegistered) return;

    // Redirect users who did not link their devices yet
    return new Response(null, {
      status: 302,
      headers: { Location: LINK_HANDLER_URL },
    });
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next|api).*)", "/(trpc)(.*)"],
};
