import { OrderItem } from "./types"
import { useState, useEffect } from "react"

export const isDrinkItem = (item: OrderItem) => {
  const name = (item.product_name || "").toLowerCase()
  const catName = (item.category_name || "").toLowerCase()
  const catSlug = (item.category_slug || "").toLowerCase()

  const drinkKeywords = [
    "coffee", "drink", "beverage", "tea", "juice", "soda", "milk", "water", 
    "beer", "wine", "smoothie", "latte", "espresso", "cappuccino", "macchiato", 
    "mocha", "matcha", "shake", "late", "កាហ្វេ", "តែ", "ទឹក"
  ]
  
  return drinkKeywords.some(keyword => 
    name.includes(keyword) || 
    catName.includes(keyword) || 
    catSlug.includes(keyword)
  )
}

export const useElapsedTime = (createdAt: string) => {
  const [elapsed, setElapsed] = useState<string>("0m 0s")
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0)

  useEffect(() => {
    const calculate = () => {
      const createdTime = new Date(createdAt).getTime()
      const now = Date.now()
      const diffMs = now - createdTime
      
      const totalSecs = Math.floor(diffMs / 1000)
      setSecondsElapsed(totalSecs)

      const mins = Math.floor(totalSecs / 60)
      const secs = totalSecs % 60
      setElapsed(`${mins}m ${secs}s`)
    }

    calculate()
    const timer = setInterval(calculate, 1000)
    return () => clearInterval(timer)
  }, [createdAt])

  return { elapsed, secondsElapsed }
}
