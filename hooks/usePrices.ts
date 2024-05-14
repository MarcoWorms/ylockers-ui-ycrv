import env from '@/lib/env'
import useSWR from 'swr'

export default function usePrices(tokens: `0x${string}`[]) {
  const request = `${env.YDAEMON}/1/prices/some/${tokens.join(',')}?humanized=true`

  const fallbackData = tokens.reduce((acc: { [key: `0x${string}`]: number }, token) => {
    acc[token] = 0
    return acc
  }, {})

  const { data, isLoading, isValidating, error, mutate } = useSWR(request, async () => {
    const response = await fetch(request)
    return response.json()
  }, {
    fallbackData,
    refreshInterval: 30_000
  })

  return {
    data: data as { [key: `0x${string}`]: number },
    isLoading,
    isValidating,
    error,
    mutate
  }
}
