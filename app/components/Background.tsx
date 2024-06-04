import Image from 'next/image'

export default function Background({ className }: { className?: string }) {
  return <Image className={`absolute left-[40%] w-[60%] ${className}`} src="/curve-bg.svg" width={1600} height={600} alt="" />
}
