import { useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LanguageToggle } from '@/components/LanguageToggle'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LotusMark, MotifDivider, WovenStrip } from '@/components/motifs'
import { cn } from '@/lib/utils'
import { useAuthStore, hasRole } from '@/stores/authStore'
import { signOut } from '@/features/auth/authApi'

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function MainNav({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation()
  const links = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/books', label: t('nav.books') },
    { to: '/authors', label: t('nav.authors') },
  ]
  return (
    <>
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
              isActive && 'text-primary',
            )
          }
        >
          {l.label}
        </NavLink>
      ))}
    </>
  )
}

function UserMenu() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const status = useAuthStore((s) => s.status)
  const isAdmin = useAuthStore((s) => s.isAdminClaim) || hasRole(user, 'admin')

  if (status === 'loading') return null
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/signin">{t('nav.signIn')}</Link>
        </Button>
        <Button asChild size="sm">
          <Link to="/signup">{t('nav.signUp')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Avatar className="h-9 w-9">
            {user.photoURL ? <AvatarImage src={user.photoURL} alt="" /> : null}
            <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="truncate">{user.displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/me">{t('nav.myProfile')}</Link>
        </DropdownMenuItem>
        {hasRole(user, 'author') && user.authorProfileId ? (
          <>
            <DropdownMenuItem asChild>
              <Link to={`/authors/${user.authorProfileId}`}>{t('nav.myAuthorPage')}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/books/new">{t('nav.addBook')}</Link>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link to="/register/author">{t('nav.becomeAuthor')}</Link>
          </DropdownMenuItem>
        )}
        {isAdmin ? (
          <DropdownMenuItem asChild>
            <Link to="/admin">
              <ShieldCheck className="h-4 w-4" />
              {t('nav.admin')}
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>{t('nav.signOut')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-serif text-lg font-semibold">
            <LotusMark />
            <span>{t('app.name')}</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <MainNav />
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <LanguageToggle className="hidden sm:inline-flex" />
            <ThemeToggle />
            <div className="hidden md:block">
              <UserMenu />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={t('nav.menu')}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {open ? (
          <div className="border-t border-border bg-background md:hidden">
            <div className="container flex flex-col gap-1 py-3">
              <MainNav onNavigate={() => setOpen(false)} />
              <div className="mt-2 flex items-center justify-between">
                <LanguageToggle />
                <UserMenu />
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t border-border bg-card">
        <WovenStrip className="text-border" />
        <div className="container flex flex-col items-center gap-3 py-10 text-center">
          <LotusMark className="h-6 w-6" />
          <MotifDivider className="max-w-xs" />
          <p className="text-sm text-muted-foreground">{t('footer.heritage')}</p>
          <p className="text-xs text-muted-foreground">
            {t('app.name')} · {t('footer.rights')} · {t('footer.builtWith')}
          </p>
        </div>
      </footer>
    </div>
  )
}
