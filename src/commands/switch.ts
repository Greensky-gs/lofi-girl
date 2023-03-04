import { AmethystCommand, preconditions } from 'amethystjs';
import { ApplicationCommandOptionType } from 'discord.js';
import adminIfNotAlone from '../preconditions/adminIfNotAlone';
import playing from '../preconditions/playing';
import { getStationByUrl } from '../utils/functions';

export default new AmethystCommand({
    name: 'switch',
    description: 'Switch to another music station',
    preconditions: [preconditions.GuildOnly, playing, adminIfNotAlone],
    options: [
        {
            name: 'station',
            description: 'Station to switch',
            required: false,
            type: ApplicationCommandOptionType.String,
            autocomplete: true
        }
    ]
}).setChatInputRun(async ({ interaction, options }) => {
    await interaction.deferReply();
    const station = getStationByUrl(options.getString('station'));

    const tracks = await interaction.client.player.search(station.url, {
        requestedBy: interaction.user
    });
    if (!tracks || tracks.tracks.length === 0)
        return interaction.editReply(`:x: | Music station not found`).catch(() => {});

    const queue = interaction.client.player.nodes.get(interaction.guild);
    if (queue.tracks.size > 0) {
        const toAdd = queue.tracks.toArray().splice(0)
        queue.tracks.add([tracks.tracks[0], ...toAdd]);
    } else {
        queue.tracks.add(tracks.tracks[0]);
    }
    queue.node.skip();

    interaction.editReply(`🎧 | Switched to [${station.emoji} ${station.name}](<${station.url}>)`).catch(() => {});
});
