/* eslint-disable import/no-anonymous-default-export */

export interface Env {
  SERVER_TOKEN: string;
  SERVER_BASE_URI: string;
}

// endpoint to fetch the newest signal data
// return them to the webapp

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    const providedToken = request.headers.get("Auth");
    if (providedToken !== env.SERVER_TOKEN)
      return new Response("nope token", { status: 401 });
    if (request.method === "POST" && url.pathname === "/receive") {
      return fetch(`${env.SERVER_BASE_URI}/v1/receive`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Auth: env.SERVER_TOKEN,
        },
      });
    }

    return new Response("nope", { status: 404 });
  },
};
