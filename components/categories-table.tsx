"use client";
import * as React from "react";
import Image from "next/image";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  SearchIcon,
  LoaderIcon,
  ImageIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";
import { usePermissions } from "@/hooks/use-permissions";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  status: z.enum(["active", "inactive"]),
  image: z.string().nullable(),
});

export type Category = z.infer<typeof categorySchema>;

const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// ─── Helper Components ──────────────────────────────────────────────────────

function SafeCategoryImage({ src, alt, className }: { src: string, alt: string, className?: string }) {
  const [error, setError] = React.useState(false)

  if (error || !src) {
    return (
      <div className={`bg-muted flex items-center justify-center text-muted-foreground/30 ${className}`}>
        <ImageIcon className="size-4" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      className={`${className} object-cover border`}
      onError={() => setError(true)}
    />
  )
}

// ─── Category Form Dialog ─────────────────────────────────────────────────────

function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category: Category | null;
  onSuccess: () => void;
}) {
  const isEdit = !!category;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "", description: "", status: "active" },
  });

  const statusValue = useWatch({ control, name: "status" });

  React.useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        if (category) {
          reset({
            name: category.name,
            description: category.description ?? "",
            status: category.status,
          });
          setImagePreview(category.image ? getImageUrl(category.image) : null);
        } else {
          reset({ name: "", description: "", status: "active" });
          setImagePreview(null);
        }
        setImageFile(null);
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(data: CategoryFormValues) {
    try {
      const fd = new FormData();
      fd.append("name", data.name);
      if (data.description) fd.append("description", data.description);
      fd.append("status", data.status);
      if (imageFile) fd.append("image", imageFile);

      if (isEdit) {
        fd.append("_method", "PUT");
        await api.post(`/categories/${category.id}`, fd);
        toast.success("Category updated");
      } else {
        await api.post("/categories", fd);
        toast.success("Category created");
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={statusValue}
              onValueChange={(v: "active" | "inactive") =>
                setValue("status", v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            {imagePreview ? (
              <div className="relative aspect-video rounded-md overflow-hidden border">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={400}
                  height={200}
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 size-6"
                  onClick={removeImage}
                >
                  <Trash2Icon className="size-3" />
                </Button>
              </div>
            ) : (
              <div
                className="aspect-video rounded-md border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="size-8 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground">
                  Upload Image
                </span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <LoaderIcon className="mr-2 size-4 animate-spin" />
              )}
              {isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category: Category | null;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = React.useState(false);

  async function handleDelete() {
    if (!category) return;
    setLoading(true);
    try {
      await api.delete(`/categories/${category.id}`);
      toast.success("Category deleted");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Category</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{category?.name}</span>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground"
          >
            {loading && <LoaderIcon className="mr-2 size-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Main Categories Table ────────────────────────────────────────────────────

export function CategoriesTable() {
  const [mounted, setMounted] = React.useState(false);
  const { hasPermission } = usePermissions();
  const [data, setData] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] =
    React.useState<Category | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const fetchCategories = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/categories");
      setData(res.data.data ?? []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (mounted) fetchCategories();
  }, [mounted, fetchCategories]);

  const columns = React.useMemo<ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }) => {
          const src = getImageUrl(row.original.image);
          return (
            <SafeCategoryImage 
                src={src} 
                alt={row.original.name} 
                className="size-10 rounded" 
            />
          );
        },
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">
            {row.original.slug}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={row.original.status === "active" ? "default" : "secondary"}
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            {hasPermission("update_category") && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => {
                  setSelectedCategory(row.original);
                  setFormOpen(true);
                }}
              >
                <PencilIcon className="size-4" />
              </Button>
            )}
            {hasPermission("delete_category") && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-destructive"
                onClick={() => {
                  setSelectedCategory(row.original);
                  setDeleteOpen(true);
                }}
              >
                <Trash2Icon className="size-4" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [hasPermission],
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        {hasPermission("create_category") && (
          <Button
            onClick={() => {
              setSelectedCategory(null);
              setFormOpen(true);
            }}
          >
            <PlusIcon className="mr-2 size-4" />
            Add Category
          </Button>
        )}
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <LoaderIcon className="size-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={selectedCategory}
        onSuccess={fetchCategories}
      />
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        category={selectedCategory}
        onSuccess={fetchCategories}
      />
    </div>
  );
}
