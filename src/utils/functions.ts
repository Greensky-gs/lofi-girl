import { Client, VoiceChannel } from 'discord.js';
import { station } from '../typings/station';
import { stations, emojis, recommendation } from './configs.json';
import { loops } from './maps';

export const getStationByUrl = (value?: string, getRandomIfNotProvided?: boolean): station => {
    if ((!value || value === 'random') && getRandomIfNotProvided !== false)
        return (stations as station[])[Math.floor(Math.random() * stations.length)];

    if (value === 'recommendation') return recommendation as station;
    return (stations as station[]).find((x) => x.url === value);
};
export const checkForDuplicates = (): station[] => {
    const urls = [];
    const duplicatedURLS: string[] = [];

    stations.forEach((st: station) => {
        if (urls.includes(st.url)) {
            duplicatedURLS.push(st.url);
        } else {
            urls.push(st.url);
        }
    });
    return (stations as station[]).filter((x) => duplicatedURLS.includes(x.url));
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
    if (!process.env.token && !process.env.beta_token) {
        throw new Error('Token or beta_token is missing in .env file');
    }
    if (!process.env.botOwner) {
        throw new Error('botOwner is missing in .env file');
    }
};
export const boolEmojis = (b: boolean) => emojis[b ? 'online' : 'dnd'];
export const findEmoji = (txt: string) => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456798-_'\"()[]{}*.,?!:/;%ùø& ";
    let uniques = [];

    for (const c of txt) {
        if (!chars.includes(c.toLowerCase())) uniques.push(c)
    };
    if (uniques.length === 0) return '';
    if (uniques.length === 1) return uniques[0];
    
    uniques = uniques.sort((a, b) => txt.indexOf(a) - txt.indexOf(b)).reverse();
    if (uniques.length === 2) return uniques[1];
    return uniques[0];
}
export const getLoopState = (guildId: string) => {
    return loops.get(guildId) ?? false;
}
export const setLoopState = (guildId: string, state: boolean) => {
    return loops.set(guildId, state);
}
export const getRandomStation = (): station => {
    const availables = stations.filter(x => x.type !== 'station');
    return availables[Math.floor(Math.random() * availables.length)] as station;
}
