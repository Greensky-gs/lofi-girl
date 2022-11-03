import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import voice from '../maps/voice';
import { LofiCommand } from '../structures/Command';
import { station } from '../typings/station';
import { stations } from '../utils/configs.json';

export default new LofiCommand({
    name: 'playing',
    description: 'Shows actual music in channel',
    dm: false,
    admin: false,
    cooldown: 10,
    execute: ({ interaction }) => {
        const queue = interaction.client.player.getQueue(interaction.guild);
        const v = voice.get(interaction.guild.id);
        if ((!queue || !queue.playing) && !v)
            return interaction.reply(`:x: | I'm not playing any music in a channel`).catch(() => {});

        const station = stations.find((x) => x.url === (queue?.nowPlaying() || v).url) as station;
        let bar: string;
        if (station.type === 'playlist') {
            bar = queue.createProgressBar();
            let arr = bar.split('🔘');

            bar = arr[0] + '🔘' + arr[1].replace(/▬/g, '-');
        }
        const em = new EmbedBuilder()
            .setTitle(`${station.emoji} ${station.name}`)
            .setURL(station.url)
            .setFields(
                {
                    name: station.emoji + ' Type',
                    value: station.type === 'playlist' ? 'Music' : 'Live',
                    inline: true
                },
                {
                    name: '🎧 Volume',
                    value: `${queue?.volume ?? v.ressource.volume.volume * 100}%`,
                    inline: true
                }
            )
            .setDescription(
                `You are listening to [${station.name}](${station.url})${station.type === 'playlist' ? '\n' + bar : ''}`
            )
            .setColor('DarkGreen')
            .setTimestamp();

        interaction
            .reply({
                embeds: [em],
                components: [
                    new ActionRowBuilder({
                        components: [new ButtonBuilder({ label: 'Link', url: station.url, style: ButtonStyle.Link })]
                    }) as ActionRowBuilder<ButtonBuilder>
                ]
            })
            .catch(() => {});
    }
});
