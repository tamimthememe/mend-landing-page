type ClassValue = string | false | null | undefined

/** Minimal className joiner (shadcn-style `cn` without extra deps). */
export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(' ')
}
