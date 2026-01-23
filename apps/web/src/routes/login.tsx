
import { Button, Card, Grid, Text, TextField } from '@radix-ui/themes'
import { Label } from "radix-ui"
import { useAuth } from '../lib/auth/authContext'
import { useState, type FormEvent } from 'react'

export default function Login() {
  const auth = useAuth()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const form = e.currentTarget
      const formData = new FormData(form)
      const emailValue = (formData.get('email') as string) ?? email
      const passwordValue = (formData.get('password') as string) ?? password

      const { error } = await auth.signIn(emailValue, passwordValue)

      if (error) {
        setError(error instanceof Error ? error.message : 'An error occurred')
        return
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm mx-auto items-center justify-centert">
        <div className="flex flex-col gap-6">
          <Card className='bg-neutral-200 dark:bg-black'>
            <Grid className='col-span-1 gap-6 p-2'>
              <Text className="text-lg">Welcome to Reverie Notes</Text>

              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label.Root className="text-sm" htmlFor="email">Email</Label.Root>
                    <TextField.Root id="email" name="email" type="email" placeholder="m@example.com" required
                      value={email} onChange={(e: any) => setEmail(e.target.value)} className=''/>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label.Root className='text-sm' htmlFor="password">Password</Label.Root>
                    </div>
                    <TextField.Root id="password" type="password" name="password" required value={password} onChange={(e: any) => setPassword(e.target.value)}/>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
              </form>

            </Grid>
          </Card>
        </div>
      </div>
    </div>
  )
}
