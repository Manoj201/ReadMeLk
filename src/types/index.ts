import type { Timestamp } from 'firebase/firestore'

/** Mirrors .claude/planning/03-data-model.md. */

export type Role = 'reader' | 'author' | 'admin'
export type ContentLang = 'si' | 'en'
export type BookLang = 'si' | 'en' | 'bilingual'
export type TargetType = 'book' | 'author'
export type ReviewStatus = 'pending' | 'published' | 'removed'
export type ReportStatus = 'open' | 'actioned' | 'dismissed'
/** Admin approval gate for books and author profiles. */
export type ModerationStatus = 'pending' | 'approved' | 'rejected'

export interface AppUser {
  /** synthetic doc id — equals `uid` for users */
  id: string
  uid: string
  displayName: string
  email: string
  photoURL: string | null
  roles: Role[]
  authorProfileId: string | null
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export interface SocialLink {
  label: string
  url: string
}

export interface Author {
  id: string
  ownerUid: string
  nameEn: string
  nameSi: string
  bioEn: string
  bioSi: string
  photoURL: string | null
  coverURL: string | null
  birthYear: number | null
  location: string | null
  genres: string[]
  website: string | null
  socialLinks: SocialLink[]
  /** admin approval gate — only `approved` profiles are publicly visible */
  status: ModerationStatus
  verified: boolean
  featured: boolean
  bookCount: number
  ratingSum: number
  ratingCount: number
  ratingAvg: number
  bayesianScore: number
  reviewCount: number
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export interface Book {
  id: string
  authorId: string
  authorNameEn: string
  authorNameSi: string
  ownerUid: string
  titleEn: string
  titleSi: string
  descriptionEn: string
  descriptionSi: string
  coverURL: string | null
  isbn: string | null
  language: BookLang
  genres: string[]
  publishedYear: number | null
  publisher: string | null
  pageCount: number | null
  /** admin approval gate — only `approved` books are publicly visible */
  status: ModerationStatus
  featured: boolean
  ratingSum: number
  ratingCount: number
  ratingAvg: number
  bayesianScore: number
  reviewCount: number
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export type Rating = 1 | 2 | 3 | 4 | 5

export interface Review {
  id: string
  targetType: TargetType
  targetId: string
  bookId: string | null
  authorId: string | null
  rating: Rating
  titleEn: string | null
  titleSi: string | null
  body: string
  bodyLang: ContentLang
  isGuest: boolean
  authorUid: string | null
  reviewerName: string
  guestName: string | null
  status: ReviewStatus
  helpfulCount: number
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export type ReportReason = 'spam' | 'offensive' | 'off-topic' | 'not-a-review' | 'other'

export interface Report {
  id: string
  reviewId: string
  targetType: TargetType
  targetId: string
  reason: ReportReason
  note: string
  reporterUid: string | null
  status: ReportStatus
  actionedBy: string | null
  actionedAt: Timestamp | null
  createdAt: Timestamp | null
}

export type AdminActionType =
  | 'review.approve'
  | 'review.remove'
  | 'review.restore'
  | 'report.dismiss'
  | 'author.approve'
  | 'author.reject'
  | 'author.verify'
  | 'author.unverify'
  | 'author.edit'
  | 'author.delete'
  | 'book.approve'
  | 'book.reject'
  | 'book.edit'
  | 'book.delete'
  | 'author.feature'
  | 'author.unfeature'
  | 'book.feature'
  | 'book.unfeature'
  | 'user.grantAuthor'
  | 'user.revokeAuthor'

export interface AdminAction {
  id: string
  actorUid: string
  actorName: string
  action: AdminActionType
  targetType: 'review' | 'report' | 'author' | 'book' | 'user'
  targetId: string
  note: string | null
  createdAt: Timestamp | null
}
