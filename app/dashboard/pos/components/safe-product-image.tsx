"use client"

import * as React from "react"
import Image from "next/image"
import { PackageIcon } from "lucide-react"

export function SafeProductImage({ src, alt }: { src: string | undefined, alt: string }) {
    const [error, setError] = React.useState(false)

    if (error || !src) {
        return (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                <PackageIcon className="size-12" />
            </div>
        )
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            onError={() => setError(true)}
        />
    )
}
