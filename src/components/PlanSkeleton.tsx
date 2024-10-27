import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function PlanSkeleton() {
    return (
        <Card className=" bg-white shadow-lg flex flex-col p-[2vw] transition-all duration-300">
            <CardHeader className=" flex-grow">
                <Skeleton className=" h-10 mb-2" />
                <Skeleton className=" h-10 w-1/2" />
            </CardHeader>
            <CardContent>
                <div className="space-y-3 mb-8">
                    <Skeleton className=" h-6" />
                    <Skeleton className=" h-6" />
                    <Skeleton className=" h-6" />
                    <Skeleton className=" h-6" />
                </div>
                <Skeleton className=" h-16 my-4" />
            </CardContent>
        </Card>
    )
}
