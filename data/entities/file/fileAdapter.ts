import { convex } from "@/components/ConvexClientProvider";
import { api } from "@/convex/_generated/api";
import { Data, ServerData } from "@/types/data/data";
import { DefaultAdapter } from "../default/defaultAdapter";
import { Adapter } from "../interface";
import { LocalFileType } from "@/types/data/file";

async function uploadFileHandler(file: Blob) {
  const url = await convex.mutation(api.files.generateUploadUrl);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });
  const {
    storageId,
  }: {
    storageId: string | null | undefined;
  } = await res.json();
  if (!storageId) throw new Error("file upload fail");
  return storageId;
}

async function serveFile(storageId: string) {
  const getImageUrl = new URL(
    `${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/getImage`
  );
  getImageUrl.searchParams.set("storageId", storageId);
  const res = await fetch(getImageUrl);
  const blob = await res.blob();
  return blob;
}

export class FileAdapter extends DefaultAdapter implements Adapter {
  async toServer(data: Partial<Data>) {
    if (data.type != "file") throw new Error("not file")
    const { file, ...rest } = data;
    let res = rest;
    const storageId = await uploadFileHandler(file!);
    res.storageId = storageId;
    return super.toServer(res) as Partial<ServerData>;
  }
  async toClient(data: Partial<ServerData>) {
    let { ...rest } = data;
    const res = rest;
    if ("storageId" in res) {
      if (!res.storageId) throw new Error("now storageId");
      //@ts-ignore
      res.file = await serveFile(res.storageId);
    }
    return super.toClient(res) as Partial<Data>;
  }
}
