import React from "react"
import { notFound } from "next/navigation"
import { AlertTriangle, Loader2 } from "lucide-react"
import OrderClient from "./components/order-client"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

async function getTableData(id: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
  const res = await fetch(`${API_URL}/public/tables/${id}`, { cache: "no-store" })
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error("Failed to fetch table")
  }
  return res.json()
}

async function getMenuData() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
  const res = await fetch(`${API_URL}/public/menu`, { next: { revalidate: 60 } })
  if (!res.ok) {
    throw new Error("Failed to fetch menu")
  }
  return res.json()
}

export default async function TableOrderingPage({ params }: PageProps) {
  const { id } = await params
  
  try {
    const [tableRes, menuRes] = await Promise.all([
      getTableData(id),
      getMenuData()
    ])

    if (!tableRes) {
      return notFound()
    }

    const tableData = tableRes.table
    const categoriesData = menuRes.categories || []

    return (
      <OrderClient 
        table={tableData} 
        categories={categoriesData} 
        tableId={id} 
      />
    )
  } catch (err: any) {
    console.error("Fetch failed in Server Component:", err)
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 px-6 text-center">
        <AlertTriangle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Oops! Something went wrong</h2>
        <p className="text-slate-400 text-sm max-w-sm mb-6">
          Failed to load restaurant menu. Please check your connection or scan the QR code again.
        </p>
      </div>
    )
  }
}
