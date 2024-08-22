"use client";
import { Wildfire, WildfireSummary } from "@/lib/types";
import { Card, CardDescription, CardHeader, CardContent, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import dynamic from 'next/dynamic';
import Link from "next/link";
import { useState } from "react";
import WildfireDescription from "../utils/WildfireDescription";

const MiniMap = dynamic(() => import("../map/MiniMap"), { ssr: false });

export default function WildfireCard({ wildfire }: { wildfire: WildfireSummary }) {
    const [isHover, setIsHover] = useState(false);

    return (
        <Link href={`/${wildfire.wildfire.id}`} className="w-80 h-96 block">
            <Card
                className="w-full h-96 relative group drop-shadow-sm hover:drop-shadow-xl font-bold"

                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
                onTouchStart={() => setIsHover(true)}
                onTouchEnd={() => setIsHover(false)}
            >
                <div className="absolute inset-0 z-0">
                    <MiniMap wildfire={wildfire} play={isHover} className="w-full h-full opacity-30 group-hover:opacity-100" />
                </div>
                <div className="relative z-10 bg-opacity-100">
                    <CardHeader>
                        <CardTitle className='font-normal text-center'>{wildfire.wildfire.name}</CardTitle>
                    </CardHeader>
                    <CardDescription className="text-center">
                        <WildfireDescription wildfire={wildfire.wildfire} />
                    </CardDescription>
                    <CardContent>
                    </CardContent>
                </div>
            </Card>
        </Link>
    );
}
