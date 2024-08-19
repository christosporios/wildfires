import Main from "@/components/Main";
import metars from "../../data/varnavas/metars.json";
import { ParsedMetar, Flight, Wildfire } from "@/lib/types";
import flightData from "../../data/varnavas/flights.json";
import wildfireData from "../../data/varnavas/wildfire.json";

export default function Home() {
  return (
    <Main wildfireData={{ metars: metars as ParsedMetar[], flights: flightData as { [flightId: string]: Flight }, wildfire: wildfireData as any as Wildfire }} />
  );
}
