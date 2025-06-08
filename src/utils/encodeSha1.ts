import { sha1 } from 'js-sha1'
export default function encodeSha1(input: string): number[] {
  const inputBytes = new TextEncoder().encode(input)
  const hashBytes = sha1.digest(inputBytes)
  return hashBytes
}
