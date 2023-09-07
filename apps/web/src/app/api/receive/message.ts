import { removeEmpty } from "@/lib/helpers";

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
  status?: string;
  timestamp: number;
  sourceName: string;
  isSelf?: boolean;
};

export const messageExtractionTeam = (
  messages: Partial<PotentialMessage[]>,
  phoneNumber: string,
): ExtractedMessage[] => {
  if (!Array.isArray(messages)) {
    console.error(
      "messages is not an array",
      JSON.stringify(messages, null, 2),
    );
    return [];
  }
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

  const getStatus = (m?: Partial<ReceiptMessage> | Partial<ReadMessage>) => {
    if (!m) return undefined;
    if ("isRead" in m)
      return m?.isRead
        ? "read"
        : m?.isViewed
        ? "viewed"
        : m?.isDelivery
        ? "delivered"
        : undefined;
    else if ("sender" in m) return "sent";
  };

  return messages.flatMap((m) => {
    const message = removeEmpty(
      removeEmpty({
        timestamp: m?.envelope?.timestamp || 0,
        received: getRelevance(m?.envelope?.dataMessage),
        sent: getRelevance(m?.envelope?.syncMessage?.sentMessage),
        status: getStatus(
          m?.envelope?.receiptMessage ||
            m?.envelope?.syncMessage?.readMessages?.[0],
        ),
        isSelf: phoneNumber === m?.envelope?.sourceNumber,
        sourceName: m?.envelope?.sourceName || "Unknown",
      }),
    );

    if (!message?.received && !message?.sent && !message?.status) {
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
    receiptMessage?: ReceiptMessage;
    dataMessage?: BaseMessage & {
      timestamp: number;
      expiresInSeconds: number;
      viewOnce: boolean;
    };
    syncMessage?: {
      readMessages?: ReadMessage[];
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

type ReadMessage = {
  sender: string;
  senderNumber: string;
  senderUuid: string;
  timestamp: number;
};

type ReceiptMessage = {
  when: number;
  isDelivery: boolean;
  isRead: boolean;
  isViewed: boolean;
  timestamps: [number];
};
