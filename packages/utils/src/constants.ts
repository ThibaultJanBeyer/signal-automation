export const SCHEDULES_PATH = "/schedules";

export const UPSTASH_SCHEDULES_URI = "https://qstash.upstash.io/v1/schedules";
export const UPSTASH_PUBLISH_PATH = "publish";
export const UPSTASH_PUBLISH_URI = `https://qstash.upstash.io/v1/${UPSTASH_PUBLISH_PATH}`;

export const SERVER_POST_URI = `${process.env.SERVER_BASE_URI}/v2/send`;
export const SERVER_SEARCH_URI = `${process.env.SERVER_BASE_URI}/v1/search`;
export const SERVER_QR_URI = `${process.env.SERVER_BASE_URI}/v1/qrcodelink?device_name=signal-automation`;

export const WEB_URI =
  process.env.NEXT_PUBLIC_WEB_URL || process.env.VERCEL_BRANCH_URL;

export const MESSAGE_HANDLER_URL = `https://${WEB_URI}/api`;
export const LINK_HANDLER_URL = `https://${WEB_URI}/link`;