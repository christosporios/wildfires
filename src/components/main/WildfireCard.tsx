"use client";
import { Wildfire, WildfireSummary } from "@/lib/types";
import { Card, CardDescription, CardHeader, CardContent, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import dynamic from 'next/dynamic';
import Link from "next/link";
import { useState, useEffect } from "react";
import WildfireDescription from "../utils/WildfireDescription";

const MiniMap = dynamic(() => import("../map/MiniMap"), { ssr: false });
export default function WildfireCard({ wildfire, active }: { wildfire: Wildfire, active: boolean }) {
    const [isHover, setIsHover] = useState(false);

    useEffect(() => {
        if (active) {
            setIsHover(true);
        }
    }, [active]);

    return (
        <Link href={`/${wildfire.id}`} className="w-80 h-96 block">
            <Card
                className={`w-full h-96 relative group ${active ? 'drop-shadow-xl' : 'drop-shadow-sm hover:drop-shadow-xl'} font-bold`}
                onMouseEnter={() => !active && setIsHover(true)}
                onMouseLeave={() => !active && setIsHover(false)}
                onTouchStart={() => !active && setIsHover(true)}
                onTouchEnd={() => !active && setIsHover(false)}
            >
                <div className="absolute inset-0 z-0">
                    <MiniMap wildfire={wildfire} play={active || isHover} className={`w-full h-full ${active ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'}`} />
                </div>
                <div className="relative z-10 bg-opacity-100">
                    <CardHeader>
                        <CardTitle className='font-normal text-center'>{wildfire.name}</CardTitle>
                    </CardHeader>
                    <CardDescription className="text-center">
                        <WildfireDescription wildfire={wildfire} />
                    </CardDescription>
                    <CardContent>
                    </CardContent>
                </div>
            </Card>
        </Link>
    );
}
