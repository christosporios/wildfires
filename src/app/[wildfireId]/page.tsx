import Wildfire from "@/components/wildfire/Wildfire";
import { ThemeProvider } from "next-themes";
import { notFound } from "next/navigation";
export async function generateMetadata({ params }: { params: { wildfireId: string } }) {
  const wildfireName = params.wildfireId.charAt(0).toUpperCase() + params.wildfireId.slice(1);

  return {
    title: `${wildfireName} Wildfire | Wildfire Tracker`,
    description: `Details and visualization for the ${wildfireName} wildfire`,
    openGraph: {
      title: `${wildfireName} Wildfire | Wildfire Tracker`,
      description: `Details and visualization for the ${wildfireName} wildfire`,
      images: [
        {
          url: "/summary.png",
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${wildfireName} Wildfire | Wildfire Tracker`,
      description: `Details and visualization for the ${wildfireName} wildfire`,
      images: [
        {
          url: "/summary.png",
        }
      ],
    }
  };
}

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
