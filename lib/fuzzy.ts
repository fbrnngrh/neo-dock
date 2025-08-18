export interface FuzzyMatch {
  score: number
  indices: number[]
}

export function fuzzyMatch(pattern: string, text: string): FuzzyMatch | null {
  const patternLower = pattern.toLowerCase()
  const textLower = text.toLowerCase()

  if (patternLower === "") {
    return { score: 1, indices: [] }
  }

  let patternIndex = 0
  let textIndex = 0
  const indices: number[] = []
  let score = 0
  let consecutiveMatches = 0

  while (patternIndex < patternLower.length && textIndex < textLower.length) {
    if (patternLower[patternIndex] === textLower[textIndex]) {
      indices.push(textIndex)
      consecutiveMatches++
      score += consecutiveMatches * 2 // Bonus for consecutive matches
      patternIndex++
    } else {
      consecutiveMatches = 0
    }
    textIndex++
  }

  // If we didn't match all pattern characters, no match
  if (patternIndex < patternLower.length) {
    return null
  }

  // Bonus for exact matches and matches at word boundaries
  if (textLower === patternLower) {
    score += 100
  } else if (textLower.startsWith(patternLower)) {
    score += 50
  }

  // Penalty for longer text (prefer shorter matches)
  score -= text.length * 0.1

  return { score, indices }
}

export function fuzzySearch<T>(
  items: T[],
  pattern: string,
  getText: (item: T) => string,
  limit = 10,
): Array<T & { fuzzyMatch: FuzzyMatch }> {
  if (!pattern.trim()) {
    return items.slice(0, limit).map((item) => ({
      ...item,
      fuzzyMatch: { score: 1, indices: [] },
    }))
  }

  const matches = items
    .map((item) => {
      const text = getText(item)
      const match = fuzzyMatch(pattern, text)
      return match ? { ...item, fuzzyMatch: match } : null
    })
    .filter((item): item is T & { fuzzyMatch: FuzzyMatch } => item !== null)
    .sort((a, b) => b.fuzzyMatch.score - a.fuzzyMatch.score)
    .slice(0, limit)

  return matches
}
