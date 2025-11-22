
import { type ActionFunctionArgs, Link, redirect, useFetcher } from 'react-router'
import { Button, Card, Inset, Text, TextField } from '@radix-ui/themes'
import { supabase } from './lib/supabase/client'
import { Label } from "radix-ui"

export const action = async ({ request }: ActionFunctionArgs) => {

  const formData = await request.formData()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: error instanceof Error ? error.message : 'An error occurred',
    }
  }

  // Update this route to redirect to an authenticated route. The user already has an active session.
  return redirect('/App', {  })
}

export default function Login() {
  const fetcher = useFetcher<typeof action>()

  const error = fetcher.data?.error
  const loading = fetcher.state === 'submitting'

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm mx-auto items-center justify-centert">
        <div className="flex flex-col gap-6">
          <Card>
              <Text className="text-lg">Login</Text>
              
              <fetcher.Form method="post">
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label.Root className="text-sm" htmlFor="email">Email</Label.Root>
                    <TextField.Root
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label.Root className='text-sm' htmlFor="password">Password</Label.Root>
                      <Link
                        to="/forgot-password"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <TextField.Root id="password" type="password" name="password" required />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{' '}
                  <Link to="/sign-up" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </fetcher.Form>
            
          </Card>
        </div>
      </div>
    </div>
  )
}
