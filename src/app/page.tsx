import Main from '@/components/main/Main';
import { ThemeProvider } from '@/contexts/ThemeProvider';

export default async function Home() {

    return <ThemeProvider
        attribute="class"
        forcedTheme="light">
        <Main />
    </ThemeProvider >
}