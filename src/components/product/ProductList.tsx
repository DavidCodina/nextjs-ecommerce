'use client'

import { ProductCard } from './ProductCard'
import { Product } from '@/types'

type ProductListProps = {
  data: Product[]
  title?: string
  limit?: number
}

/* ========================================================================

======================================================================== */

export const ProductList = ({ data, title, limit }: ProductListProps) => {
  const limitedData = limit ? data.slice(0, limit) : data

  return (
    <div className='my-10'>
      <h2 className='text-primary mb-4 text-2xl font-bold'>{title}</h2>

      {data.length > 0 ? (
        <div
          //# Can we set a max on this and have the content centered?
          className='mx-auto grid auto-rows-[minmax(0px,auto)] grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4'
        >
          {limitedData.map((product: Product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div>
          <p>No products found</p>
        </div>
      )}
    </div>
  )
}
