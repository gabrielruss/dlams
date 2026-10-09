export interface RegisterRequest {
  username: string
  password: string
  invitation_code: string
}

export interface RegistrationInvitation {
  invitation_code: string
  expires_at: string
}
