import { apiRequest } from "./client"
import type { ConsoleCreate, ConsoleRecord } from "@/types/videoGames"

export const consolesApi = {
  list: (collectionId: number) =>
    apiRequest<{ consoles: ConsoleRecord[] }>(
      `/collections/${collectionId}/consoles`
    ),
  create: (collectionId: number, data: ConsoleCreate) =>
    apiRequest<ConsoleRecord>(`/collections/${collectionId}/consoles`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (
    collectionId: number,
    consoleId: number,
    data: ConsoleCreate
  ) =>
    apiRequest<ConsoleRecord>(
      `/collections/${collectionId}/consoles/${consoleId}`,
      { method: "PUT", body: JSON.stringify(data) }
    ),
  delete: (collectionId: number, consoleId: number) =>
    apiRequest<void>(`/collections/${collectionId}/consoles/${consoleId}`, {
      method: "DELETE",
    }),
}
