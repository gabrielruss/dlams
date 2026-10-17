import { queryOptions } from "@tanstack/react-query"

import type { ConsoleLabel } from "@/types/videoGames"
import { apiRequest } from "./client"

export const consoleLabelKeys = {
  all: ["console-labels"] as const,
}

export const consoleLabelsApi = {
  list: () => apiRequest<{ labels: ConsoleLabel[] }>("/console-labels"),
}

export const consoleLabelListQueryOptions = () =>
  queryOptions({
    queryKey: consoleLabelKeys.all,
    queryFn: consoleLabelsApi.list,
  })
