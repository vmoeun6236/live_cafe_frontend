"use client"

import { useAuthStore } from "@/store/use-auth-store"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, initAuth } = useAuthStore()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        initAuth()
    }, [initAuth])

    useEffect(() => {
        const isPublicPath = 
            pathname === '/' || 
            pathname.startsWith('/auth') || 
            pathname.startsWith('/table')

        if (!isAuthenticated && !isPublicPath) {
            router.push('/auth/login')
        }
    }, [isAuthenticated, pathname, router])

    return <>{children}</>
}
