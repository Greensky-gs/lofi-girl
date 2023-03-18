import { AmethystCommand, preconditions } from 'amethystjs';
import { ApplicationCommandOptionType } from 'discord.js';
import adminIfNotAlone from '../preconditions/adminIfNotAlone';
import playing from '../preconditions/playing';
import { buildLocalizations, getStationByUrl } from '../utils/functions';

const locals = buildLocalizations('switch');
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
            autocomplete: true,
            nameLocalizations: locals.options.station.name,
            descriptionLocalizations: locals.options.station.description
        }
    ],
    nameLocalizations: locals.name,
    descriptionLocalizations: locals.description
}).setChatInputRun(async ({ interaction, options }) => {
    await interaction.deferReply();
    const station = getStationByUrl(options.getString('station'));

    const tracks = await interaction.client.player.search(station.url, {
        requestedBy: interaction.user
    });
    if (!tracks || tracks.tracks.length === 0)
        return interaction
            .editReply(interaction.client.langs.getText(interaction, 'utils', 'stationNotFound'))
            .catch(() => {});

    const queue = interaction.client.player.nodes.get(interaction.guild);
    if (queue.tracks.size > 0) {
        const toAdd = queue.tracks.toArray().splice(0);
        queue.tracks.add([tracks.tracks[0], ...toAdd]);
    } else {
        queue.tracks.add(tracks.tracks[0]);
    }
    queue.node.skip();

    interaction
        .editReply(
            interaction.client.langs.getText(interaction, 'switch', 'switched', {
                stationName: station.name,
                stationEmoji: station.emoji,
                stationUrl: station.url
            })
        )
        .catch(() => {});
});
