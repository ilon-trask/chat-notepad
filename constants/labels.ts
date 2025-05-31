export const CHAT_LABEL = "chat" as const;
export const MESSAGE_LABEL = "message" as const;

export const LABELS = [CHAT_LABEL, MESSAGE_LABEL] as const;
export const PLURALS = { 'chat': "chats", 'message': "messages" } as const;

export type Labels = typeof LABELS[number];