import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { RequireAuth, RequireRole } from '@/features/auth/guards'
import { HomePage } from '@/features/home/HomePage'
import { BooksBrowsePage } from '@/features/books/BooksBrowsePage'
import { BookDetailPage } from '@/features/books/BookDetailPage'
import { BookFormPage } from '@/features/books/BookFormPage'
import { AuthorsBrowsePage } from '@/features/authors/AuthorsBrowsePage'
import { AuthorProfilePage } from '@/features/authors/AuthorProfilePage'
import { AuthorFormPage } from '@/features/authors/AuthorFormPage'
import { SignInPage, SignUpPage } from '@/features/auth/AuthPages'
import { MePage } from '@/features/me/MePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { AdminLayout } from '@/features/admin/AdminLayout'
import { DashboardPage } from '@/features/admin/DashboardPage'
import { ReportsPage } from '@/features/admin/ReportsPage'
import { ReviewsAdminPage } from '@/features/admin/ReviewsAdminPage'
import { AuthorsAdminPage } from '@/features/admin/AuthorsAdminPage'
import { BooksAdminPage } from '@/features/admin/BooksAdminPage'
import { UsersAdminPage } from '@/features/admin/UsersAdminPage'

function ShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

export const router = createBrowserRouter([
  {
    element: <ShellLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/books', element: <BooksBrowsePage /> },
      {
        path: '/books/new',
        element: (
          <RequireAuth>
            <BookFormPage />
          </RequireAuth>
        ),
      },
      { path: '/books/:bookId', element: <BookDetailPage /> },
      {
        path: '/books/:bookId/edit',
        element: (
          <RequireAuth>
            <BookFormPage />
          </RequireAuth>
        ),
      },
      { path: '/authors', element: <AuthorsBrowsePage /> },
      { path: '/authors/:authorId', element: <AuthorProfilePage /> },
      {
        path: '/authors/:authorId/edit',
        element: (
          <RequireAuth>
            <AuthorFormPage />
          </RequireAuth>
        ),
      },
      {
        path: '/register/author',
        element: (
          <RequireAuth>
            <AuthorFormPage />
          </RequireAuth>
        ),
      },
      { path: '/signin', element: <SignInPage /> },
      { path: '/signup', element: <SignUpPage /> },
      {
        path: '/me',
        element: (
          <RequireAuth>
            <MePage />
          </RequireAuth>
        ),
      },
      {
        path: '/admin',
        element: (
          <RequireRole role="admin">
            <AdminLayout />
          </RequireRole>
        ),
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'reviews', element: <ReviewsAdminPage /> },
          { path: 'authors', element: <AuthorsAdminPage /> },
          { path: 'books', element: <BooksAdminPage /> },
          { path: 'users', element: <UsersAdminPage /> },
        ],
      },
      { path: '/404', element: <NotFoundPage /> },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
])
