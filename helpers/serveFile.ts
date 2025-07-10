export async function serveFile(storageId: string) {
  const getImageUrl = new URL(
    `${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/getImage`
  );
  getImageUrl.searchParams.set("storageId", storageId);
  console.log("getImageUrl", getImageUrl, getImageUrl.href);
  const res = await fetch(getImageUrl);
  const blob = await res.blob();
  return blob;
}
