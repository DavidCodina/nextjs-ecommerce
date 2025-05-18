'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/utils'

/* ========================================================================

======================================================================== */

export const ProductImages = ({ images }: { images: string[] }) => {
  const [current, setCurrent] = useState(0)

  return (
    <div className='space-y-4'>
      <Image
        alt='product image'
        height={1000}
        src={images[current]}
        width={1000}
        className='min-h-[300px] rounded-lg object-cover object-center'
      />
      <div className='flex gap-2'>
        {images.map((image, index) => (
          <div
            key={image}
            className={cn(
              'cursor-pointer overflow-hidden rounded border',
              current === index && 'border-primary'
            )}
            onClick={() => setCurrent(index)}
          >
            <Image src={image} alt='image' width={100} height={100} />
          </div>
        ))}
      </div>
    </div>
  )
}
