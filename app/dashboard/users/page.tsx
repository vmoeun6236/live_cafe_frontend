'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    User,
    Mail,
    Shield,
    Calendar,
    Users,
    Crown,
    Utensils,
    Coins,
    UserCheck,
    CheckCircle,
    UserX,
    Sparkles,
    KeyRound
} from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'react-hot-toast'
import axios from '@/lib/axios'

interface User {
    id: number
    name: string
    email: string
    role: string
    is_active: boolean
    last_login_at?: string
    created_at: string
    updated_at: string
}

interface Role {
    id: number
    name: string
    display_name: string
    description: string
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRoleFilter, setSelectedRoleFilter] = useState('all')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [lastPage, setLastPage] = useState(1)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
        is_active: true
    })

    const fetchData = React.useCallback(async (page = 1) => {
        try {
            setLoading(true)
            const [usersResponse, rolesResponse] = await Promise.all([
                axios.get(`/users?page=${page}`),
                axios.get('/roles')
            ])

            const rawUsers = usersResponse.data.data || []
            const formattedUsers = rawUsers.map((u: any) => ({
                ...u,
                role: u.role || (u.roles && u.roles[0]) || 'cashier',
                is_active: true
            }))
            setUsers(formattedUsers)
            setRoles(rolesResponse.data.data || [])
            setCurrentPage(usersResponse.data.current_page || 1)
            setLastPage(usersResponse.data.last_page || 1)
        } catch (error) {
            toast.error('Failed to fetch user directory')
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData(currentPage)
    }, [fetchData, currentPage])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!editingUser && formData.password !== formData.password_confirmation) {
            toast.error('Passwords do not match')
            return
        }

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                is_active: formData.is_active,
                ...((!editingUser || formData.password) && {
                    password: formData.password,
                    password_confirmation: formData.password_confirmation
                })
            }

            if (editingUser) {
                await axios.put(`/users/${editingUser.id}`, payload)
                toast.success('User updated successfully')
            } else {
                await axios.post('/users', payload)
                toast.success('User created successfully')
            }

            setIsDialogOpen(false)
            setEditingUser(null)
            resetForm()
            fetchData()
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Failed to save user'
            toast.error(message)
            console.error('Error saving user:', error)
        }
    }

    const handleEdit = (user: User) => {
        setEditingUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            role: user.role,
            is_active: user.is_active
        })
        setIsDialogOpen(true)
    }

    const triggerDelete = (user: User) => {
        setUserToDelete(user)
        setIsDeleteDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!userToDelete) return
        try {
            await axios.delete(`/users/${userToDelete.id}`)
            toast.success('User deleted successfully')
            setIsDeleteDialogOpen(false)
            setUserToDelete(null)
            fetchData()
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to delete user'
            toast.error(msg)
            console.error('Error deleting user:', error)
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: '',
            is_active: true
        })
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesRole = selectedRoleFilter === 'all' || user.role.toLowerCase() === selectedRoleFilter.toLowerCase()

        return matchesSearch && matchesRole
    })

    const getRoleBadgeStyle = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50'
            case 'manager':
                return 'bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50'
            case 'cashier':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50'
            case 'kitchen':
                return 'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50'
            case 'waiter':
                return 'bg-purple-50 text-purple-700 border-purple-200/50 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50'
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200/50 dark:bg-slate-900 dark:text-slate-400'
        }
    }

    const getRoleIcon = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin': return <Crown className="size-3.5 mr-1 text-rose-600 dark:text-rose-400" />
            case 'manager': return <Shield className="size-3.5 mr-1 text-blue-600 dark:text-blue-400" />
            case 'cashier': return <Coins className="size-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
            case 'kitchen': return <Utensils className="size-3.5 mr-1 text-amber-600 dark:text-amber-400" />
            case 'waiter': return <UserCheck className="size-3.5 mr-1 text-purple-600 dark:text-purple-400" />
            default: return <User className="size-3.5 mr-1 text-slate-500" />
        }
    }

    const getAvatarGradient = (name: string, role: string) => {
        switch (role.toLowerCase()) {
            case 'admin': return 'bg-gradient-to-br from-rose-400 to-orange-500 text-white'
            case 'manager': return 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
            case 'cashier': return 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
            case 'kitchen': return 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
            case 'waiter': return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
            default: return 'bg-gradient-to-br from-slate-400 to-slate-600 text-white'
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
    }

    // Statistics counts
    const adminCount = users.filter(u => u.role.toLowerCase() === 'admin').length
    const cashierCount = users.filter(u => u.role.toLowerCase() === 'cashier').length
    const kitchenCount = users.filter(u => u.role.toLowerCase() === 'kitchen').length
    const waiterCount = users.filter(u => u.role.toLowerCase() === 'waiter').length

    return (
        <>
            <title>Users Directory</title>
            <div className="space-y-8 p-1">
            {/* Header section with gradient flair */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-muted pb-5">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-2">
                        <Users className="size-8 text-primary/80" />
                        Users Directory
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">
                        Configure system access, roles, and security permissions for your team.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            onClick={() => { resetForm(); setEditingUser(null) }}
                            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-200 gap-2 h-10 px-5 rounded-lg font-medium shrink-0"
                        >
                            <Plus className="size-4" />
                            Add Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <Sparkles className="size-5 text-amber-500" />
                                {editingUser ? 'Edit Team Member' : 'Add New Member'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingUser ? 'Update user roles and access details below.' : 'Create an authorized profile for a new cafe or store staff.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-sm font-semibold">Full Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="Jane Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="rounded-lg"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-sm font-semibold">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="jane@livecafe.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="rounded-lg"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="role" className="text-sm font-semibold">Designated Role *</Label>
                                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                                    <SelectTrigger className="rounded-lg">
                                        <SelectValue placeholder="Assign a role" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg">
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.name}>
                                                <span className="flex items-center gap-2">
                                                    {getRoleIcon(role.name)}
                                                    <span>
                                                        {role.display_name || (role.name.charAt(0).toUpperCase() + role.name.slice(1))}
                                                    </span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-1.5">
                                    <KeyRound className="size-3.5 text-muted-foreground" />
                                    Password {editingUser ? '(Leave blank to keep)' : '*'}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!editingUser}
                                    className="rounded-lg"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password_confirmation" className="text-sm font-semibold flex items-center gap-1.5">
                                    <KeyRound className="size-3.5 text-muted-foreground" />
                                    Confirm Password {editingUser ? '(Only if changing)' : '*'}
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password_confirmation}
                                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                    required={!editingUser || formData.password !== ''}
                                    className="rounded-lg"
                                />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-lg">
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg">
                                    {editingUser ? 'Save Updates' : 'Register Member'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Premium Stat cards */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="h-28 bg-slate-100 dark:bg-slate-900 rounded-xl border border-muted" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card 
                        onClick={() => setSelectedRoleFilter(selectedRoleFilter === 'admin' ? 'all' : 'admin')}
                        className={`rounded-2xl border-amber-100/80 dark:border-amber-950/20 bg-gradient-to-tr from-amber-50/40 to-white dark:from-amber-950/5 dark:to-slate-950 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer ${
                            selectedRoleFilter === 'admin' ? 'ring-2 ring-amber-600 ring-offset-2 dark:ring-offset-slate-950' : ''
                        }`}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Administrators</span>
                            <div className="p-2 bg-amber-100/50 dark:bg-amber-950/40 rounded-xl text-amber-700 dark:text-amber-400">
                                <Crown className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-amber-700 dark:text-amber-400">{adminCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">Full control of system settings</p>
                        </CardContent>
                    </Card>

                    <Card 
                        onClick={() => setSelectedRoleFilter(selectedRoleFilter === 'cashier' ? 'all' : 'cashier')}
                        className={`rounded-2xl border-orange-100/80 dark:border-orange-950/20 bg-gradient-to-tr from-orange-50/40 to-white dark:from-orange-950/5 dark:to-slate-950 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer ${
                            selectedRoleFilter === 'cashier' ? 'ring-2 ring-orange-600 ring-offset-2 dark:ring-offset-slate-950' : ''
                        }`}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-xs font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wider">Cashiers</span>
                            <div className="p-2 bg-orange-100/50 dark:bg-orange-950/40 rounded-xl text-orange-700 dark:text-orange-400">
                                <Coins className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-orange-700 dark:text-orange-400">{cashierCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">Front desk sales and checkout</p>
                        </CardContent>
                    </Card>

                    <Card 
                        onClick={() => setSelectedRoleFilter(selectedRoleFilter === 'kitchen' ? 'all' : 'kitchen')}
                        className={`rounded-2xl border-amber-100/80 dark:border-amber-950/20 bg-gradient-to-tr from-amber-50/40 to-white dark:from-amber-950/5 dark:to-slate-950 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer ${
                            selectedRoleFilter === 'kitchen' ? 'ring-2 ring-amber-600 ring-offset-2 dark:ring-offset-slate-950' : ''
                        }`}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Kitchen Staff</span>
                            <div className="p-2 bg-amber-100/50 dark:bg-amber-950/40 rounded-xl text-amber-700 dark:text-amber-400">
                                <Utensils className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-amber-700 dark:text-amber-400">{kitchenCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">Meal prep and order tracking</p>
                        </CardContent>
                    </Card>

                    <Card 
                        onClick={() => setSelectedRoleFilter(selectedRoleFilter === 'waiter' ? 'all' : 'waiter')}
                        className={`rounded-2xl border-orange-100/80 dark:border-orange-950/20 bg-gradient-to-tr from-orange-50/40 to-white dark:from-orange-950/5 dark:to-slate-950 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer ${
                            selectedRoleFilter === 'waiter' ? 'ring-2 ring-orange-600 ring-offset-2 dark:ring-offset-slate-950' : ''
                        }`}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-xs font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wider">Waiters</span>
                            <div className="p-2 bg-orange-100/50 dark:bg-orange-950/40 rounded-xl text-orange-700 dark:text-orange-400">
                                <UserCheck className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-orange-700 dark:text-orange-400">{waiterCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">Table servicing and hospitality</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters Toolbar */}
            <Card className="rounded-2xl border-slate-100 shadow-sm bg-white dark:bg-slate-950">
                <CardHeader className="pb-3 border-b border-muted">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex items-center space-x-2 w-full lg:w-96 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                            <Input
                                placeholder="Search by name, email, role..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-10 w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 focus-visible:ring-primary"
                            />
                        </div>

                        {/* Quick filter pill buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
                            {['all', 'admin', 'manager', 'cashier', 'kitchen', 'waiter'].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setSelectedRoleFilter(role)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all duration-200 ${
                                        selectedRoleFilter === role
                                            ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white shadow-sm'
                                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900'
                                    }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                            <span className="h-6 w-6 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                            <p className="text-sm font-medium">Fetching secure records...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/40 dark:bg-slate-900/40">
                                    <TableRow className="border-b border-muted">
                                        <TableHead className="py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Team Member</TableHead>
                                        <TableHead className="py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Role</TableHead>
                                        <TableHead className="py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">System Status</TableHead>
                                        <TableHead className="py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Registered</TableHead>
                                        <TableHead className="py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow 
                                            key={user.id}
                                            className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 border-b border-muted/50 group/row transition-colors"
                                        >
                                            <TableCell className="py-4">
                                                <div className="flex items-center space-x-3.5">
                                                    {/* Premium Dynamic Gradient Avatar */}
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm tracking-wider shrink-0 shadow-sm ${getAvatarGradient(user.name, user.role)}`}>
                                                        {getInitials(user.name)}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover/row:text-primary transition-colors">
                                                            {user.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground flex items-center mt-0.5 min-w-0">
                                                            <Mail className="h-3 w-3 mr-1 shrink-0 text-slate-400" />
                                                            <span className="truncate">{user.email}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge className={`py-1 px-2.5 rounded-full text-xs font-semibold border shadow-none flex items-center w-fit ${getRoleBadgeStyle(user.role)}`}>
                                                    {getRoleIcon(user.role)}
                                                    {user.role.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 shadow-none dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 py-1 px-2.5 rounded-full flex items-center w-fit">
                                                    <CheckCircle className="size-3.5 mr-1" />
                                                    ACTIVE
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 text-slate-600 dark:text-slate-400">
                                                <div className="text-sm flex items-center">
                                                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-400 shrink-0" />
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    }) : 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-right pr-6">
                                                <div className="flex items-center justify-end space-x-1.5 opacity-60 group-hover/row:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(user)}
                                                        className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-primary"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => triggerDelete(user)}
                                                        className="h-8 w-8 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 text-rose-500"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            
                            {filteredUsers.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full border border-dashed border-slate-200 dark:border-slate-800">
                                        <UserX className="size-10 text-slate-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">No users found</p>
                                        <p className="text-xs text-muted-foreground max-w-xs mt-1">We couldn't find any team members matching your search or role filters.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {lastPage > 1 && (
                        <div className="flex items-center justify-between border-t border-muted px-6 py-4 bg-slate-50/20 dark:bg-slate-900/10 rounded-b-2xl">
                            <div className="text-sm text-slate-500">
                                Page <span className="font-semibold text-slate-900 dark:text-slate-100">{currentPage}</span> of{' '}
                                <span className="font-semibold text-slate-900 dark:text-slate-100">{lastPage}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-lg h-9 text-xs"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
                                    disabled={currentPage === lastPage}
                                    className="rounded-lg h-9 text-xs"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Beautiful Custom Alert Dialog for Deletion */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold flex items-center gap-2 text-rose-600">
                            <Trash2 className="size-5" />
                            Remove Team Member?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="pt-2">
                            This will permanently remove <strong>{userToDelete?.name}</strong> ({userToDelete?.email}) and rescind all their dashboard authorizations. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-4">
                        <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
                        >
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
        </>
    )
}