import { usePageSettings } from "@/contexts/SettingsContext";
import { Event as WildfireEvent } from "@/lib/types";
import { Badge } from "./ui/badge";

export function Events({ zuluTime, events }: { zuluTime: Date, events: WildfireEvent[] }) {
    let { settings } = usePageSettings();

    if (!settings.showEvents) {
        return <></>;
    }

    let fadeTimeMs = settings.eventFadeTimeMs;
    let currentEvents = events.filter(event =>
        (event.timestamp * 1000 < zuluTime.getTime())
        && (event.timestamp * 1000 > zuluTime.getTime() - fadeTimeMs)
    );

    return <div className="flex justify-end max-h-[200px] overflow-y-auto">
        <div className="flex flex-col font-mono">
            {currentEvents.map((e, i) => {
                return (
                    <div key={i} className="text-xs flex items-center flex-row-reverse my-1">
                        <div className="flex-shrink-0 mr-2">
                            <Badge className='bg-orange-600 text-white mx-1'>112</Badge>
                        </div>
                        <div className="flex-grow text-right">{e.description}</div>
                    </div>
                )
            })}
        </div>
    </div>;

}