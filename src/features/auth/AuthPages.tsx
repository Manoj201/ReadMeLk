import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FirebaseError } from 'firebase/app'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LotusMark } from '@/components/motifs'
import { authErrorKey, signInEmail, signInGoogle, signUpEmail } from './authApi'

function useAfterAuth() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  return () => {
    const next = params.get('next')
    navigate(next ? decodeURIComponent(next) : '/', { replace: true })
  }
}

function GoogleButton({ label, onError }: { label: string; onError: (k: string) => void }) {
  const [busy, setBusy] = useState(false)
  const done = useAfterAuth()
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        try {
          await signInGoogle()
          done()
        } catch (err) {
          onError(err instanceof FirebaseError ? authErrorKey(err.code) : 'errors.generic')
        } finally {
          setBusy(false)
        }
      }}
    >
      {label}
    </Button>
  )
}

export function SignInPage() {
  const { t } = useTranslation('auth')
  const done = useAfterAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErrorKey(null)
    try {
      await signInEmail(email, password)
      done()
    } catch (err) {
      setErrorKey(err instanceof FirebaseError ? authErrorKey(err.code) : 'errors.generic')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container flex max-w-md flex-col items-center py-12">
      <LotusMark className="mb-4 h-10 w-10" />
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('signIn.title')}</CardTitle>
          <CardDescription>{t('signIn.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t('signIn.email')}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t('signIn.password')}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {errorKey ? <p className="text-sm text-destructive">{t(errorKey)}</p> : null}
            <Button type="submit" className="w-full" disabled={busy}>
              {t('signIn.submit')}
            </Button>
          </form>
          <div className="relative text-center text-xs uppercase text-muted-foreground">
            <span className="bg-card px-2">{t('signIn.divider')}</span>
          </div>
          <GoogleButton label={t('signIn.google')} onError={setErrorKey} />
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/signup" className="underline underline-offset-4">
              {t('signIn.noAccount')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function SignUpPage() {
  const { t } = useTranslation('auth')
  const done = useAfterAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErrorKey(null)
    try {
      await signUpEmail(name, email, password)
      done()
    } catch (err) {
      setErrorKey(err instanceof FirebaseError ? authErrorKey(err.code) : 'errors.generic')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container flex max-w-md flex-col items-center py-12">
      <LotusMark className="mb-4 h-10 w-10" />
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('signUp.title')}</CardTitle>
          <CardDescription>{t('signUp.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">{t('signUp.name')}</Label>
              <Input
                id="name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t('signUp.email')}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t('signUp.password')}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {errorKey ? <p className="text-sm text-destructive">{t(errorKey)}</p> : null}
            <Button type="submit" className="w-full" disabled={busy}>
              {t('signUp.submit')}
            </Button>
          </form>
          <GoogleButton label={t('signUp.google')} onError={setErrorKey} />
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/signin" className="underline underline-offset-4">
              {t('signUp.hasAccount')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
