import { ApplicationCommandOptionType } from 'discord.js';
import tracks from '../maps/tracks';
import { LofiCommand } from '../structures/Command';
import { station } from '../typings/station';
import { findStation, getQueue, getStation } from '../utils/functions';

export default new LofiCommand({
    name: 'add',
    description: 'Add a station to the queue',
    admin: false,
    dm: false,
    cooldown: 5,
    options: [
        {
            name: 'station',
            description: 'Station to add to the queue',
            autocomplete: true,
            required: true,
            type: ApplicationCommandOptionType.String
        }
    ],
    execute: async ({ interaction, options }) => {
        const queue = getQueue(interaction.guild);
        const station = getStation(options);

        if (!queue) return interaction.reply(`:x: | I'm not connected to a voice channel`).catch(() => {});
        if (findStation(queue.url).type === 'station') return interaction.reply(`:x: | You can't add a music after an infinite one`).catch(() => {});

        const trackList: station[] = tracks.get(interaction.guild.id) || [];
        if (trackList[trackList.length - 1]?.type === 'station') return interaction.reply(`:x: | The last music station of the playlist is a live. You can't add a music after an infinite one`).catch(() => {});

        trackList.push(station);
        tracks.set(interaction.guild.id, trackList);
        interaction.reply(`${station.emoji} | Added ${station.name} to the queue`).catch(() => {});
    }
});
