import { MessageInputStore } from "@/store/messageInputStore";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";

export default function previewFileUploadHandler(
  files: FileList | undefined | null,
  messageInputStore: MessageInputStore
) {
  if (!files || files.length === 0) return;
  const res = [];
  for (let i = 0; i < files.length; i++) {
    const file = files.item(i);
    if (!file) continue;
    if (!file.type.includes("image")) {
      toast.info("Only images are supported");
      continue;
    }
    if (messageInputStore.fileUpload.find((el) => el.name === file.name)) {
      toast.info("File already uploaded");
      continue;
    }

    messageInputStore.addFileUpload({
      file: file,
      messageId: messageInputStore.messageId,
      id: uuid(),
      createdAt: new Date(),
      editedAt: new Date(),
      name: file.name,
      status: "pending",
    });

    res.push(file);
    console.log(file?.name);
  }
}
