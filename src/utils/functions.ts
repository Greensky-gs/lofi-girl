import { stations } from './configs.json';

export const getStationByUrl = (value: string) => {
    if (value === 'random') return stations[Math.floor(Math.random() * stations.length)];
    return stations.find(x => x.url === value);
}