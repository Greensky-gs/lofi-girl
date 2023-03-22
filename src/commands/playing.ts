import { AmethystCommand, preconditions } from 'amethystjs';
import { ButtonBuilder, ButtonStyle, Colors, EmbedBuilder } from 'discord.js';
import playingPrecondition from '../preconditions/playing';
import { buildLocalizations, getLoopState, getStationByUrl, getTester, row } from '../utils/functions';
import { TesterButtons } from '../typings/tester';

const locals = buildLocalizations('playing');
export default new AmethystCommand({
    name: 'playing',
    description: 'Shows the current music',
    preconditions: [preconditions.GuildOnly, playingPrecondition],
    nameLocalizations: locals.name,
    descriptionLocalizations: locals.description
}).setChatInputRun(async ({ interaction }) => {
    const queue = interaction.client.player.nodes.get(interaction.guild);

    const playing = queue.currentTrack;
    const station = getStationByUrl(playing.url);

            
    const extractTracks = () => {
        const description = playing.raw.description
        const splited = description.split(/tracklist/gim);
        const tracks = splited.find(x => x.includes('['));
        if (!tracks) return {};

        const timestampRegex = /\[((\d\d?):?)?\d\d:\d\d\]/;
        const songs = tracks.split('\n').filter(x => timestampRegex.test(x))

        const timestamps = {};
        songs.forEach((song) => {
            const splitedSong = song.split(' ');
            const tm = splitedSong.shift();

            const t = tm.slice(1, tm.length - 1);
            timestamps[t] = splitedSong.join(' ');
        })

        return timestamps;
    }
    const tracks = extractTracks();
    const formatTime = (key: string) => key.split(':').length === 2 ? (parseInt(key.split(':')[0]) * 60 + parseInt(key.split(':')[1])) : (parseInt(key.split(':')[0]) * 36000 + parseInt(key.split(':')[1]) * 60 + parseInt(key.split(':')[2]));

    const formated = Object.keys(extractTracks()).map(formatTime);
    const actual = formated.filter(x => x <= formatTime(queue.node.getTimestamp().current.label));

    const playingTrack = tracks[Object.keys(tracks)[actual.length - 1]];

    const embed = new EmbedBuilder()
        .setThumbnail(interaction.client.user.displayAvatarURL({ forceStatic: true }))
        .setImage(playing.thumbnail ?? null)
        .setTitle(`${station.emoji} ${station.name}`)
        .setDescription(
            interaction.client.langs.getText(interaction, 'playing', playingTrack ? 'descriptionWithTrack' : 'description', {
                stationName: station.name,
                stationEmoji: station.emoji,
                stationUrl: station.url,
                trackName: (playingTrack ? (playingTrack.includes('-') ? playingTrack.split('-')[1] : playingTrack) : '')
            })
        )
        .setColor(Colors.Orange)
        .setURL(station.url)
        .setFields(
            {
                name: interaction.client.langs.getText(interaction, 'playing', 'duration', { emoji: station.emoji }),
                value:
                    station.type === 'radio'
                        ? interaction.client.langs.getText(interaction, 'infoStation', 'durationTypeLive')
                        : queue.node.createProgressBar(),
                inline: true
            },
            {
                name: interaction.client.langs.getText(interaction, 'playing', 'volume'),
                value: `${queue.node.volume}%`,
                inline: true
            }
        );
    if (queue.tracks.size > 0)
        embed.addFields({
            name: interaction.client.langs.getText(interaction, 'playing', 'following'),
            value: interaction.client.langs.getText(interaction, 'playing', 'followingValue', {
                size: queue.tracks.size,
                optionalS: queue.tracks.size !== 1 ? 's' : ''
            }),
            inline: true
        });
    if (!!getLoopState(interaction.guild.id))
        embed.addFields({
            name: interaction.client.langs.getText(interaction, 'playing', 'loopName'),
            value: interaction.client.langs.getText(interaction, 'playing', 'loopValue'),
            inline: false
        });

    const components = [];
    if (
        getTester(interaction.user.id) &&
        ['everytime', 'oninfo', 'onplayinginfo'].includes(getTester(interaction.user.id).when) &&
        !station.feedbacks.find((x) => x.user_id === interaction.user.id)
    ) {
        components.push(
            row(
                new ButtonBuilder()
                    .setLabel('Send feedback')
                    .setCustomId(TesterButtons.SendFeedback)
                    .setStyle(ButtonStyle.Success)
            )
        );
    }
    if (station.feedbacks.length > 0) {
        embed.setDescription(
            embed.data.description +
                '\n\n' +
                (station.feedbacks.filter((x) => x.comments).length > 0
                    ? station.feedbacks.filter((x) => x.comments.length)[
                          Math.floor(Math.random() * station.feedbacks.filter((x) => x.comments).length)
                      ].comments + '\n'
                    : '') +
                interaction.client.langs.getText(interaction, 'infoStation', 'peoplesOpinion') +
                [...new Set(station.feedbacks.map((x) => x.keywords).flat())].join(', ')
        );
    }

    await interaction.reply({ embeds: [embed], components }).catch(() => {});
});
