import { createAudioPlayer, createAudioResource, joinVoiceChannel } from '@discordjs/voice';
import { ApplicationCommandOptionType } from 'discord.js';
import ytdl from 'ytdl-core';
import voice from '../maps/voice';
import { LofiCommand } from '../structures/Command';
import { stations } from '../utils/configs.json';
import { getStation } from '../utils/functions';

export default new LofiCommand({
    name: 'station',
    description: 'Changes the music station',
    admin: true,
    dm: false,
    cooldown: 10,
    options: [
        {
            name: 'station',
            description: 'Music station you want to switch',
            required: true,
            autocomplete: true,
            type: ApplicationCommandOptionType.String
        }
    ],
    execute: async ({ interaction, options }) => {
        const station = getStation(options.getString('station'));
        let queue = interaction.client.player.getQueue(interaction.guild);
        const v = voice.get(interaction.guild.id);

        if (!queue && !v) return interaction.reply(`:x: | I'm not connected to a voice channel`).catch(() => {});

        await interaction.deferReply();
        if (station.type === 'playlist') {    
            const search = await interaction.client.player.search(station.url, {
                requestedBy: interaction.user
            });
    
            if (!search || search.tracks.length === 0)
                return interaction.editReply(`:x: | Music not found`).catch(() => {});
            const found = `:white_check_mark: | Music found`;
            await interaction.editReply(found);
            const channel = await interaction.guild.channels.fetch(v.connection.joinConfig.channelId);

            v.player.pause();
            voice.delete(interaction.guild.id);
    
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

            if (!queue.connection) {
                await queue.connect(channel);
            }

            if (!queue.playing) {
                console.log(search.tracks[0]);
                await queue.play(search.tracks[0], {
                    immediate: true
                }).catch(console.log)
            } else {
                queue.addTrack(search.tracks[0]);
                queue.skip();
            }
        } else {
            const rs = createAudioResource(ytdl(station.url), {
                inlineVolume: true
            });
            if (!v) {
                interaction.client.player.deleteQueue(interaction.guild);
                const connection = joinVoiceChannel({
                    channelId: queue.connection.channel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator
                });
                const player = createAudioPlayer();
                connection.subscribe(player);
                player.play(rs);

                voice.set(interaction.guild.id, {
                    player, connection,
                    url: station.url,
                    ressource: rs
                });
            } else {
                v.player.play(rs);
                v.ressource = rs;
                v.url = station.url;
                voice.set(interaction.guild.id, v);
            }
        }
        interaction
            .editReply(`:white_check_mark: | Music found\n🎧 | Playing music\n${station.emoji} | Switched to ${station.name}\n:warning: | If the music isn't playing, use the command \`/play\` instead`)
            .catch(() => {});
    }
});
