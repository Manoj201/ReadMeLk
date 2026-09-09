/** Controlled genre vocabulary. See .claude/planning/03-data-model.md. */
export interface GenreOption {
  value: string
  en: string
  si: string
}

export const GENRES: GenreOption[] = [
  { value: 'fiction', en: 'Fiction', si: 'ප්‍රබන්ධ' },
  { value: 'novel', en: 'Novel', si: 'නවකතා' },
  { value: 'short-stories', en: 'Short Stories', si: 'කෙටිකතා' },
  { value: 'poetry', en: 'Poetry', si: 'කවි' },
  { value: 'children', en: 'Children', si: 'ළමා' },
  { value: 'young-adult', en: 'Young Adult', si: 'තරුණ' },
  { value: 'history', en: 'History', si: 'ඉතිහාසය' },
  { value: 'biography', en: 'Biography & Memoir', si: 'චරිතාපදාන' },
  { value: 'politics', en: 'Politics', si: 'දේශපාලනය' },
  { value: 'religion-philosophy', en: 'Religion & Philosophy', si: 'ආගම හා දර්ශනය' },
  { value: 'science', en: 'Science', si: 'විද්‍යාව' },
  { value: 'academic', en: 'Education / Academic', si: 'අධ්‍යාපනික' },
  { value: 'translation', en: 'Translation', si: 'පරිවර්තන' },
  { value: 'drama', en: 'Drama', si: 'නාට්‍ය' },
  { value: 'folklore', en: 'Folklore', si: 'ජනකතා' },
  { value: 'essays', en: 'Essays', si: 'රචනා' },
  { value: 'self-help', en: 'Self-Help', si: 'ස්වයං සංවර්ධන' },
  { value: 'other', en: 'Other', si: 'වෙනත්' },
]

const BY_VALUE = new Map(GENRES.map((g) => [g.value, g]))

export function genreLabel(value: string, lang: 'si' | 'en'): string {
  return BY_VALUE.get(value)?.[lang] ?? value
}
