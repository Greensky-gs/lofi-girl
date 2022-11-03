import { CommandInteractionOptionResolver } from 'discord.js';
import voice from '../maps/voice';
import { station } from '../typings/station';
import { stations } from './configs.json';
import { emojis } from './configs.json';

export const boolEmojis = (b: boolean): string => emojis[b ? 'online' : 'dnd'];
export const getRandomStation = (): station => {
    return (stations as station[])[Math.floor(Math.random() * stations.length)];
}
export const getStation = (options: CommandInteractionOptionResolver): station => {
    const s = options.getString('station');
    if (s === 'random') return getRandomStation();
    return (stations as station[]).find(x => x.url === s);
}
export const defaultStation = (): station => {
    return (stations as station[])[0];
}
export const getQueue = (guild: string) => {
    return voice.get(guild);
}
export const getVidId = (url: string) => {
    return url.slice(32)
}