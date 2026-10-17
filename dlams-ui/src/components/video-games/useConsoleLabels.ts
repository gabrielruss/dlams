import { useQuery } from "@tanstack/react-query"

import { consoleLabelListQueryOptions } from "@/lib/api/consoleLabels"

function useConsoleLabels(enabled: boolean): string[] {
  const { data } = useQuery({
    ...consoleLabelListQueryOptions(),
    enabled,
  })
  return data?.labels.map((label) => label.name) ?? []
}

export default useConsoleLabels
