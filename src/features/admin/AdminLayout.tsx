import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export function AdminLayout() {
  const { t } = useTranslation('admin')
  const tabs = [
    { to: '/admin', end: true, label: t('nav.dashboard') },
    { to: '/admin/reports', label: t('nav.reports') },
    { to: '/admin/reviews', label: t('nav.reviews') },
    { to: '/admin/authors', label: t('nav.authors') },
    { to: '/admin/books', label: t('nav.books') },
    { to: '/admin/users', label: t('nav.users') },
  ]

  return (
    <div className="container py-8">
      <nav className="mb-6 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
