import { ApplicationCommandOptionType } from 'discord.js';
import { LofiCommand } from '../structures/Command';
import { stations } from '../utils/configs.json';

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
        const queue = interaction.client.player.getQueue(interaction.guild);
        if (!queue) return interaction.reply(`:x: | I'm not playing music in a channel`).catch(() => {});

        if (queue.nowPlaying().duration === '0:00' || queue.tracks[queue.tracks.length - 1]?.duration === '0:00')
            return interaction.reply(`:x: | You can't add a station to play it after a station (live)`).catch(() => {});

        const station = stations.find((x) => x.url === options.getString('station'));
        let reply: string = '🔊 | Searching station';

        const getRep = (rep: string) => {
            reply += `\n${rep}`;
            return reply;
        };
        await interaction.reply(reply).catch(() => {});
        const track = await interaction.client.player.search(station.url, {
            requestedBy: interaction.user
        });

        if (!track || track.tracks.length === 0)
            return interaction.editReply(getRep(`:x: | Music station not found`)).catch(() => {});
        await interaction.editReply(getRep(`:white_check_mark: | Music station found`)).catch(() => {});

        queue.addTrack(track.tracks[0]);
        setTimeout(() => {
            interaction.editReply(getRep(`${station.emoji} | Added ${station.name} to queue`)).catch(() => {});
        }, 2000);
    }
});
