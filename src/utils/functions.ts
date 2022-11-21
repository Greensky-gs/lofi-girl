import { Client, VoiceChannel } from 'discord.js';
import { station } from '../typings/station';
import { stations, emojis } from './configs.json';

export const getStationByUrl = (value?: string, getRandomIfNotProvided?: boolean) => {
    if ((!value || value === 'random') && getRandomIfNotProvided !== false)
        return stations[Math.floor(Math.random() * stations.length)];

    return stations.find((x) => x.url === value);
};
export const checkForDuplicates = (): station[] => {
    const tests: station[] = [];
    const duplicated: station[] = [];

    for (const st of stations as station[]) {
        if (tests.includes(st)) duplicated.push(st);
        else tests.push(st);
    }
    return duplicated;
};
export const inviteLink = (client: Client) => {
    return `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=2184464640&scope=bot%20applications.commands`;
};
export const formatTime = (timeInSeconds: number): string => {
    let seconds = 0;
    let minutes = 0;
    let hours = 0;

    for (let i = 0; i < timeInSeconds; i++) {
        seconds++;
        if (seconds === 60) {
            minutes++;
            seconds = 0;
            if (minutes === 60) {
                hours++;
                minutes = 0;
            }
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
            values.push(`${x.x} ${x.x === 1 ? x.y.substring(0, x.y.length - 1) : x.y}`);
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
export const isUserAlone = (channel: VoiceChannel) => {
    return channel.members.filter((x) => !x.user.bot).size === 1;
};
export const checkForEnv = () => {
    ['token', 'botOwner'].forEach((x) => {
        if (!process.env[x]) {
            throw new Error('Token or botOwner is missing in .env file');
        }
    });
};
export const boolEmojis = (b: boolean) => emojis[b ? 'online' : 'dnd'];
