import { AmethystCommand, preconditions } from "amethystjs";
import { ApplicationCommandOptionType } from "discord.js";
import adminIfNotAlone from "../preconditions/adminIfNotAlone";
import playing from "../preconditions/playing";
import { getStationByUrl } from "../utils/functions";

export default new AmethystCommand({
    name: 'switch',
    description: "Switch to another music station",
    preconditions: [ preconditions.GuildOnly, playing, adminIfNotAlone ],
    options: [
        {
            name: 'station',
            description: "Station to switch",
            required: false,
            type: ApplicationCommandOptionType.String,
            autocomplete: true
        }
    ]
})
.setChatInputRun(async({ interaction, options }) => {
    interaction.deferReply();
    const station = getStationByUrl(options.getString('station'));

    const tracks = await interaction.client.player.search(station.url, {
        requestedBy: interaction.user
    });
    if (!tracks || tracks.tracks.length === 0) return interaction.editReply(`:x: | Music station not found`).catch(() => {});

    interaction.client.player.getQueue(interaction.guild).play(tracks.tracks[0]);
    interaction.editReply(`🎧 | Switched to [${station.emoji} ${station.name}](<${station.url}>)`).catch(() => {});
})