"use client"

import * as React from "react"
import api from "@/lib/axios"
import { toast } from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
    const [settings, setSettings] = React.useState({ cafe_name: '', currency: '', tax_rate: '' })

    React.useEffect(() => {
        api.get("/settings").then(res => setSettings(res.data))
    }, [])

    async function saveSettings() {
        try {
            await api.patch("/settings", settings)
            toast.success("Settings updated")
        } catch {
            toast.error("Failed to save")
        }
    }

    return (
        <div className="p-6 max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold">Cafe Settings</h1>
            <Card>
                <CardHeader><CardTitle>General Config</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Cafe Name</Label>
                        <Input value={settings.cafe_name} onChange={e => setSettings({...settings, cafe_name: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Currency</Label>
                        <Input value={settings.currency} onChange={e => setSettings({...settings, currency: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Tax Rate (%)</Label>
                        <Input type="number" value={settings.tax_rate} onChange={e => setSettings({...settings, tax_rate: e.target.value})} />
                    </div>
                    <Button onClick={saveSettings}>Save Changes</Button>
                </CardContent>
            </Card>
        </div>
    )
}
