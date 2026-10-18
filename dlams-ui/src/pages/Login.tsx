import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { loginSchema, type LoginFormValues } from "@/schemas/auth"
import { Link, useNavigate } from "react-router-dom"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLogin } from "@/components/auth/useAuthQueries"

function Login() {
  const navigate = useNavigate()
  const loginMutation = useLogin()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onFormSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, { onSuccess: () => navigate("/") })
  }

  const demoUsername = import.meta.env.VITE_DEMO_USERNAME
  const demoPassword = import.meta.env.VITE_DEMO_PASSWORD
  const isBusy = form.formState.isSubmitting || loginMutation.isPending

  const onDemoClick = () => {
    if (!demoUsername || !demoPassword) return
    loginMutation.mutate(
      { username: demoUsername, password: demoPassword },
      { onSuccess: () => navigate("/") },
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onFormSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
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
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {loginMutation.error && (
                <div role="alert" className="text-sm text-destructive">
                  {loginMutation.error.message}
                </div>
              )}
              <Button
                type="submit"
                className="w-full hover:bg-slate-700 hover:cursor-pointer"
                disabled={isBusy}
              >
                {isBusy ? "Logging in..." : "Login"}
              </Button>
              {demoUsername && demoPassword && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full hover:cursor-pointer"
                  disabled={isBusy}
                  onClick={onDemoClick}
                >
                  Try the demo
                </Button>
              )}
              <p className="text-center text-sm">
                Have an invitation?{" "}
                <Link className="underline" to="/register">
                  Create an account
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
