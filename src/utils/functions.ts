import {
    ActionRowBuilder,
    AnyComponentBuilder,
    AttachmentBuilder,
    BaseInteraction,
    ButtonBuilder,
    Client,
    GuildMember,
    TextChannel,
    VoiceChannel
} from 'discord.js';
import { emojis } from './configs.json';
import { loops } from './maps';
import { Langs, localizationBuilder, localizationsType } from '../langs/Manager';
import { log4js } from 'amethystjs';
import { stations } from '../cache/stations';
import { stationType } from '../typings/firebase';


export const inviteLink = (client: Client) => {
    return `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=2184464640&scope=bot%20applications.commands`;
};
export const formatTime = (timeInSeconds: number, interaction: BaseInteraction): string => {
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
        { x: hours, y: interaction.client.langs.getText(interaction, 'formatTime', 'hours') },
        { x: minutes, y: interaction.client.langs.getText(interaction, 'formatTime', 'minutes') },
        { x: seconds, y: interaction.client.langs.getText(interaction, 'formatTime', 'seconds') }
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
        let sep = dnext ? ',' : ' ' + interaction.client.langs.getText(interaction, 'formatTime', 'joiner');
        res += sep + ' ';
    });
    return res;
};
export const isUserAlone = (channel: VoiceChannel) => {
    return (channel?.members?.filter((x) => !x.user.bot)?.size ?? 0) === 1;
};
export const checkForEnv = () => {
    if (!process.env.token && !process.env.beta_token) {
        throw new Error('Token or beta_token is missing in .env file');
    }
    if (!process.env.botOwner) {
        throw new Error('botOwner is missing in .env file');
    }
    if (!process.env.panelChannel) {
        throw new Error('panelChannel is missing in .env file');
    }
};
export const boolEmojis = (b: boolean) => emojis[b ? 'online' : 'dnd'];
export const findEmoji = (txt: string) => {
    const chars = "'" + 'abcdefghijklmnopqrstuvwxyz0123456798-_"()[]{}*.,?!:/;%ùø&éà@^\\|è~ ';
    let uniques = [];

    for (const c of txt) {
        if (!chars.includes(c.toLowerCase())) uniques.push(c);
    }
    if (uniques.length === 0) return '';
    if (uniques.length === 1) return uniques[0];

    uniques = uniques.sort((a, b) => txt.indexOf(a) - txt.indexOf(b)).reverse();
    if (uniques.length === 2) return uniques[1];
    return uniques[0];
};
export const getLoopState = (guildId: string) => {
    return loops.get(guildId) ?? false;
};
export const setLoopState = (guildId: string, state: boolean) => {
    return loops.set(guildId, state);
};
export const row = <T extends AnyComponentBuilder = ButtonBuilder>(...components: T[]) => {
    return new ActionRowBuilder({
        components: components
    }) as ActionRowBuilder<T>;
};
export const resizeStr = (str: string, size?: number) => {
    const max = size ?? 100;
    if (str.length <= max) return str;
    return str.substring(0, size - 3) + '...';
};
export const isLofIManager = (member: GuildMember) => member.roles.cache.some(x => x.name === 'lofi')
export const autoDump = async(client: Client) => {
    const now = new Date();
    const date = `${now.getFullYear()}/${now.getMonth()}/${now.getDate()}:${now.getHours()}:${now.getMinutes()}`

    const file = new AttachmentBuilder('./dist/utils/configs.json')
        .setName('configs.json')
        .setDescription(`From ${date}`);

    const channel = await client.channels.fetch(process.env.dumpChannel)?.catch(log4js.trace) as TextChannel
    if (!channel) return

    channel.send({
        content: `✅ | Dump config\nConfig file from ${date}`,
        files: [file]
    }).catch(log4js.trace)
}
export const setDumpClock = (client: Client) => {
    const midnight = new Date(new Date().setHours(0, 0, 0, 0) + 86400000)
    const diff = midnight.getTime() - Date.now()

    setTimeout(() => {
        autoDump(client)

        setInterval(() => {
            autoDump(client)
        }, 86400000)
    }, diff)

}
export const getRandomStation = () => {
    const keys = Object.keys(stations);
    if (keys.length === 0) return null;
    
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return stations[randomKey];
}
export const convertTimestampToSeconds = (timestamp: string) => {
    const parts = timestamp.split(':');
    const integers = parts.map(x => parseInt(x))

    if (parts.length === 3) {
        return integers[0] * 3600 + integers[1] * 60 + integers[2];
    }
    if (parts.length === 2) {
        return integers[0] * 60 + integers[1];
    }
    if (parts.length === 1) {
        return integers[0];
    }
}
export const convertSecondsToTimestamp = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(hours.toString().padStart(2, '0'));
    parts.push(minutes.toString().padStart(2, '0'));
    parts.push(seconds.toString().padStart(2, '0'));

    return parts.join(':');
}
export const resolveName = (station: stationType<false>) => `${station.authors.join(' x ')} - ${station.title} ${station.beats}`.trim();
export const buildLocalizations = <Key extends keyof localizationsType<'commands'>>(command: Key): localizationBuilder<Key> => {
    const langs = new Langs();
    return langs.buildLocalizations(command);
};