function parsingQueryParameters(query: string): Record<string, string> {
  if (typeof window === 'undefined') {
    return {}
  }

  return query
    .replace(/^\?/, '')
    .split('&')
    .reduce((acc, item) => {
      const [key, value] = item.split('=')
      return { ...acc, [key]: value }
    }, {})
}

export default parsingQueryParameters
