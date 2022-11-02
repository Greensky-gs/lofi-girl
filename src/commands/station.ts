import { ApplicationCommandOptionType } from 'discord.js';
import { LofiCommand } from '../structures/Command';
import { stations } from '../utils/configs.json';

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
        const station = stations.find((x) => x.url === options.getString('station'));
        const queue = interaction.client.player.getQueue(interaction.guild);

        if (!queue) return interaction.reply(`:x: | I'm not connected to a voice channel`).catch(() => {});
        await interaction.deferReply();

        const search = await interaction.client.player.search(station.url, {
            requestedBy: interaction.user
        });

        if (!search || search.tracks.length === 0)
            return interaction.editReply(`:x: | Music not found`).catch(() => {});
        const found = `:white_check_mark: | Music found`;
        await interaction.editReply(found);

        queue.addTrack(search.tracks[0]);
        queue.skip();
        interaction
            .editReply(`${found}\n🎧 | Playing music\n${station.emoji} | Switched to ${station.name}`)
            .catch(() => {});
    }
});
