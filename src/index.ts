import { AmethystClient } from "amethystjs"
import { Player } from "discord-player";
import { Partials, Client } from "discord.js"
import { config } from "dotenv";

config();

export const client = new AmethystClient({
    intents: ['Guilds', 'GuildVoiceStates'],
    partials: [Partials.Channel]
}, {
    commandsFolder: './dist/commands',
    token: process.env.beta_token ? process.env.beta_token : process.env.token,
    eventsFolder: './dist/events',
    debug: true,
    preconditionsFolder: './dist/preconditions',
    autocompleteListenersFolder: './dist/autocompletes'
})

client.player = new Player(client, {
    ytdlOptions: {
        filter: 'audioonly',
        quality: 'highestaudio'
    }
})

client.start({});

declare module 'discord.js' {
    interface Client {
        player: Player
    }
}
declare module 'amethystjs' {
    interface AmethystClient {
        player: Player
    }
}
