import { EmbedBuilder } from "discord.js";
import { LofiCommand } from "../structures/Command";
import { station } from "../typings/station";
import { stations } from '../utils/configs.json';

export default new LofiCommand({
    name: 'playing',
    description: "Shows actual music in channel",
    dm: false,
    admin: false,
    cooldown: 10,
    execute: ({ interaction }) => {
        const queue = interaction.client.player.getQueue(interaction.guild);
        if (!queue || !queue.playing) return interaction.reply(`:x: | I'm not playing any music in a channel`).catch(() => {});

        const station = stations.find(x => x.url === queue.nowPlaying().url) as station;
        const em = new EmbedBuilder()
            .setTitle(`${station.emoji} ${station.name}`)
            .setURL(station.url)
            .setFields(
                {
                    name: 'Type',
                    value: station.type === 'playlist' ? 'Music' : 'Live',
                    inline: false
                }
            )
    }
})