import { Menu, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-black text-white flex items-center justify-center font-bold">
            P
          </div>
          <h1 className="text-xl font-bold tracking-tight">PandaStore</h1>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 hover:text-black transition"
          >
            Home
          </Link>

          <Link
            href="#"
            className="text-sm font-medium text-gray-700 hover:text-black transition"
          >
            Products
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" size="icon">
            <ShoppingCart className="h-5 w-5" />
          </Button>

          <Link href="/auth/register">
            <Button variant="outline" className="rounded-xl">
              Register
            </Button>
          </Link>

          <Link href="/auth/login">
            <Button className="rounded-xl">
              <User className="h-4 w-4 mr-2" />
              Login
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-65">
              <div className="mt-6 flex flex-col gap-5">
                <h2 className="text-xl font-bold">PandaStore</h2>

                <Link href="/" className="text-sm font-medium hover:text-black">
                  Home
                </Link>

                <Link href="#" className="text-sm font-medium hover:text-black">
                  Products
                </Link>

                <Link href="/auth/register">
                  <Button variant="outline" className="w-full rounded-xl">
                    Register
                  </Button>
                </Link>

                <Link href="/auth/login">
                  <Button className="rounded-xl w-full">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
