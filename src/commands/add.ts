import { AmethystCommand, preconditions } from 'amethystjs';
import { ApplicationCommandOptionType } from 'discord.js';
import adminIfNotAlone from '../preconditions/adminIfNotAlone';
import connected from '../preconditions/connected';
import playing from '../preconditions/playing';
import { buildLocalizations, getStationByUrl } from '../utils/functions';

export default new AmethystCommand({
    name: 'add',
    description: 'Add a station to the queue',
    preconditions: [preconditions.GuildOnly, playing, connected, adminIfNotAlone],
    options: [
        {
            name: 'station',
            description: 'Station to add to the queue',
            type: ApplicationCommandOptionType.String,
            required: false,
            autocomplete: true,
            nameLocalizations: buildLocalizations('add').options.station.name,
            descriptionLocalizations: buildLocalizations('add').options.station.description
        }
    ],
    nameLocalizations: buildLocalizations('add').name,
    descriptionLocalizations: buildLocalizations('add').description
}).setChatInputRun(async ({ interaction, options }) => {
    const station = getStationByUrl(options.getString('station'));
    const queue = interaction.client.player.nodes.get(interaction.guild);

    if (queue.currentTrack.duration === '0:00' || queue.tracks.filter((x) => x.duration === '0:00').length > 0)
        return interaction
            .reply(interaction.client.langs.getText(interaction, 'addCommand', 'addAtEndOfRadio'))
            .catch(() => {});

    await interaction.deferReply();
    const search = await interaction.client.player.search(station.url, {
        requestedBy: interaction.user
    });

    if (!search || search.tracks.length === 0)
        return interaction
            .editReply(interaction.client.langs.getText(interaction, 'utils', 'stationNotFound'))
            .catch(() => {});

    interaction
        .editReply(
            interaction.client.langs.getText(interaction, 'addCommand', 'added', {
                stationName: station.name,
                stationEmoji: station.emoji,
                stationUrl: station.url
            })
        )
        .catch(() => {});
    queue.addTrack(search.tracks[0]);
});
