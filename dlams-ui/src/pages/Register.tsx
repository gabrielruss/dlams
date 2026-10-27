import { useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRegister } from "@/components/auth/useAuthQueries"
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
      `${window.location.pathname}${window.location.search}`
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
              <Button asChild>
                <Link to="/login">Go to login</Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onFormSubmit)}
                className="flex flex-col gap-4"
              >
                <FormField
                  control={form.control}
                  name="invitationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invitation code</FormLabel>
                      <FormControl>
                        <Input autoComplete="off" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input autoComplete="username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
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
            </Form>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

export default Register
