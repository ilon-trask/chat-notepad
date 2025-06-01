export const CHAT_LABEL = "chat" as const;
export const MESSAGE_LABEL = "message" as const;
export const DELETE_LABEL = "delete" as const;

export const LABELS = [CHAT_LABEL, MESSAGE_LABEL] as const;
export const SYSTEM_LABELS = [DELETE_LABEL] as const;
export const ALL_LABELS = [...LABELS, ...SYSTEM_LABELS] as const;
export const PLURALS = { 'chat': "chats", 'message': "messages" } as const;

export type Labels = typeof LABELS[number];
export type AllLabels = typeof ALL_LABELS[number];