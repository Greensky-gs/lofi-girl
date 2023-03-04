import { AmethystCommand, preconditions } from 'amethystjs';
import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import adminIfNotAlone from '../preconditions/adminIfNotAlone';
import connected from '../preconditions/connected';
import { getStationByUrl } from '../utils/functions';
import { queuesUsers } from '../utils/maps';

export default new AmethystCommand({
    name: 'play',
    description: 'Plays a lofi music',
    preconditions: [preconditions.GuildOnly, connected, adminIfNotAlone],
    options: [
        {
            name: 'station',
            description: 'Station to play',
            required: false,
            autocomplete: true,
            type: ApplicationCommandOptionType.String
        }
    ]
}).setChatInputRun(async ({ interaction, options }) => {
    const station = getStationByUrl(options.getString('station'));

    await interaction.deferReply();
    const search = await interaction.client.player.search(station.url, {
        requestedBy: interaction.user
    });

    if (!search || search.tracks.length === 0) return interaction.editReply(`:x: | Station not found`);
    interaction.editReply(
        `🎧 | Playing [${station.emoji} ${station.name}](<${station.url}>) in <#${
            (interaction.member as GuildMember).voice.channel.id
        }>`
    );
    if (interaction.client.player.nodes.get(interaction.guild.id)) {
        const queue = interaction.client.player.nodes.get(interaction.guild.id);
        if (queue.tracks.size > 0) {
            const toAdd = queue.tracks.toArray().splice(0);
            queue.tracks.add([search.tracks[0], ...toAdd]);
        } else {
            queue.tracks.add(search.tracks[0]);
        }
        queue.node.skip();
        return;
    }
    const queue = (
        await interaction.client.player.play((interaction.member as GuildMember).voice.channel, search.tracks[0], {
            nodeOptions: {
                selfDeaf: true,
                leaveOnEmpty: false,
                leaveOnEnd: false,
                leaveOnStop: false,
                volume: 90
            }
        })
    ).queue;

    if (!queue.connection) queue.connect((interaction.member as GuildMember).voice.channel);

    queuesUsers.set(interaction.guild.id, interaction.user);
});
