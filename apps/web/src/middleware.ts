import { authMiddleware } from "@clerk/nextjs";

import { LINK_HANDLER_URL, SERVER_SEARCH_URI } from "@sa/utils/src/constants";

import { getUser } from "@/lib/getUser";
import { redis } from "@/lib/redis";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/nextjs/middleware for more information about configuring your middleware
export default authMiddleware({
  afterAuth: async ({ userId }, req) => {
    if (req.url.includes("/link")) return;
    if (!userId) return;
    if (!(await isRegistered(userId))) {
      return new Response(null, {
        status: 302,
        headers: { Location: LINK_HANDLER_URL },
      });
    }
  },
});

const isRegistered = async (userId: string) => {
  if (await redis.exists(`isRegistered_${userId}`)) {
    if (await redis.get(`isRegistered_${userId}`)) return true;
    else return false;
  }

  const user = await getUser(userId);

  const resp = await fetch(
    `${SERVER_SEARCH_URI}/${user?.phoneNumber}?numbers=${encodeURIComponent(
      user?.phoneNumber || "",
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
  const isRegistered = Boolean(
    data?.find((d: { number: string; registered: boolean }) => d.registered),
  );
  await redis.set(
    `isRegistered_${userId}`,
    isRegistered,
    isRegistered ? {} : { ex: 25 },
  );
  return isRegistered;
};

export const config = {
  matcher: ["/((?!.*\\..*|_next|api).*)", "/(trpc)(.*)"],
};
