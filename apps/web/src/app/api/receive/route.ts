import { NextResponse } from "next/server";
import lz from "lz-string";

import { SERVER_RECEIVE_URI } from "@sa/utils/src/constants";

import { type InternalUser } from "@/lib/getUser";
import { removeEmpty } from "@/lib/helpers";
import { redis } from "@/lib/redis";

export async function GET() {
  return new NextResponse("Hello world!");
}

export async function POST(req: Request) {
  const auth = req.headers.get("Auth");
  if (auth !== process.env.SERVER_TOKEN)
    return new NextResponse("Missing Auth", { status: 401 });

  const users = (await redis.get(`users`)) as { [key: string]: InternalUser };

  for (const userId in users) {
    if (Object.prototype.hasOwnProperty.call(users, userId)) {
      const user = users[userId]!;
      const resp = await fetch(`${SERVER_RECEIVE_URI}/${user.phoneNumber}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Auth: auth,
        },
        credentials: "include",
      });
      const result = await resp.json();

      const extracted = messageExtractionTeam(result);
      console.log("extracted", extracted);

      if (extracted.length > 0)
        await redis.set(
          `recent_messages_${userId}`,
          lz.compress(JSON.stringify(extracted)),
          { ex: 60 * 60 * 3 },
        );
    }
  }

  return new NextResponse("Success", { status: 200 });
}

type ReturnedMessage = {
  message?: string;
  sticker?: string;
  quoted?: {
    text?: string;
    attachments?: {
      contentType?: string;
      filename?: string;
      id?: string;
    }[];
    sticker?: string;
  };
  attachments?: {
    contentType?: string;
    filename?: string;
    id?: string;
  }[];
};

export type ExtractedMessage = {
  received?: ReturnedMessage;
  sent?: ReturnedMessage;
  timestamp: number;
  sourceName: string;
};

const messageExtractionTeam = (
  messages: Partial<PotentialMessage[]>,
): ExtractedMessage[] => {
  const getAttachments = (m?: Partial<Attachment[]>) => {
    return m?.map((a) => ({
      filename: a?.filename,
      id: a?.id,
      contentType: a?.contentType,
    }));
  };

  const getSticker = (m?: Partial<Sticker>) => {
    if (!m) return undefined;
    return `${m?.packId}:${m?.stickerId}`;
  };

  const getRelevance = (m?: Partial<BaseMessage>) => {
    return {
      message: m?.message,
      sticker: getSticker(m?.sticker),
      quoted: {
        text: m?.quote?.text,
        attachments: getAttachments(m?.quote?.attachments),
        sticker: getSticker(m?.quote?.sticker),
      },
      attachments: getAttachments(m?.attachments),
    };
  };

  return messages.flatMap((m) => {
    const message = removeEmpty(
      removeEmpty({
        timestamp: m?.envelope?.timestamp || 0,
        received: getRelevance(m?.envelope?.dataMessage),
        sent: getRelevance(m?.envelope?.syncMessage?.sentMessage),
        sourceName: m?.envelope?.sourceName || "Unknown",
      }),
    );

    if (!message?.received && !message?.sent) {
      console.info("untracked message", JSON.stringify(m, null, 2));
      return [];
    }

    return [message];
  });
};

type Sticker = {
  packId: string;
  stickerId: number;
};

type Quote = {
  id: number;
  author: string;
  authorNumber: string;
  authorUuid: string;
  text: string;
  attachments: Attachment[];
  sticker: Sticker;
};

type Attachment = {
  contentType: string;
  filename: string;
  id: string;
  size: number;
  width: number;
  height: number;
  caption?: string;
  uploadTimestamp?: number;
};

type BaseMessage = {
  message: string;
  sticker?: Sticker;
  quote?: Quote;
  attachments?: Attachment[];
};

export type PotentialMessage = {
  envelope: {
    source: string;
    sourceNumber: string;
    sourceUuid: string;
    sourceName: string; //<=
    sourceDevice: number;
    timestamp: number;
    receiptMessage?: {
      when: number;
      isDelivery: boolean;
      isRead: boolean;
      isViewed: boolean;
      timestamps: [number];
    };
    dataMessage?: BaseMessage & {
      timestamp: number;
      expiresInSeconds: number;
      viewOnce: boolean;
    };
    syncMessage?: {
      readMessages?: [
        {
          sender: string;
          senderNumber: string;
          senderUuid: string;
          timestamp: number;
        },
      ];
      sentMessage?: BaseMessage & {
        destination: string;
        destinationNumber: string;
        destinationUuid: string;
        timestamp: number;
        expiresInSeconds: number;
        viewOnce: boolean;
      };
    };
  };
  account: string;
};