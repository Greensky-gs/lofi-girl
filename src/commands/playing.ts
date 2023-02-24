import { EmbedBuilder } from '@discordjs/builders';
import { AmethystCommand, preconditions } from 'amethystjs';
import { ButtonBuilder, ButtonStyle, Colors } from 'discord.js';
import playingPrecondition from '../preconditions/playing';
import { getLoopState, getStationByUrl, getTester, row } from '../utils/functions';
import { TesterButtons } from '../typings/tester';

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
    if (getLoopState(interaction.guild.id))
        embed.addFields({
            name: '🔁 Loop',
            value: 'Auto add is **enabled**',
            inline: false
        });

    const components = [];
    if (getTester(interaction.user.id) && ['everytime', 'oninfo', 'onplayinginfo'].includes(getTester(interaction.user.id).when) && !station.feedbacks.find(x => x.user_id === interaction.user.id)) {
        components.push(
            row(new ButtonBuilder()
                .setLabel('Send feedback')
                .setCustomId(TesterButtons.SendFeedback)
                .setStyle(ButtonStyle.Success)
            )
        )
    }
    if (station.feedbacks.length > 0) {
        embed.setDescription(embed.data.description + '\n\n' + (station.feedbacks.filter(x => x.comments).length > 0 ? station.feedbacks.filter(x => x.comments.length)[Math.floor(Math.random() * station.feedbacks.filter(x => x.comments).length)].comments + '\n' : '') + [...new Set(station.feedbacks.map(x => x.keywords).flat())].join(' '))
    }
    interaction.reply({ embeds: [embed], components }).catch(() => {});
});
