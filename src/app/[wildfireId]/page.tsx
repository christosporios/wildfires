import Wildfire from "@/components/wildfire/Wildfire";
import { ThemeProvider } from "next-themes";
import { notFound } from "next/navigation";

export default function Home({ params }: { params: { wildfireId: string } }) {
  const { wildfireId } = params;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
    >
      <Wildfire wildfireId={wildfireId} />
    </ThemeProvider>
  );
}
