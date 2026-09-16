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
import { ThemeToggle } from '@/components/ThemeToggle'
import { BrandMark, MotifDivider } from '@/components/motifs'
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
              'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white',
              isActive && 'bg-white/10 font-semibold text-brand-accent',
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
      <Button asChild variant="ghost" size="sm">
        <Link to="/signin">{t('nav.signIn')}</Link>
      </Button>
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
      <header
        className={cn(
          'sticky top-0 z-40 text-white shadow-[0_2px_24px_-4px_hsl(var(--header-glow)/0.45)]',
          'bg-[linear-gradient(115deg,hsl(var(--header-gradient-1))_0%,hsl(var(--header-gradient-2))_45%,hsl(var(--header-gradient-3))_100%)]',
          'relative after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-brand-accent/70 after:to-transparent',
        )}
      >
        <div className="container flex h-16 items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-serif text-lg font-semibold">
            <BrandMark className="text-white" />
            <span>{t('app.name')}</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <MainNav />
          </nav>
          <div className="ml-auto flex items-center gap-1">
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
          <div className="border-t border-white/10 bg-[hsl(var(--header-gradient-1))] text-white md:hidden">
            <div className="container flex flex-col gap-1 py-3">
              <MainNav onNavigate={() => setOpen(false)} />
              <div className="mt-2 flex items-center justify-end">
                <UserMenu />
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main className="flex-1">{children}</main>

      <footer
        className={cn(
          'relative mt-16 text-white',
          'bg-[linear-gradient(115deg,hsl(var(--header-gradient-3))_0%,hsl(var(--header-gradient-2))_55%,hsl(var(--header-gradient-1))_100%)]',
          'before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-brand-accent/70 before:to-transparent',
        )}
      >
        <div className="container grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-serif text-lg font-semibold">
              <BrandMark className="text-white" />
              <span>{t('app.name')}</span>
            </Link>
            <p className="max-w-xs text-sm text-white/70">{t('app.tagline')}</p>
            <MotifDivider className="max-w-[8rem] text-white/20" />
            <p className="text-xs uppercase tracking-wide text-white/50">
              {t('footer.heritage')}
            </p>
          </div>

          <nav aria-label={t('footer.exploreHeading')} className="flex flex-col gap-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-accent">
              {t('footer.exploreHeading')}
            </p>
            <Link to="/" className="text-sm text-white/75 transition-colors hover:text-white">
              {t('nav.home')}
            </Link>
            <Link
              to="/books"
              className="text-sm text-white/75 transition-colors hover:text-white"
            >
              {t('nav.books')}
            </Link>
            <Link
              to="/authors"
              className="text-sm text-white/75 transition-colors hover:text-white"
            >
              {t('nav.authors')}
            </Link>
          </nav>

          <nav aria-label={t('footer.accountHeading')} className="flex flex-col gap-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-accent">
              {t('footer.accountHeading')}
            </p>
            <Link
              to="/signin"
              className="text-sm text-white/75 transition-colors hover:text-white"
            >
              {t('nav.signIn')}
            </Link>
            <Link
              to="/register/author"
              className="text-sm text-white/75 transition-colors hover:text-white"
            >
              {t('nav.becomeAuthor')}
            </Link>
          </nav>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-accent">
              {t('footer.preferencesHeading')}
            </p>
            <div className="flex flex-wrap items-center gap-1">
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container flex flex-col items-center gap-2 py-6 text-xs text-white/60 sm:flex-row sm:justify-between">
            <p>
              {t('footer.copyright', { year: new Date().getFullYear(), name: t('app.name') })} ·{' '}
              {t('footer.rights')}
            </p>
            <p>{t('footer.builtWith')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
