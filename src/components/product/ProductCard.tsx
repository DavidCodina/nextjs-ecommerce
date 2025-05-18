import Link from 'next/link'
import Image from 'next/image'

import {
  Card,
  CardContent
  // CardHeader
} from '@/components/Card'
import { ProductPrice } from './ProductPrice'
import { Rating } from './Rating'

import { Product } from '@/types'

type ProductCardProps = {
  product: Product
}

/* ========================================================================

======================================================================== */

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card
    //! This makes zero sense when inside of a grid. Maybe it's used elsewhere...
    //! className='w-full max-w-sm'
    >
      <Link href={`/product/${product.slug}`}>
        <Image
          className='mx-auto'
          src={product.images[0]}
          alt={product.name}
          height={300}
          width={300}
          priority={true}
        />
      </Link>

      {/* <CardHeader></CardHeader> */}
      <CardContent
        //! Why are we using grid here?
        className='grid gap-4'
      >
        <div className='text-xs'>{product.brand}</div>
        <Link href={`/product/${product.slug}`}>
          <h2 className='text-sm font-medium'>{product.name}</h2>
        </Link>

        <div className='flex-between gap-4'>
          <Rating value={Number(product.rating)} />
          {product.stock > 0 ? (
            <ProductPrice value={Number(product.price)} />
          ) : (
            <p className='text-destructive mt-2 text-sm font-medium'>
              Out Of Stock
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
