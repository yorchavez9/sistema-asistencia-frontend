import { useQuery } from "@tanstack/react-query"
import { settingsApi } from "@/api/endpoints"

const CACHE_KEY = "cached_settings"

function getCached() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || undefined
  } catch {
    return undefined
  }
}

export default function useSettings() {
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await settingsApi.getPublic()
      const d = res.data.data || res.data
      localStorage.setItem(CACHE_KEY, JSON.stringify(d))
      return d
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
    placeholderData: getCached,
  })

  const settings = Array.isArray(data) ? data : data?.data || []
  const map = {}
  settings.forEach((s) => { map[s.key || s.id] = s.value })

  return {
    logoUrl: map.logo_url || null,
    loginBgUrl: map.login_bg_url || null,
    get: (key) => map[key] || null,
  }
}
