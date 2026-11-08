import { useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Link } from "react-router-dom"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRegister } from "@/components/auth/hooks/useAuthQueries"
import { registerSchema, type RegisterFormValues } from "@/schemas/auth"

function Register() {
  const registerMutation = useRegister()
  const invitationFromUrl = useMemo(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1))
    return fragment.get("invite") ?? ""
  }, [])
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      invitationCode: invitationFromUrl,
      confirmPassword: "",
    },
  })

  useEffect(() => {
    if (!invitationFromUrl) return
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}`,
    )
  }, [invitationFromUrl])

  const onFormSubmit = ({
    username,
    password,
    invitationCode,
  }: RegisterFormValues) => {
    registerMutation.mutate({
      username,
      password,
      invitation_code: invitationCode,
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle role="heading" aria-level={1}>
            Create account
          </CardTitle>
        </CardHeader>
        <CardContent>
          {registerMutation.isSuccess ? (
            <div className="flex flex-col gap-4">
              <p role="status">Account created. You can now log in.</p>
              <Link className={buttonVariants()} to="/login">
                Go to login
              </Link>
            </div>
          ) : (
            <form
              onSubmit={form.handleSubmit(onFormSubmit)}
              className="flex flex-col gap-4"
            >
              <Controller
                control={form.control}
                name="invitationCode"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="register-invitation-code">
                      Invitation code
                    </FieldLabel>
                    <Input
                      autoComplete="off"
                      {...field}
                      id="register-invitation-code"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="username"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="register-username">
                      Username
                    </FieldLabel>
                    <Input
                      autoComplete="username"
                      {...field}
                      id="register-username"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="register-password">
                      Password
                    </FieldLabel>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      {...field}
                      id="register-password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="register-confirm-password">
                      Confirm password
                    </FieldLabel>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      {...field}
                      id="register-confirm-password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {registerMutation.error && (
                <p role="alert" className="text-sm text-destructive">
                  {registerMutation.error.message}
                </p>
              )}
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting || registerMutation.isPending
                }
              >
                {registerMutation.isPending
                  ? "Creating account..."
                  : "Create account"}
              </Button>
              <p className="text-center text-sm">
                <Link className="underline" to="/login">
                  Back to login
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

export default Register
