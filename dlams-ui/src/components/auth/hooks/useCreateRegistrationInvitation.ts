import { useMutation } from "@tanstack/react-query"

import { authApi } from "@/lib/api/auth"

function useCreateRegistrationInvitation() {
  return useMutation({
    mutationFn: authApi.createRegistrationInvitation,
  })
}

export default useCreateRegistrationInvitation
