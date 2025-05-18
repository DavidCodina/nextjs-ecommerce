import { useCallback, useEffect, useState } from 'react'
import { EmblaCarouselType } from 'embla-carousel'

type VoidFunctionWithAnyArgs = (...args: any[]) => void

type UseAutoplayType = {
  autoplayIsPlaying: boolean
  toggleAutoplay: () => void
  stopAutoplayOnClick: VoidFunctionWithAnyArgs
  resetAutoplayOnClick: VoidFunctionWithAnyArgs
}

/* ========================================================================
                        
======================================================================== */

export const useAutoplay = (
  emblaApi: EmblaCarouselType | undefined
): UseAutoplayType => {
  const [autoplayIsPlaying, setAutoplayIsPlaying] = useState(false)

  /* ======================

  ====================== */

  const stopAutoplayOnClick = useCallback(
    (callback: () => void) => {
      const autoplay = emblaApi?.plugins()?.autoplay
      if (!autoplay) {
        return
      }
      autoplay.stop()
      callback()
    },
    [emblaApi]
  )

  /* ======================

  ====================== */

  const resetAutoplayOnClick = useCallback(
    (callback: () => void) => {
      const autoplay = emblaApi?.plugins()?.autoplay
      if (!autoplay) {
        return
      }
      autoplay.reset()
      callback()
    },
    [emblaApi]
  )

  /* ======================

  ====================== */

  const toggleAutoplay = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay
    if (!autoplay) {
      return
    }

    const playOrStop = autoplay.isPlaying() ? autoplay.stop : autoplay.play
    playOrStop()
  }, [emblaApi])

  /* ======================

  ====================== */

  useEffect(() => {
    const autoplay = emblaApi?.plugins()?.autoplay
    if (!autoplay) return

    setAutoplayIsPlaying(autoplay.isPlaying())
    emblaApi
      .on('autoplay:play', () => setAutoplayIsPlaying(true))
      .on('autoplay:stop', () => setAutoplayIsPlaying(false))
      .on('reInit', () => setAutoplayIsPlaying(autoplay.isPlaying()))
  }, [emblaApi])

  /* ======================

  ====================== */

  return {
    autoplayIsPlaying,
    toggleAutoplay,
    stopAutoplayOnClick,
    resetAutoplayOnClick
  }
}
