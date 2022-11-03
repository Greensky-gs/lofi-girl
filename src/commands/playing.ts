import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { getBasicInfo } from 'ytdl-core';
import voice from '../maps/voice';
import { LofiCommand } from '../structures/Command';
import { station } from '../typings/station';
import { stations } from '../utils/configs.json';
import { getQueue, getRandomStation, getStation, getVidId } from '../utils/functions';

export default new LofiCommand({
    name: 'playing',
    description: 'Shows actual music in channel',
    dm: false,
    admin: false,
    cooldown: 10,
    execute: async ({ interaction }) => {
        const queue = getQueue(interaction.guild.id);
        if (!queue) return interaction.reply(`:x: | I'm not playing music in a channel`).catch(() => {});
        const station = stations.find((x) => x.url === queue.url);

        await interaction.deferReply();
        const info = await getBasicInfo(station.url);

        const em = new EmbedBuilder()
            .setTitle(station.name)
            .setURL(station.url)
            .setDescription(`You are listening to [${station.emoji} ${station.name}](${station.url})`)
            .setFields(
                {
                    name: station.emoji + ' Duration',
                    value:
                        station.type === 'playlist'
                            ? `~${Math.floor(parseInt(info.videoDetails.lengthSeconds))} minutes`
                            : 'Live',
                    inline: true
                },
                {
                    name: '🎧 Volume',
                    value: `${Math.floor(queue.ressource.volume.volume / 100)}%`,
                    inline: true
                }
            )
            .setColor('DarkGreen')
            .setThumbnail(info.thumbnail_url ?? interaction.client.user.displayAvatarURL({ forceStatic: true }));

        interaction
            .editReply({
                embeds: [em],
                components: [
                    new ActionRowBuilder({
                        components: [
                            new ButtonBuilder({
                                label: 'View on youtube',
                                url: station.url,
                                emoji: station.emoji,
                                style: ButtonStyle.Link
                            })
                        ]
                    }) as ActionRowBuilder<ButtonBuilder>
                ]
            })
            .catch(() => {});
    }
});
