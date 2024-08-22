import Wildfire from "@/components/map/Wildfire";
import { notFound } from "next/navigation";

export default function Home({ params }: { params: { wildfireId: string } }) {
  const { wildfireId } = params;
  let availableWildfireIds = ['varnavas'];
  if (!availableWildfireIds.includes(wildfireId)) {
    notFound();
  }

  return (
    <Wildfire wildfireId={wildfireId} />
  );
}
