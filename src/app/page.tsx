import Main from '@/components/main/Main';
import varnavas from '../../data/varnavas/wildfire.json'
import varnavasFires from '../../data/varnavas/fires.json'
import { Fire, WildfireSummary } from '@/lib/types';
import { ThemeProvider } from '@/contexts/ThemeProvider';

export default async function Home() {

    return <ThemeProvider
        attribute="class"
        forcedTheme="light">
        <Main />
    </ThemeProvider >
}