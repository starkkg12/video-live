export default function encodeBase64(input: number[]): string {
  let binary = ''
  for (let i = 0; i < input.length; i++) {
    binary += String.fromCharCode(input[i])
  }
  return btoa(binary)
}
