import { ChatUpdate, LocalChat } from "@/types/chat.types";
import { v4 as uuid } from "uuid";
import { LocalDBService } from "./localDBService";
import { CHAT_LABEL } from "@/constants/labels";
import { RemoteDBService } from "./remoteDBService";
import { convex } from "@/components/ConvexClientProvider";
import DeleteService from "./deleteService";
import isOnline from "@/helpers/isOnline";
import MessageService from "./messageService";

class ChatService {
  localDBService: LocalDBService<typeof CHAT_LABEL>;
  remoteDBService: RemoteDBService<typeof CHAT_LABEL>;
  deleteService: DeleteService;
  messageService: MessageService;

  constructor(deleteService: DeleteService, messageService: MessageService) {
    this.localDBService = new LocalDBService<typeof CHAT_LABEL>(CHAT_LABEL);
    this.remoteDBService = new RemoteDBService<typeof CHAT_LABEL>(
      convex,
      CHAT_LABEL
    );
    this.deleteService = deleteService;
    this.messageService = messageService;
  }

  async getAllChats() {
    const chats = await this.localDBService.getAll();
    return chats.toSorted(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createChat(name: string) {
    const newChat = {
      id: uuid(),
      name,
      createdAt: new Date(),
      editedAt: new Date(),
      status: "pending",
    } satisfies LocalChat;
    let chat = await this.localDBService.create(newChat);

    if (isOnline()) {
      await this.remoteDBService
        .create({ id: chat.id, name: chat.name })
        .then(async (el) => {
          const newChat = {
            ...el,
            createdAt: new Date(el.createdAt),
            editedAt: new Date(el.editedAt),
            status: "server",
          } satisfies LocalChat;
          await this.localDBService.update(newChat);
          chat = newChat;
        });
    }
    return chat;
  }

  async deleteChat(id: string) {
    if (isOnline()) {
      this.remoteDBService.delete(id);
    } else {
      this.deleteService.create({
        id: uuid(),
        entityId: id,
        type: CHAT_LABEL,
      });
    }
    await this.messageService.deleteChatMessages(id);
    await this.localDBService.delete(id);
  }

  async updateChat(data: ChatUpdate) {
    const chat = (await this.localDBService.getAll()).find(
      (el) => el.id == data.id
    );
    if (!chat) throw new Error("Chat not found");
    const newChat = {
      ...chat,
      name: data.name,
      editedAt: new Date(),
    } satisfies LocalChat;
    if (isOnline()) {
      this.remoteDBService
        .update({
          id: newChat.id,
          name: newChat.name,
        })
        .then(async (el) => {
          const newChat = {
            ...el,
            createdAt: new Date(el.createdAt),
            editedAt: new Date(el.editedAt),
            status: "server",
          } satisfies LocalChat;
          await this.localDBService.update(newChat);
        });
    }
    const res = await this.localDBService.update(newChat);
  }
}

export default ChatService;
