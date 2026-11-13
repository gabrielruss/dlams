import { useQuery } from "@tanstack/react-query"

import { consoleLabelListQueryOptions } from "@/components/video-games/api/consoleLabels"

function useConsoleLabels(enabled: boolean) {
  const { data, isPending, isError, error } = useQuery({
    ...consoleLabelListQueryOptions(),
    enabled,
  })

  return {
    consoleLabels: data?.labels.map((label) => label.name) ?? [],
    isPending,
    isError,
    error,
  }
}

export default useConsoleLabels
