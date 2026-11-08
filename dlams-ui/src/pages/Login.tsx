import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { loginSchema, type LoginFormValues } from "@/schemas/auth"
import { Link, useNavigate } from "react-router-dom"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  useLogin,
  useStartDemoSession,
} from "@/components/auth/hooks/useAuthQueries"
import BrandLogo from "@/components/BrandLogo"
import { routes } from "@/lib/routes"

function Login() {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const demoSessionMutation = useStartDemoSession()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onFormSubmit = (data: LoginFormValues) => {
    demoSessionMutation.reset()
    loginMutation.mutate(data, { onSuccess: () => navigate(routes.home) })
  }

  const isBusy =
    form.formState.isSubmitting ||
    loginMutation.isPending ||
    demoSessionMutation.isPending
  const error = loginMutation.error ?? demoSessionMutation.error

  const onDemoClick = () => {
    loginMutation.reset()
    demoSessionMutation.mutate(undefined, {
      onSuccess: () => navigate(routes.home),
    })
  }

  return (
    <main className="relative grid min-h-dvh grid-cols-[minmax(0,1fr)] grid-rows-[minmax(6rem,1fr)_auto_minmax(6rem,1fr)] justify-items-center overflow-hidden px-4 md:flex md:min-h-screen md:items-center md:justify-center">
      <BrandLogo
        className="pointer-events-none relative mb-6 mt-4 min-h-0 w-full text-foreground md:absolute md:inset-0 md:m-0 md:text-foreground/10"
        sideClassName="text-red md:text-red/15"
      />
      <Card className="relative w-full max-w-md bg-card/80">
        <CardHeader>
          <CardTitle role="heading" aria-level={1}>
            Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onFormSubmit)}
            className="flex flex-col gap-4"
          >
            <Controller
              control={form.control}
              name="username"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="login-username">Username</FieldLabel>
                  <Input
                    type="text"
                    autoComplete="username"
                    {...field}
                    id="login-username"
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
                  <FieldLabel htmlFor="login-password">Password</FieldLabel>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    {...field}
                    id="login-password"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {error && (
              <div role="alert" className="text-sm text-destructive">
                {error.message}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isBusy}>
              {isBusy ? "Logging in..." : "Login"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isBusy}
              onClick={onDemoClick}
            >
              Try the demo
            </Button>
            <p className="text-center text-sm">
              Have an invitation?{" "}
              <Link className="underline" to={routes.register}>
                Create an account
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

export default Login
