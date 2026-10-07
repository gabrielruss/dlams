import { apiRequest } from "./client"
import type { Collection } from "@/types/collections"

export const collectionsApi = {
  list: () => apiRequest<{ collections: Collection[] }>("/collections"),
  create: (name: string) =>
    apiRequest<Collection>("/collections", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
}
