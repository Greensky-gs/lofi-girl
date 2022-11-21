import { AmethystCommand, preconditions } from "amethystjs";
import { ApplicationCommandOptionType } from "discord.js";
import adminIfNotAlone from "../preconditions/adminIfNotAlone";
import connected from "../preconditions/connected";
import playing from "../preconditions/playing";
import { getStationByUrl } from "../utils/functions";

export default new AmethystCommand({
    name: 'add',
    description: "Add a station to the queue",
    preconditions: [ preconditions.GuildOnly, playing, connected, adminIfNotAlone ],
    options: [
        {
            name: 'station',
            description: "Station to add to the queue",
            type: ApplicationCommandOptionType.String,
            required: false,
            autocomplete: true
        }
    ]
}).setChatInputRun(async({ interaction, options }) => {
    const station = getStationByUrl(options.getString('station'));
    const queue = interaction.client.player.getQueue(interaction.guild);

    if (queue.nowPlaying().duration === '0:00' || queue.tracks.filter(x => x.duration === '0:00').length > 0) return interaction.reply(`:x: | You can't add a station after a never-ending station`).catch(() => {});

    interaction.deferReply();
    const search = await interaction.client.player.search(station.url, {
        requestedBy: interaction.user
    });

    if (!search || search.tracks.length === 0) return interaction.editReply(`:x: | Music not found.`).catch(() => {});

    interaction.editReply(`🎧 | Add [${station.emoji} ${station.name}](<${station.url}>) to the queue`);
    queue.addTrack(search.tracks[0]);
})