import LoadingImage from '@/assets/loading.png'
import { cn } from '@/lib/utils'
import Image from 'next/image'
export default function Loading({ className }: { className?: string }) {
    return (
        <div className={cn('w-full h-10 flex justify-center items-center', className)}>
            <Image src={LoadingImage} alt='' height={20} className=' animate-spin' />
        </div>
    )
}
