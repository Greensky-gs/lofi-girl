import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { LofiCommand } from '../structures/Command';
import { stations } from '../utils/configs.json';
import { station } from '../typings/station';
import { Player } from 'discord-player';
import { createAudioPlayer, createAudioResource, joinVoiceChannel } from '@discordjs/voice';
import ytdl from 'ytdl-core';
import voice from '../maps/voice';

export default new LofiCommand({
    name: 'play',
    description: 'Join your voice channel and starts playing lofi music',
    options: [
        {
            name: 'station',
            description: 'Play a specific station',
            required: false,
            autocomplete: true,
            type: ApplicationCommandOptionType.String
        }
    ],
    admin: false,
    dm: false,
    cooldown: 5,
    execute: async ({ interaction, options }) => {
        const station = (stations.find((x) => x.url === options.getString('station')) ?? stations[0]) as station;

        const channel = (interaction.member as GuildMember)?.voice?.channel;
        if (!channel) return interaction.reply(`:x: | You're not connected to a voice channel`).catch(() => {});

        if (station.type === 'station') {
            const x = voice.get(interaction.guild.id);
            if (x && !(interaction.member as GuildMember).permissions.has('Administrator')) return interaction.reply(`:x: | I'm sorry, only administrators can change the music station or the music channel`);

            const connection = joinVoiceChannel({
                channelId: channel.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                guildId: interaction.guild.id,
                selfDeaf: true,
                selfMute: false
            });
        
            await interaction.deferReply();
        
            const rs = createAudioResource(ytdl(station.url, { range: { start: 0 } }), {
                inlineVolume: true
            });
            rs.volume.setVolume(1);
        
            const player = createAudioPlayer();
            connection.subscribe(player);
            player.play(rs);

            voice.set(interaction.guild.id, { player, connection, ressource: rs, url: station.url });
        } else {
            let queue = interaction.client.player.getQueue(interaction.guild);
            if (!queue) {
                interaction.client.player.createQueue(interaction.guild, {
                    metadata: {
                        channel: interaction.channel
                    },
                    ytdlOptions: {
                        quality: 'highestaudio',
                        dlChunkSize: 0,
                        filter: 'audioonly',
                        highWaterMark: 1 << 30
                    }
                });
                queue = interaction.client.player.getQueue(interaction.guild);
            }

            if (queue.connection && !(interaction.member as GuildMember).permissions.has('Administrator'))
                return interaction
                    .reply(`:x: | Sorry, only administrators can, change the music or the music channel`)
                    .catch(() => {});

            await interaction.deferReply();
            const tracks = await interaction.client.player
                .search(station.url, {
                    requestedBy: interaction.user
                })
                .catch(console.log);

            if (!tracks || tracks.tracks.length === 0)
                return interaction
                    .editReply(
                        `:x: | An error occured, I can't find the music.\n> Please contact my developper if it happens again.`
                    )
                    .catch(() => {});
            if (!queue.connection) await queue.connect(channel);
                await queue.play(tracks.tracks[0], {
                    immediate: true
                });
        }

        interaction.editReply(`${station.emoji} | Playing ${station.name}`).catch(() => {});
    }
});
