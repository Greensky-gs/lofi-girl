import { AmethystClient } from 'amethystjs';
import { Player, Queue } from 'discord-player';
import { Partials, Client } from 'discord.js';
import { config } from 'dotenv';
import {
    checkForDuplicates,
    checkForEnv,
    getLoopState,
    getRandomStation,
    getStationByUrl,
    setLoopState
} from './utils/functions';

config();

const duplicated = checkForDuplicates();
if (duplicated.length > 0) {
    console.log(duplicated);
    throw new Error('Some musics are duplicated');
}
checkForEnv();

export const client = new AmethystClient(
    {
        intents: ['Guilds', 'GuildVoiceStates', 'GuildMessages', 'MessageContent', 'DirectMessages'],
        partials: [Partials.Channel, Partials.Message]
    },
    {
        // Folders
        commandsFolder: './dist/commands',
        eventsFolder: './dist/events',
        preconditionsFolder: './dist/preconditions',
        autocompleteListenersFolder: './dist/autocompletes',
        buttonsFolder: './dist/buttons',
        // Booleans
        debug: true,
        strictPrefix: false,
        botNameWorksAsPrefix: true,
        mentionWorksAsPrefix: false,
        // Client data
        token: process.env.beta_token ? process.env.beta_token : process.env.token,
        prefix: process.env.botPrefix ?? 'lf!',
        botName: 'lofigirl'
    }
);

client.player = new Player(client, {
    ytdlOptions: {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 30
    }
});
client.player.on('queueEnd', async (queue: Queue) => {
    if (!getLoopState(queue.guild.id)) return;

    const track = await client.player
        .search(getRandomStation().url, {
            requestedBy: client.user
        })
        .catch(() => {});

    if (!track || track.tracks.length === 0) return;
    queue.play(track.tracks[0]);
});
client.player.on('botDisconnect', (queue: Queue) => {
    if (!getLoopState(queue.guild.id)) return;
    setLoopState(queue.guild.id, false);
});

client.start({});

declare module 'discord.js' {
    interface Client {
        player: Player;
    }
}
declare module 'amethystjs' {
    interface AmethystClient {
        player: Player;
    }
}
