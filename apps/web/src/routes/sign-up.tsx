import { Link, useSearchParams } from 'react-router'
import { Button, Card, Grid, Text, TextField } from '@radix-ui/themes'
import { Label } from "radix-ui"
import { useState } from 'react'
import { passwordCheck } from "@repo/validators";

export default function SignUp() {
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get("__invite_code");
  const [success, setSuccess] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [confirm, setConfirm] = useState<string>("")

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSuccess(false)
    setLoading(true)
    setError("")

    try {
      if (!password || !passwordCheck(password)) {
        setError("Password does not meet requirements");
        return;
      }
      if (password != confirm) {
        setError("Password confirmation failed");
        return;
      }
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password, confirm: confirm, invite_code: inviteCode })
      });
      const content = await response.json();

      if (content.error) {
        setError(content.error instanceof Error ? content.error.message : 'An error occurred')
        return
      }
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          {success ? (
            <Card>
              <Grid>
                <Text className="text-2xl">Thank you for signing up!</Text>
                <Text>Check your email to confirm</Text>
              </Grid>
              <Grid>
                <p className="text-sm text-muted-foreground">
                  You&apos;ve successfully signed up. Please check your email to confirm your
                  account before signing in.
                </p>
              </Grid>
            </Card>
          ) : (
            <Card>
              <Grid>
                <Text className="text-2xl">Sign up</Text>
                <Text>Create a new account</Text>
              </Grid>
              <Grid>
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label.Root htmlFor="email">Email</Label.Root>
                      <TextField.Root
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="m@example.com"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label.Root htmlFor="password">Password</Label.Root>
                      </div>
                      <TextField.Root
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label.Root htmlFor="repeat-password">Confirm Password</Label.Root>
                      </div>
                      <TextField.Root
                        id="repeat-password"
                        name="repeat-password"
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Creating an account...' : 'Sign up'}
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="underline underline-offset-4">
                      Login
                    </Link>
                  </div>
                </form>
              </Grid>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
