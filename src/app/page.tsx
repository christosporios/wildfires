import Main from "@/components/Main";
import metars from "../../data/varnavas/metars.json";
import { ParsedMetar, Flight, Wildfire, Fire, AnnouncementsData } from "@/lib/types";
import flightData from "../../data/varnavas/flights.json";
import wildfireData from "../../data/varnavas/wildfire.json";
import fires from "../../data/varnavas/fires.json";
import announcements from "../../data/varnavas/announcements.json";

export default function Home() {
  return (
    <Main wildfireData={{
      metars: metars as ParsedMetar[],
      flights: flightData as { [flightId: string]: Flight },
      wildfire: wildfireData as any as Wildfire,
      fires: fires as {
        viirs: Fire[];
        modis: Fire[];
      },
      announcements: announcements as any as AnnouncementsData
    }} />
  );
}
