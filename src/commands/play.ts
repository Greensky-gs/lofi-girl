import {
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    VoiceConnection
} from '@discordjs/voice';
import { ApplicationCommandOptionType } from 'discord.js';
import ytdl from 'ytdl-core';
import tracks from '../maps/tracks';
import voice from '../maps/voice';
import { LofiCommand } from '../structures/Command';
import { defaultStation, getQueue, getStation } from '../utils/functions';

export default new LofiCommand({
    name: 'play',
    description: 'Play music in your current voice channel',
    dm: false,
    cooldown: 5,
    admin: false,
    options: [
        {
            name: 'station',
            description: 'Music station you want to play',
            required: false,
            autocomplete: true,
            type: ApplicationCommandOptionType.String
        }
    ],
    execute: async ({ interaction, options }) => {
        const station = getStation(options) ?? defaultStation();

        const channel = interaction.member?.voice?.channel;
        if (!channel) return interaction.reply(`:x: | You need to be connected to a voice channel`).catch(() => {});

        const queue = getQueue(interaction.guild.id);
        if (
            queue &&
            queue.channel.members.filter((x) => !x.user.bot).size > 1 &&
            !interaction.member.permissions.has('Administrator')
        )
            return interaction
                .reply(`:x: | Only administrators can change the music when you're not alone`)
                .catch(() => {});

        const player = queue?.player ?? createAudioPlayer();
        const rs = createAudioResource(ytdl(station.url, { filter: 'audioonly' }), {
            inlineVolume: true
        });
        rs.volume.setVolume(1);

        let connection: VoiceConnection = queue?.connection;

        if (!queue) {
            connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: true
            });
        }
        connection.subscribe(player);
        player.play(rs);

        voice.set(interaction.guild.id, {
            connection,
            player,
            channel,
            ressource: rs,
            url: station.url
        });

        interaction.reply(`${station.emoji} | Playing ${station.name}`).catch(() => {});
        player.on('error', (e) => {
            console.log(e);
        });
        setTimeout(() => {
            player.on('error', (error) => {
                console.log('error detected');
                console.log(error);
                if (error.name === 'arborted') {
                    const { resource } = error;
                    player.play(resource);
                }
            });
            player.on('stateChange', (od, ne) => {
                if (od.status === AudioPlayerStatus.Playing && ne.status === AudioPlayerStatus.Idle) {
                    const trackList = tracks.get(interaction.guild.id);
                    const queue = getQueue(interaction.guild);

                    if (!queue.ressource.ended || !trackList || trackList?.length === 0 || !queue) return;

                    const next = trackList.splice(0, 1)[0];
                    tracks.set(interaction.guild.id, trackList);

                    const rse = createAudioResource(ytdl(next.url, { filter: 'audioonly' }), {
                        inlineVolume: true
                    });
                    rse.volume.setVolume(1);
                    queue.connection.subscribe(queue.player);
                    queue.player.play(rse);

                    queue.ressource = rse;
                    queue.url = next.url;

                    voice.set(interaction.guild.id, queue);
                }
            });
        });
    }
});
