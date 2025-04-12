import { cn } from '@/utils'

type ProductPriceProps = {
  value: number
  className?: string
}

/* ========================================================================

======================================================================== */

export const ProductPrice = ({ value, className }: ProductPriceProps) => {
  // ⚠️ There's better ways to do this...
  const stringValue = value.toFixed(2)
  const [intValue, floatValue] = stringValue.split('.') // Get the int/float

  return (
    <p className={cn('text-2xl', className)}>
      <span className='align-super text-xs'>$</span>
      {intValue}
      <span className='align-super text-xs'>.{floatValue}</span>
    </p>
  )
}
