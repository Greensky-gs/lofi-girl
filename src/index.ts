import { AmethystClient } from 'amethystjs';
import { Player, Queue } from 'discord-player';
import { ButtonBuilder, ButtonStyle, EmbedBuilder, Partials } from 'discord.js';
import { config } from 'dotenv';
import {
    boolEmojis,
    checkForDuplicates,
    checkForEnv,
    getLoopState,
    getRandomStation,
    getStationByUrl,
    getTester,
    row,
    setLoopState
} from './utils/functions';
import { TesterButtons } from './typings/tester';
import { queuesUsers } from './utils/maps';

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
        partials: [Partials.Channel, Partials.Message, Partials.Reaction]
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
            requestedBy: queuesUsers.get(queue.guild.id) ?? client.user
        })
        .catch(() => {});

    if (!track || track.tracks.length === 0) return;
    queue.play(track.tracks[0]);
});
client.player.on('botDisconnect', (queue: Queue) => {
    if (!getLoopState(queue.guild.id)) return;
    setLoopState(queue.guild.id, false);

    queue.previousTracks = [];
    queue.tracks = [];
    queuesUsers.delete(queue.guild.id);
});
client.player.on('trackEnd', (queue, track) => {
    if (getTester(track.requestedBy.id)) {
        const data = getTester(track.requestedBy.id);
        if (data.when === 'everytime' || data.when === 'songend') {
            const station = getStationByUrl(track.url);
            if (station && !station.feedbacks.find((x) => x.user_id === track.requestedBy.id)) {
                track.requestedBy
                    .send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`${station.emoji} ${station.name}`)
                                .setURL(station.url)
                                .setImage(track.thumbnail ?? undefined)
                                .setDescription(
                                    `Do you want to send your feedback about [${station.emoji} ${station.name}](${station.url}) ?`
                                )
                                .setColor('#F4554B')
                        ],
                        components: [
                            row(
                                new ButtonBuilder({
                                    label: 'Send feedback',
                                    emoji: boolEmojis(true),
                                    customId: TesterButtons.SendFeedback,
                                    style: ButtonStyle.Success
                                })
                            )
                        ]
                    })
                    .catch(() => {});
            }
        }
    }
    queue.previousTracks = [];
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
