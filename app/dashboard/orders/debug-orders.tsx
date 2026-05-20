"use client"

import * as React from "react"
import axios from "@/lib/axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAuthToken, getUser } from "@/lib/auth"

/**
 * Debug component to diagnose orders loading issues
 * This component helps identify authentication and API connectivity problems
 */
export default function DebugOrdersPage() {
    const [diagnostics, setDiagnostics] = React.useState<Record<string, any>>({})
    const [loading, setLoading] = React.useState(false)

    const runDiagnostics = async () => {
        setLoading(true)
        const results: Record<string, any> = {}

        // 1. Check authentication token
        const token = getAuthToken()
        results.hasToken = !!token
        results.tokenLength = token?.length || 0
        results.tokenPreview = token ? `${token.substring(0, 20)}...` : 'No token'

        // 2. Check user data
        const user = getUser()
        results.hasUser = !!user
        results.user = user

        // 3. Check localStorage
        results.localStorage = {
            auth_token: typeof localStorage !== 'undefined' && localStorage.getItem('auth_token') ? 'Present' : 'Missing',
            user: typeof localStorage !== 'undefined' && localStorage.getItem('user') ? 'Present' : 'Missing',
        }

        // 4. Check cookies
        results.cookies = {
            auth_token: typeof document !== 'undefined' && document.cookie.includes('auth_token') ? 'Present' : 'Missing',
        }

        // 5. Test API connectivity
        try {
            const response = await axios.get('/profile')
            results.profileTest = {
                success: true,
                status: response.status,
                data: response.data,
            }
        } catch (error: unknown) {
            const err = error as { response?: { status?: number; data?: unknown }; message?: string };
            results.profileTest = {
                success: false,
                status: err.response?.status,
                message: err.message,
                data: err.response?.data,
            }
        }

        // 6. Test orders endpoint
        try {
            const response = await axios.get('/orders')
            results.ordersTest = {
                success: true,
                status: response.status,
                dataCount: response.data?.data?.length || 0,
            }
        } catch (error: unknown) {
            const err = error as { response?: { status?: number; data?: unknown }; message?: string; code?: string };
            results.ordersTest = {
                success: false,
                status: err.response?.status,
                message: err.message,
                data: err.response?.data,
                code: err.code,
            }
        }

        // 7. Check axios configuration
        results.axiosConfig = {
            baseURL: axios.defaults.baseURL,
            headers: axios.defaults.headers,
        }

        setDiagnostics(results)
        setLoading(false)
    }

    React.useEffect(() => {
        runDiagnostics()
    }, [])

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Orders Loading Diagnostics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={runDiagnostics} disabled={loading}>
                        {loading ? 'Running...' : 'Run Diagnostics'}
                    </Button>

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">1. Authentication Token</h3>
                            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                                {JSON.stringify({
                                    hasToken: diagnostics.hasToken,
                                    tokenLength: diagnostics.tokenLength,
                                    tokenPreview: diagnostics.tokenPreview,
                                }, null, 2)}
                            </pre>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">2. User Data</h3>
                            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                                {JSON.stringify({
                                    hasUser: diagnostics.hasUser,
                                    user: diagnostics.user,
                                }, null, 2)}
                            </pre>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">3. LocalStorage</h3>
                            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                                {JSON.stringify(diagnostics.localStorage, null, 2)}
                            </pre>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">4. Cookies</h3>
                            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                                {JSON.stringify(diagnostics.cookies, null, 2)}
                            </pre>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">5. Profile API Test</h3>
                            <pre className={`p-3 rounded text-sm overflow-auto ${diagnostics.profileTest?.success ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                {JSON.stringify(diagnostics.profileTest, null, 2)}
                            </pre>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">6. Orders API Test</h3>
                            <pre className={`p-3 rounded text-sm overflow-auto ${diagnostics.ordersTest?.success ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                {JSON.stringify(diagnostics.ordersTest, null, 2)}
                            </pre>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">7. Axios Configuration</h3>
                            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                                {JSON.stringify(diagnostics.axiosConfig, null, 2)}
                            </pre>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded">
                        <h3 className="font-semibold mb-2">Troubleshooting Guide</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>If <strong>hasToken</strong> is false: User needs to log in</li>
                            <li>If <strong>profileTest</strong> fails with 401: Token is invalid or expired</li>
                            <li>If <strong>ordersTest</strong> fails with 401: Same as profile test</li>
                            <li>If <strong>ordersTest</strong> fails with 403: User lacks permissions</li>
                            <li>If <strong>ordersTest</strong> fails with ERR_NETWORK: Backend is not running</li>
                            <li>If <strong>ordersTest</strong> fails with 500: Server error, check Laravel logs</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
