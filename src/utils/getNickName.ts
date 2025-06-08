export default function (nickname?: string | null, userId?: string | null) {
  const result = nickname || `用户${userId?.slice(-4) || '-'}`
  return result
}
