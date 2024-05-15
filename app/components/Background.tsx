import Image from 'next/image'

export default function Background({ className }: { className?: string }) {
  return <Image className={`absolute right-[6%] top-[8%] w-[700px] ${className}`} src="/curve-logo.png" width={1600} height={682} alt="" />
  return <></>
}
