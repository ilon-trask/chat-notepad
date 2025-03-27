export default async function DBResPromise<T>(req: IDBRequest<T>): Promise<T> {
  const res = await new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  if (res instanceof DOMException) throw res;
  return res as T;
}
