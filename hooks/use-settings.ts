import * as React from "react"
import api from "@/lib/axios"

export function useSettings() {
  const [settings, setSettings] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(true)

  const fetchSettings = React.useCallback(async () => {
    try {
      const res = await api.get("/settings")
      setSettings(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const exchangeRate = parseFloat(settings.exchange_rate || "4000")
  
  const formatCurrency = (usd: number | string) => {
    const usdVal = parseFloat(String(usd))
    return `$${usdVal.toFixed(2)} / ៛${(usdVal * exchangeRate).toLocaleString()}`
  }

  return { settings, loading, exchangeRate, formatCurrency }
}
