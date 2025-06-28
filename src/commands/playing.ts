import { AmethystCommand, log4js, preconditions } from "amethystjs";
import { buildLocalizations, convertSecondsToTimestamp, convertTimestampToSeconds, resolveName } from "../utils/functions";
import playing from "../preconditions/playing";
import { players } from "../cache/players";
import { EmbedBuilder } from "discord.js";

const locals = buildLocalizations('playing');
export default new AmethystCommand({
    name: 'playing',
    description: "Shows the current playing station",
    preconditions: [preconditions.GuildOnly, playing],
    nameLocalizations: locals.name,
    descriptionLocalizations: locals.description
}).setChatInputRun(async({ interaction, client }) => {
    const queue = players.get(interaction.guild.id);

    const playing = queue.currentTrack;
    const advancement = Date.now() - queue.startedAt;
    const advancementTimestamp = convertSecondsToTimestamp(Math.floor(advancement / 1000));

    const tracks = Object.entries(playing.tracks);
    const bigger = tracks.findIndex(([timestamp, text]) => convertTimestampToSeconds(timestamp) > advancement);

    const current = (bigger === -1 ? tracks[tracks.length - 1] : tracks[bigger - 1])[1]

    const progressBar = ((chars: number) => {
        const last = tracks[tracks.length - 1];
        const lastTimestamp = convertTimestampToSeconds(last[0]) + 420;

        const percentage = Math.floor((advancement / (lastTimestamp * 1000)) * 100);

        const bars = Math.floor(percentage / chars);
        const emptyBars = chars - bars;

        const full = "▬";
        const empty = '-';
        const cursor = '🔘'

        return `${advancementTimestamp} | ${full.repeat(bars)}${cursor}${empty.repeat(emptyBars)} | ${convertSecondsToTimestamp(lastTimestamp)}`;
    })(24);

    const embed = new EmbedBuilder()
        .setThumbnail(client.user.displayAvatarURL({ forceStatic: true }))
        .setImage(playing.img)
        .setTitle(`${playing.emoji} ${playing.authors.join(' x ')} - ${playing.title} ${playing.beats}`)
        .setDescription(
            client.langs.getText(interaction, 'playing', current ? 'descriptionWithTrack' : 'description',
                {
                    stationName: resolveName(playing),
                    stationEmoji: playing.emoji,
                    stationUrl: playing.url,
                    trackName: current ? current.includes('-') ? current.split('-')[1] : current : '',
                }
            )
        )
        .setColor('Orange')
        .setURL(playing.url)
        .setFields(
            {
                name: client.langs.getText(interaction, 'playing', 'duration', { emoji: playing.emoji }),
                value: progressBar
            }
        )
    
    if (queue.looping) {
        embed.addFields({
            name: client.langs.getText(interaction, 'playing', 'loopName'),
            value: client.langs.getText(interaction, 'playing', 'loopValue')
        })
    }
    
    interaction.reply({
        embeds: [embed]
    }).catch(log4js.trace)
})