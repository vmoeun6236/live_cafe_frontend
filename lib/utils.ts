import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return ""
  
  // If already absolute URL, return
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:") || path.startsWith("data:")) {
    return path
  }

  // Get the base API URL (e.g. http://localhost:8000/api)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
  
  // Base URL for assets is typically the API URL without /api
  let baseUrl = apiUrl.replace("/api", "")
  
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1)
  }

  // Clean path
  let cleanPath = path.startsWith("/") ? path.slice(1) : path
  
  // If it's a relative path from the backend storage, it usually needs /storage/
  // Backend storage is often mapped to public/storage in Laravel
  if (!cleanPath.startsWith("storage/")) {
    cleanPath = `storage/${cleanPath}`
  }

  return `${baseUrl}/${cleanPath}`
}
