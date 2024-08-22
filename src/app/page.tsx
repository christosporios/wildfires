import Main from '@/components/main/Main';
import varnavas from '../../data/varnavas/wildfire.json'
import varnavasFires from '../../data/varnavas/fires.json'
import { WildfireSummary } from '@/lib/types';

const wildfires = [{ wildfire: varnavas, fires: varnavasFires } as WildfireSummary];
export default function Home() {
    return <Main wildfires={wildfires} />
}