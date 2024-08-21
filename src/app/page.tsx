import Main from "@/components/wildfire/Wildfire";
import metars from "../../data/varnavas/metars.json";
import { ParsedMetar, Flight, Wildfire, Fire, AnnouncementsData } from "@/lib/types";
import flightData from "../../data/varnavas/flights.json";
import wildfireData from "../../data/varnavas/wildfire.json";
import fires from "../../data/varnavas/fires.json";
import announcements from "../../data/varnavas/announcements.json";


export default function Home() {
  return (
    <Main />
  );
}
