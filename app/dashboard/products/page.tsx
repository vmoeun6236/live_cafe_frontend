import { ProductsTable } from "./components/products-table"

export default function ProductsPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground">
                        Manage your product catalog and inventory
                    </p>
                </div>
            </div>
            <ProductsTable />
        </div>
    )
}
