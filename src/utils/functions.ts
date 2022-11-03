import { station } from '../typings/station';
import { stations } from './configs.json';
import { emojis } from './configs.json';

export const boolEmojis = (b: boolean): string => emojis[b ? 'online' : 'dnd'];
export const getRandomStation = (): station => {
    return (stations as station[])[Math.floor(Math.random() * stations.length)];
}
export const getStation = (value: 'random' | string): station => {
    if (value === 'random') return getRandomStation();
    return (stations as station[]).find(x => x.url === value);
}
