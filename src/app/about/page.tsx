import * as AboutC from "@/components/About";
import { ThemeProvider } from "@/contexts/ThemeProvider";
export default async function About() {
    return <ThemeProvider>
        <AboutC.default />
    </ThemeProvider>
}
