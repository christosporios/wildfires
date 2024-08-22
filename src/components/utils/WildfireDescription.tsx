import { Wildfire } from "@/lib/types";
import { format } from 'date-fns-tz';
import { Radio } from "lucide-react";
import React from "react";

export default function WildfireDescription({ wildfire }: { wildfire: Wildfire }) {
    return <>
        {
            wildfire.end
                ? `${format(new Date(wildfire.start), 'MMMM d', { timeZone: wildfire.timezone })} - ${format(new Date(wildfire.end), 'MMMM d, yyyy', { timeZone: wildfire.timezone })}`
                : <> <Radio className="w-4 h-4 animate-pulse inline-block" /> started on {format(new Date(wildfire.start), 'MMMM d', { timeZone: wildfire.timezone })}</>
        }
    </>
}