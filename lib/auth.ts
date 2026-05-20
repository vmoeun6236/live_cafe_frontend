export interface User {
    id: number;
    email: string;
    name?: string;
    roles: string[];
    permissions: string[];
    avatar?: string;
}

export function setAuthToken(token: string, user: User) {
    // Store in localStorage
    localStorage.setItem("auth_token", token)
    localStorage.setItem("user", JSON.stringify(user))

    // Store in cookie for middleware
    document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
}

export function getAuthToken(): string | null {
    if (typeof window === "undefined") return null
    
    // 1. Try localStorage
    let token = localStorage.getItem("auth_token")

    // 2. Fallback to cookie
    if (!token) {
        const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'))
        if (match) token = match[2]
    }

    return token
}

export function getUser(): User | null {
    if (typeof window === "undefined") return null
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) as User : null
}

export function clearAuth() {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
    document.cookie = "auth_token=; path=/; max-age=0"
}

export function isAuthenticated(): boolean {
    return !!getAuthToken()
}
