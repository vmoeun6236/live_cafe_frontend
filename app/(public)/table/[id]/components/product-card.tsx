"use client"

import React from "react"
import { Utensils, Plus } from "lucide-react"
import { getImageUrl } from "@/lib/utils"
import { Product, ProductVariant } from "./types"

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, variant: ProductVariant) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const getProductImageUrl = (prod: any) => {
    if (prod.image) return getImageUrl(prod.image)
    if (prod.image_url) return getImageUrl(prod.image_url)
    return ""
  }

  const imageUrl = getProductImageUrl(product)

  return (
    <div className="bg-slate-900/50 border border-slate-900 rounded-3xl p-4 flex gap-4 hover:border-slate-850 transition duration-200 shadow-xl">
      {/* Product Thumbnail */}
      <div className="w-24 h-24 rounded-2xl bg-slate-850 flex items-center justify-center flex-shrink-0 border border-slate-800/40 relative overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`fallback-icon flex items-center justify-center w-full h-full ${imageUrl ? 'hidden' : ''}`}>
          <Utensils className="w-8 h-8 text-slate-700" />
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-white text-base leading-tight mb-1">{product.name}</h3>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description || "Freshly crafted delicious item."}
          </p>
        </div>

        {/* Variants / Buy Section */}
        <div className="mt-3 pt-2.5 border-t border-slate-850/50 flex flex-col gap-2">
          {product.variants.map((v) => (
            <div key={v.id} className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium">
                {v.size_name}
              </span>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-amber-500">
                  ${parseFloat(v.price).toFixed(2)}
                </span>
                
                <button
                  onClick={() => onAddToCart(product, v)}
                  className="p-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 rounded-lg transition duration-150"
                  title="Add to order"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
