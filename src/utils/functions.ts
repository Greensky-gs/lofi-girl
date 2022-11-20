import { station } from '../typings/station';
import { stations } from './configs.json';

export const getStationByUrl = (value: string) => {
    if (value === 'random') return stations[Math.floor(Math.random() * stations.length)];
    return stations.find(x => x.url === value);
}
export const checkForDuplicates = (): station[] => {
    const tests: station[] = [];
    const duplicated: station[] = [];

    for (const st of stations as station[]) {
        if (tests.includes(st)) duplicated.push(st);
        else tests.push(st);
    }
    return duplicated;
}