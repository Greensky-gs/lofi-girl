import { AmethystClient } from 'amethystjs';
import { Player } from 'discord-player';
import { Partials, Client } from 'discord.js';
import { config } from 'dotenv';
import { checkForDuplicates, checkForEnv } from './utils/functions';

config();

const duplicated = checkForDuplicates();
checkForEnv();
if (duplicated.length > 0) {
    console.log(duplicated);
    throw new Error('Some musics are duplicated');
}

export const client = new AmethystClient(
    {
        intents: ['Guilds', 'GuildVoiceStates', 'GuildMessages', 'MessageContent', 'DirectMessages'],
        partials: [Partials.Channel, Partials.Message]
    },
    {
        commandsFolder: './dist/commands',
        token: process.env.beta_token ? process.env.beta_token : process.env.token,
        eventsFolder: './dist/events',
        debug: true,
        preconditionsFolder: './dist/preconditions',
        autocompleteListenersFolder: './dist/autocompletes',
        prefix: 'lf!',
        strictPrefix: false,
        botName: 'lofigirl',
        botNameWorksAsPrefix: true,
        mentionWorksAsPrefix: false
    }
);

client.player = new Player(client, {
    ytdlOptions: {
        filter: 'audioonly',
        quality: 'highestaudio'
    }
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
