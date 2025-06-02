import PageContent from "@/components/PageContent";

import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const token = await (await auth()).getToken({ template: "convex" });
  const chatsPromise = fetchQuery(
    api.chats.getAll,
    {},
    {
      token: token || undefined,
    }
  );
  const messagesPromise = fetchQuery(
    api.messages.getAll,
    {},
    { token: token || undefined }
  );
  const [rawChats, rawMessages] = await Promise.all([
    chatsPromise,
    messagesPromise,
  ]);
  const chats = rawChats.map((el) => ({
    ...el,
    createdAt: new Date(el.createdAt),
    editedAt: new Date(el.editedAt),
  }));
  const messages = rawMessages.map((el) => ({
    ...el,
    createdAt: new Date(el.createdAt),
    editedAt: new Date(el.editedAt),
  }));
  return <PageContent chats={chats} messages={messages} />;
}
