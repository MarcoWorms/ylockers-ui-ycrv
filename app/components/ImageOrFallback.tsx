import Image from 'next/image'
import { useState } from 'react'

export default function ImageOrFallback(props : {
  alt: string,
  src: string,
  width: number,
  height: number,
  fallback: string
}) {
  const [_src, setSrc] = useState(props.src)
  return <Image {...props} src={_src} onError={() => setSrc(props.fallback)} />
}
