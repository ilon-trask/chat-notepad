export default async function tryCatch<T>(
  promise: Promise<T>
): Promise<[null, T] | [Error, null]> {
  return promise
    .then((data) => [null, data] as [null, T])
    .catch((error) => [error, null]);
}
