import { AmethystCommand, preconditions } from "amethystjs";
import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import connected from '../preconditions/connected';
import { getStationByUrl } from "../utils/functions";

export default new AmethystCommand({
    name: 'play',
    description: "Plays a lofi music",
    preconditions: [ preconditions.GuildOnly, connected ],
    options: [
        {
            name: 'station',
            description: "Station to play",
            required: false,
            autocomplete: true,
            type: ApplicationCommandOptionType.String
        }
    ]
})
.setChatInputRun(async ({ interaction, options }) => {
    const station = getStationByUrl(options.getString('station') ?? 'random');

    await interaction.deferReply();
    const search = await interaction.client.player.search(station.url, {
        requestedBy: interaction.user
    });

    if (!search || search.tracks.length === 0) return interaction.editReply(`:x: | Station not found`);
    interaction.editReply(`🎧 | Playing [${station.emoji} ${station.name}](${station.url}) in <#${(interaction.member as GuildMember).voice.channel.id}>`)
    const queue =  interaction.client.player.getQueue(interaction.guild) ?? interaction.client.player.createQueue(interaction.guild, {
        initialVolume: 100,
        autoSelfDeaf: true,
        leaveOnEnd: false,
        leaveOnStop: false,
        leaveOnEmpty: false
    });

    if (!queue.connection) await queue.connect((interaction.member as GuildMember).voice.channel)
    queue.play(search.tracks[0]);
})