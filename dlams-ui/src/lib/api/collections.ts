import { apiRequest } from "./client"
import type { Collection, CollectionCreate } from "@/types/collections"

export const collectionsApi = {
  list: () => apiRequest<{ collections: Collection[] }>("/collections"),
  create: (data: CollectionCreate) =>
    apiRequest<Collection>("/collections", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}
