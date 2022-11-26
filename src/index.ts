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
