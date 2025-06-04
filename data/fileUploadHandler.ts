import { MessageInputStore } from "@/store/messageInputStore";

export default function fileUploadHandler(
  files: FileList | undefined | null,
  messageInputStore: MessageInputStore
) {
  if (!files || files.length === 0) throw new Error("No files selected");
  const res = [];
  for (let i = 0; i < files.length; i++) {
    const file = files.item(i);
    if (!file) continue;
    res.push(file);
    console.log(file?.name);
  }
  messageInputStore.setFileUpload(res);
}
