require('dotenv').config();

import { AmethystClient } from 'amethystjs';
import { ActivityType, Partials } from 'discord.js';
import { checkForEnv } from './utils/functions';
import { Langs } from './langs/Manager';

checkForEnv();

export const client = new AmethystClient(
    {
        intents: ['Guilds', 'GuildVoiceStates', 'GuildMessages', 'DirectMessages'],
        partials: [Partials.Channel, Partials.Message]
    },
    {
        // Folders
        commandsFolder: './dist/commands',
        eventsFolder: './dist/events',
        preconditionsFolder: './dist/preconditions',
        autocompleteListenersFolder: './dist/autocompletes',
        buttonsFolder: './dist/buttons',
        commandsArchitecture: 'simple',
        // Booleans
        debug: true,
        strictPrefix: false,
        botNameWorksAsPrefix: true,
        mentionWorksAsPrefix: false,
        // Client data
        token: process.env.beta_token ? process.env.beta_token : process.env.token,
        prefix: process.env.botPrefix ?? 'lf!',
        botName: 'lofigirl',
        activity: {
            type: ActivityType.Listening,
            name: 'Lofi'
        }
    }
);


client.start({});

declare module 'discord.js' {
    interface Client {
        langs: Langs;
    }
}
