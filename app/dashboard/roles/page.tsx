'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Edit, Trash2, Shield, Users } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from '@/lib/axios'

interface Role {
    id: number
    name: string
    display_name: string
    description: string
    permissions: string[]
    users_count?: number
    created_at: string
    updated_at: string
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<Role | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        display_name: '',
        description: '',
        permissions: [] as string[]
    })

    const availablePermissions = [
        'view_dashboard',
        'view_category', 'create_category', 'edit_category', 'delete_category',
        'view_product', 'create_product', 'edit_product', 'delete_product',
        'view_stock', 'manage_stock',
        'view_table', 'create_table', 'edit_table', 'delete_table',
        'create_sale', 'view_sales', 'refund_sale',
        'view_orders', 'manage_orders',
        'view_customer', 'create_customer', 'edit_customer', 'delete_customer',
        'view_supplier', 'create_supplier', 'edit_supplier', 'delete_supplier',
        'view_purchase_order', 'create_purchase_order', 'edit_purchase_order', 'delete_purchase_order',
        'view_sales_report', 'view_inventory_report', 'view_financial_report',
        'view_user', 'create_user', 'edit_user', 'delete_user',
        'view_role', 'create_role', 'edit_role', 'delete_role',
        'manage_settings'
    ]

    const fetchRoles = React.useCallback(async () => {
        try {
            const response = await axios.get('/roles')
            setRoles(response.data.data || [])
        } catch (error) {
            toast.error('Failed to fetch roles')
            console.error('Error fetching roles:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchRoles()
    }, [fetchRoles])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingRole) {
                await axios.put(`/roles/${editingRole.id}`, formData)
                toast.success('Role updated successfully')
            } else {
                await axios.post('/roles', formData)
                toast.success('Role created successfully')
            }

            setIsDialogOpen(false)
            setEditingRole(null)
            resetForm()
            fetchRoles()
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Failed to save role'
            toast.error(message)
            console.error('Error saving role:', error)
        }
    }

    const handleEdit = (role: Role) => {
        setEditingRole(role)
        setFormData({
            name: role.name,
            display_name: role.display_name,
            description: role.description,
            permissions: role.permissions || []
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this role?')) {
            try {
                await axios.delete(`/roles/${id}`)
                toast.success('Role deleted successfully')
                fetchRoles()
            } catch (error) {
                toast.error('Failed to delete role')
                console.error('Error deleting role:', error)
            }
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            display_name: '',
            description: '',
            permissions: []
        })
    }

    const togglePermission = (permission: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission]
        }))
    }

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.display_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
                    <p className="text-muted-foreground">Manage user roles and their permissions</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { resetForm(); setEditingRole(null) }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Role
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
                            <DialogDescription>
                                {editingRole ? 'Update role information and permissions' : 'Create a new role with specific permissions'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Role Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., manager"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="display_name">Display Name *</Label>
                                    <Input
                                        id="display_name"
                                        value={formData.display_name}
                                        onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                        placeholder="e.g., Manager"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the role's responsibilities"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label>Permissions</Label>
                                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                                    {availablePermissions.map((permission) => (
                                        <div key={permission} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={permission}
                                                checked={formData.permissions.includes(permission)}
                                                onChange={() => togglePermission(permission)}
                                                className="rounded border-gray-300"
                                            />
                                            <Label htmlFor={permission} className="text-sm">
                                                {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingRole ? 'Update Role' : 'Create Role'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Roles List</CardTitle>
                    <CardDescription>
                        Total roles: {roles.length}
                    </CardDescription>
                    <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search roles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Users</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRoles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Shield className="h-4 w-4" />
                                            <div>
                                                <div className="font-medium">{role.display_name}</div>
                                                <div className="text-sm text-muted-foreground">{role.name}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-xs truncate">
                                            {role.description || <span className="text-muted-foreground">No description</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {role.permissions?.length || 0} permissions
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-1">
                                            <Users className="h-4 w-4" />
                                            <span>{role.users_count || 0}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(role)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(role.id)}
                                                disabled={(role.users_count ?? 0) > 0}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {filteredRoles.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No roles found
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}