export default async function getWebsocketMessage<T>(data: Blob): Promise<T> {
  const text = await data.text();  // Blob in Text konvertieren
  return JSON.parse(text) as T; // TODO make use of
}