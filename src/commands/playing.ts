import { EmbedBuilder } from '@discordjs/builders';
import { AmethystCommand, preconditions } from 'amethystjs';
import { Colors } from 'discord.js';
import playingPrecondition from '../preconditions/playing';
import { getStationByUrl } from '../utils/functions';

export default new AmethystCommand({
    name: 'playing',
    description: 'Shows the current music',
    preconditions: [preconditions.GuildOnly, playingPrecondition]
}).setChatInputRun(async ({ interaction }) => {
    const queue = interaction.client.player.getQueue(interaction.guild);
    interaction.client.player.getQueue(interaction.guild);

    const playing = queue.nowPlaying();
    const station = getStationByUrl(playing.url);

    const embed = new EmbedBuilder()
        .setThumbnail(interaction.client.user.displayAvatarURL({ forceStatic: true }))
        .setImage(playing.thumbnail ?? null)
        .setTitle(`${station.emoji} ${station.name}`)
        .setDescription(`You are listening to [${station.emoji} ${station.name}](${station.url})`)
        .setColor(Colors.Orange)
        .setURL(station.url)
        .setFields(
            {
                name: station.emoji + ' Duration',
                value: station.type === 'station' ? 'Live' : queue.createProgressBar(),
                inline: true
            },
            {
                name: '🎧 Volume',
                value: `${queue.volume}%`,
                inline: true
            }
        );
    if (queue.tracks.length > 0)
        embed.addFields({
            name: '🎹 Following',
            value: `${queue.tracks.length} following${queue.tracks.length > 1 ? 's' : ''}`,
            inline: true
        });

    interaction.reply({ embeds: [embed] }).catch(() => {});
});
