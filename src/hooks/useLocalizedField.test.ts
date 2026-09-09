import { describe, expect, it } from 'vitest'
import { pickLocalized } from './useLocalizedField'

describe('pickLocalized', () => {
  it('returns the active language when present', () => {
    expect(pickLocalized('si', 'Hello', 'ආයුබෝවන්')).toEqual({
      value: 'ආයුබෝවන්',
      lang: 'si',
      isFallback: false,
    })
  })

  it('falls back to the other language and flags it', () => {
    expect(pickLocalized('si', 'Hello', '')).toEqual({
      value: 'Hello',
      lang: 'en',
      isFallback: true,
    })
  })

  it('returns an empty value when neither side is set', () => {
    expect(pickLocalized('en', '', null)).toEqual({ value: '', lang: null, isFallback: false })
  })
})
