import { mediaSrcSet } from '@/lib/media'

type MediaImgProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string
  alt: string
}

/**
 * Image that emits a responsive srcset when the source is one of our
 * optimizer URLs (/api/img/<id>). External URLs render as a plain image.
 */
export function MediaImg({ src, alt, sizes, ...rest }: MediaImgProps) {
  const srcSet = mediaSrcSet(src)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? (sizes ?? '100vw') : undefined}
      alt={alt}
      loading="lazy"
      decoding="async"
      {...rest}
    />
  )
}
