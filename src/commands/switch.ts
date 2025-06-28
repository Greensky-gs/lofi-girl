import { AmethystCommand, log4js, preconditions } from "amethystjs";
import { buildLocalizations, getRandomStation, resolveName } from "../utils/functions";
import playing from "../preconditions/playing";
import adminIfNotAlone from "../preconditions/adminIfNotAlone";
import { ApplicationCommandOptionType } from "discord.js";
import { stations } from "../cache/stations";
import { players, playlists } from "../cache/players";
import { buildResource } from "../utils/playerUtils";

const locals = buildLocalizations('switch')
export default new AmethystCommand({
    name: 'switch',
    description: "Switch to another music station",
    preconditions: [preconditions.GuildOnly, playing, adminIfNotAlone],
    options: [
        {
            name: 'station',
            description: "Station to switch to",
            required: false,
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            nameLocalizations: locals.options.station.name,
            descriptionLocalizations: locals.options.station.description
        }
    ],
    nameLocalizations: locals.name,
    descriptionLocalizations: locals.description
}).setChatInputRun(async({ interaction, client, options }) => {
    await interaction.deferReply().catch(log4js.trace);
    const station = stations[options.getString('station')] ?? getRandomStation();

    const queue = players.get(interaction.guild.id);

    const pl = playlists.get(interaction.guild.id) ?? []
    const newPlaylist = [station, ...pl];

    playlists.set(interaction.guild.id, newPlaylist);
    queue.player.stop(true);

    interaction.editReply(client.langs.getText(interaction, 'switch', 'switched', {
        stationName: resolveName(station),
        stationEmoji: station.emoji,
        stationUrl: station.url
    })).catch(log4js.trace);
})