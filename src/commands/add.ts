import { AmethystCommand, preconditions } from 'amethystjs';
import { ApplicationCommandOptionType } from 'discord.js';
import adminIfNotAlone from '../preconditions/adminIfNotAlone';
import connected from '../preconditions/connected';
import playing from '../preconditions/playing';
import { buildLocalizations, getRandomStation, resolveName } from '../utils/functions';
import { stations } from '../cache/stations';
import { players, playlists } from '../cache/players';

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
    const station = stations[options.getString('station')] ?? getRandomStation();
    const queue = players.get(interaction.guild.id)

    await interaction.deferReply();
    
    if (!station)
        return interaction
            .editReply(interaction.client.langs.getText(interaction, 'utils', 'stationNotFound'))
            .catch(() => {});

    interaction
        .editReply(
            interaction.client.langs.getText(interaction, 'addCommand', 'added', {
                stationName: resolveName(station),
                stationEmoji: station.emoji,
                stationUrl: station.url
            })
        )
        .catch(() => {});
    const pl = playlists.get(interaction.guild.id) ?? [];
    pl.push(station);

    playlists.set(interaction.guild.id, pl)
});
