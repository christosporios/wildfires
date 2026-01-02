// OLD CODE - Uncomment below and comment out MaintenanceNotice to revert
// import Main from '@/components/main/Main';
import MaintenanceNotice from '@/components/MaintenanceNotice';
import { ThemeProvider } from '@/contexts/ThemeProvider';

export default async function Home() {

    return <ThemeProvider
        attribute="class"
        forcedTheme="light">
        {/* OLD CODE - Uncomment below and comment out MaintenanceNotice to revert */}
        {/* <Main /> */}
        <MaintenanceNotice />
    </ThemeProvider >
}