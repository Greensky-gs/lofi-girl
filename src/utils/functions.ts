import { CommandInteraction, CommandInteractionOptionResolver, Guild } from 'discord.js';
import voice from '../maps/voice';
import { station } from '../typings/station';
import { stations } from './configs.json';
import { emojis } from './configs.json';

export const boolEmojis = (b: boolean): string => emojis[b ? 'online' : 'dnd'];
export const getRandomStation = (): station => {
    return (stations as station[])[Math.floor(Math.random() * stations.length)];
};
export const findStation = (url: string): station => {
    return stations.find((x) => x.url === url) as station;
};
export const getStation = (options: CommandInteractionOptionResolver): station => {
    const s = options.getString('station');
    if (s === 'random') return getRandomStation();
    return (stations as station[]).find((x) => x.url === s);
};
export const defaultStation = (): station => {
    return (stations as station[])[0];
};
export const getQueue = (guild: string | Guild | CommandInteraction) => {
    return voice.get(
        typeof guild === 'string'
            ? guild
            : (guild as Guild)?.ownerId
            ? guild.id
            : (guild as CommandInteraction).guild.id
    );
};
export const getVidId = (url: string) => {
    return url.slice(32);
};
export const getVidLink = (id: string) => `https://www.youtube.com/watch?v=${id}`;
export const formatTime = (timeInSeconds: number): string => {
    let seconds = timeInSeconds;
    let minutes = 0;
    let hours = 0;

    while (seconds >= 60) {
        seconds--;
        minutes++;
        if (minutes === 60) {
            minutes = 0;
            hours++;
        }
    }
    let res = '';
    const values: string[] = [];
    [
        { x: hours, y: 'hours' },
        { x: minutes, y: 'minutes' },
        { x: seconds, y: 'seconds' }
    ]
        .filter((x) => x.x > 0)
        .forEach((x) => {
            values.push(`${x.x} ${x.y}`);
        });

    values.forEach((v, i) => {
        res += `${v}`;
        const next = values[i + 1];
        if (!next) return;
        const dnext = values[i + 2];
        let sep = dnext ? ',' : ' and';
        res += sep + ' ';
    });
    return res;
};
