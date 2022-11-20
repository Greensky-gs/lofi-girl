import { AmethystClient } from "amethystjs"
import { Player } from "discord-player";
import { Partials, Client } from "discord.js"
import { config } from "dotenv";
import { checkForDuplicates } from "./utils/functions";

config();

const duplicated = checkForDuplicates();
if (duplicated.length > 0) {
    console.log(duplicated);
    throw new Error("Some musics are duplicated");
}

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
