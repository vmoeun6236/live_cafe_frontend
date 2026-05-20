"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { setAuthToken } from "@/lib/auth"
import api from "@/lib/axios"

const schema = z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(1, "Password is required"),
    remember: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)

    const {
        control,
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { remember: false },
    })

    const remember = useWatch({ control, name: "remember" })

    async function onSubmit(data: FormValues) {
        try {
            console.log("Submitting login with:", { email: data.email })

            // Use axios instance which has proper configuration
            const response = await api.post("/login", {
                email: data.email,
                password: data.password,
                remember: data.remember,
            })

            console.log("Response data:", response.data)

            // Check for success field in response (Laravel format)
            if (!response.data.success) {
                throw new Error(response.data.message || "Login failed")
            }

            // Success - store token and redirect to dashboard
            if (response.data.token) {
                console.log("Storing token and redirecting...")
                setAuthToken(response.data.token, response.data.user)

                // Small delay to ensure cookie is set
                setTimeout(() => {
                    window.location.href = "/dashboard"
                }, 100)
            } else {
                console.error("No token in response:", response.data)
                alert("Login successful but no token received")
            }
        } catch (error: unknown) {
            console.error("Login error:", error)
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            const message = err.response?.data?.message || err.message || "Login failed"
            alert(message)
        }
    }

    return (
        <>
            <title>Dashboard Login</title>
            <div className="flex flex-1 items-center justify-center px-4 py-16 bg-zinc-50">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex flex-col items-center gap-2 mb-8">
                    <img 
                        src="/logo.png" 
                        className="h-14 w-auto object-contain rounded-2xl mb-1 shadow-sm" 
                        alt="Live Cafe Logo" 
                    />
                    <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">
                        Welcome back
                    </h1>
                    <p className="text-sm text-zinc-500 font-medium">Sign in to your Live Cafe dashboard</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                {...register("email")}
                                aria-invalid={!!errors.email}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    href="#"
                                    className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="pr-10"
                                    {...register("password")}
                                    aria-invalid={!!errors.password}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="remember"
                                checked={!!remember}
                                onCheckedChange={(checked) => setValue("remember", !!checked)}
                            />
                            <Label htmlFor="remember" className="text-sm font-normal text-zinc-600 cursor-pointer">
                                Remember me for 30 days
                            </Label>
                        </div>

                        <Button type="submit" className="w-full rounded-xl gap-2" disabled={isSubmitting}>
                            <LogIn className="size-4" />
                            {isSubmitting ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>

                    <div className="my-6 flex items-center gap-3">
                        <Separator className="flex-1" />
                        <span className="text-xs text-zinc-400">or</span>
                        <Separator className="flex-1" />
                    </div>

                    <p className="text-center text-sm text-zinc-500">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/register" className="font-medium text-zinc-900 hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
        </>
    )
}
