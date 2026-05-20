"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { setAuthToken } from "@/lib/auth"
import api from "@/lib/axios"

const schema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Enter a valid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    })

    async function onSubmit(data: FormValues) {
        try {
            // Use axios instance which has proper configuration
            const response = await api.post("/register", {
                name: data.name,
                email: data.email,
                password: data.password,
                password_confirmation: data.confirmPassword,
            })

            // Check for success field in response (Laravel format)
            if (!response.data.success) {
                throw new Error(response.data.message || "Registration failed")
            }

            // Success - store token and redirect to dashboard
            if (response.data.token) {
                setAuthToken(response.data.token, response.data.user)
            }

            // Redirect to dashboard
            router.push("/dashboard")
        } catch (error: unknown) {
            console.error("Registration error:", error)
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            const message = err.response?.data?.message || err.message || "Registration failed"
            alert(message)
        }
    }

    return (
        <>
            <title>Dashboard Registration</title>
            <div className="flex flex-1 items-center justify-center px-4 py-16 bg-zinc-50">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex flex-col items-center gap-2 mb-8">
                    <div className="h-11 w-11 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-lg">
                        P
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                        Create an account
                    </h1>
                    <p className="text-sm text-zinc-500">
                        Start your 14-day free trial, no card required
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>

                        {/* Name */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                autoComplete="name"
                                {...register("name")}
                                aria-invalid={!!errors.name}
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500">{errors.name.message}</p>
                            )}
                        </div>

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
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min. 8 characters"
                                    autoComplete="new-password"
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

                        {/* Confirm Password */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="confirmPassword">Confirm password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Repeat your password"
                                    autoComplete="new-password"
                                    className="pr-10"
                                    {...register("confirmPassword")}
                                    aria-invalid={!!errors.confirmPassword}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                    aria-label={showConfirm ? "Hide password" : "Show password"}
                                >
                                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full rounded-xl gap-2" disabled={isSubmitting}>
                            <UserPlus className="size-4" />
                            {isSubmitting ? "Creating account..." : "Create account"}
                        </Button>
                    </form>

                    <div className="my-6 flex items-center gap-3">
                        <Separator className="flex-1" />
                        <span className="text-xs text-zinc-400">or</span>
                        <Separator className="flex-1" />
                    </div>

                    <p className="text-center text-sm text-zinc-500">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="font-medium text-zinc-900 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
        </>
    )
}
