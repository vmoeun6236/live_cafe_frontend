import { useAuthStore } from "@/store/use-auth-store"

export type Permission = 
    | 'create_user' | 'view_user' | 'update_user' | 'delete_user' | 'assign_role'
    | 'create_role' | 'edit_role' | 'delete_role' | 'manage_permissions'
    | 'create_product' | 'view_product' | 'update_product' | 'delete_product' | 'import_products'
    | 'create_category' | 'view_category' | 'update_category' | 'delete_category'
    | 'create_sale' | 'view_all_sales' | 'view_own_sales' | 'edit_sale' | 'cancel_sale' | 'refund_sale'
    | 'process_payment' | 'view_payments'
    | 'view_stock' | 'adjust_stock' | 'stock_transfer'
    | 'create_customer' | 'update_customer' | 'view_customer'
    | 'create_table' | 'view_table' | 'update_table' | 'delete_table' | 'manage_table_status'
    | 'view_orders' | 'update_order_status'
    | 'view_sales_report' | 'view_profit_report' | 'export_reports'
    | 'system_settings' | 'backup_database'

export function usePermissions() {
    const { user, hasPermission: checkPermission, hasRole: checkRole } = useAuthStore()
    
    const hasPermission = (permission: Permission) => {
        return isAdmin() || checkPermission(permission)
    }

    const hasAnyPermission = (permissions: Permission[]) => {
        if (isAdmin()) return true
        if (!user || !user.permissions) return false
        return permissions.some(p => user.permissions.includes(p))
    }

    const hasRole = (role: string) => {
        return checkRole(role)
    }

    const isAdmin = () => hasRole('admin')

    return {
        permissions: user?.permissions || [],
        roles: user?.roles || [],
        hasPermission,
        hasAnyPermission,
        hasRole,
        isAdmin,
        user
    }
}
