import { AmethystCommand } from 'amethystjs';
import { ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { station } from '../typings/station';
import { stations, recommendation } from '../utils/configs.json';
import { formatTime, getStationByUrl, getTester, inviteLink, row } from '../utils/functions';
import { TesterButtons } from '../typings/tester';

export default new AmethystCommand({
    name: 'info',
    description: "Display's informations",
    options: [
        {
            name: 'bot',
            description: "Display bot's informations",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: 'station',
            description: 'Displays a station informations',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'station',
                    autocomplete: true,
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description: 'Station to display'
                }
            ]
        }
    ]
}).setChatInputRun(async ({ interaction, options }) => {
    const cmd = options.getSubcommand();
    if (cmd === 'bot') {
        await interaction.deferReply();
        await interaction.client.guilds.fetch();

        const embed = new EmbedBuilder()
            .setTimestamp()
            .setThumbnail(interaction.client.user.displayAvatarURL({ forceStatic: true }))
            .setTitle('Bot informations')
            .setColor('Orange')
            .setDescription(`I'm a bot that can play lofi music in your server`)
            .setFields(
                {
                    name: 'Servers',
                    value: interaction.client.guilds.cache.size.toString(),
                    inline: true
                },
                {
                    name: 'Members',
                    value: interaction.client.guilds.cache
                        .map((x) => x.memberCount)
                        .reduce((a, b) => a + b)
                        .toString(),
                    inline: true
                },
                {
                    name: 'Playing in',
                    value: interaction.client.player.queues.filter((x) => x.playing).size + ' servers',
                    inline: true
                },
                {
                    name: 'Stations',
                    value: stations.length.toString(),
                    inline: false
                },
                {
                    name: 'Links',
                    value: `[Invite me](${inviteLink(
                        interaction.client
                    )})\n[Lofi Girl channel](https://youtube.com/c/LofiGirl)\n[Source code](https://github.com/Greensky-gs/lofi-girl)\n[Top.gg](https://top.gg/bot/1037028318404419596/)`,
                    inline: false
                }
            );

        if (recommendation && Object.keys(recommendation).length === 4) {
            const { name, url, emoji } = recommendation as station;
            embed.addFields({
                name: '❤️ Recommendation of the day',
                value: `[${name} ${emoji}](${url})`,
                inline: false
            });
        }
        interaction.editReply({ embeds: [embed] }).catch(() => {});
    }
    if (cmd === 'station') {
        const station = getStationByUrl(options.getString('station'));

        const embed = new EmbedBuilder()
            .setThumbnail(interaction.client.user.displayAvatarURL({ forceStatic: true }))
            .setTitle(`${station.emoji} ${station.name}`)
            .setColor('Orange')
            .setFields({
                name: '🔗 Link',
                value: `[${station.name}](${station.url})`,
                inline: true
            })
            .setURL(station.url);

        if (station.feedbacks.length > 0) {
            embed.setDescription(
                (station.feedbacks.filter((x) => x.comments).length > 0
                    ? station.feedbacks.filter((x) => x.comments.length)[
                          Math.floor(Math.random() * station.feedbacks.filter((x) => x.comments).length)
                      ].comments + '\n'
                    : '') +
                    "People's opinion: " +
                    [...new Set(station.feedbacks.map((x) => x.keywords).flat())].join(', ')
            );
        }
        if (recommendation && Object.keys(recommendation).length > 0 && station.url === recommendation.url)
            embed.setFooter({
                text: 'Recommendation of the day',
                iconURL: interaction.client.user.displayAvatarURL()
            });
        interaction.reply({ embeds: [embed] }).catch(() => {});

        const data = await interaction.client.player.search(station.url, {
            requestedBy: interaction.user
        });
        const video = data.tracks[0];
        if (!video) return;

        if (video.thumbnail)
            embed.setImage(video.thumbnail ?? interaction.client.user.displayAvatarURL({ forceStatic: true }));
        embed.addFields({
            name: '🎧 Duration',
            value: station.type === 'station' ? 'Live' : `${formatTime(Math.floor(video.durationMS / 1000))}`,
            inline: true
        });

        const components = [];
        if (
            getTester(interaction.user.id) &&
            ['everytime', 'oninfo', 'onstationinfo'].includes(getTester(interaction.user.id).when) &&
            !station.feedbacks.find((x) => x.user_id === interaction.user.id)
        ) {
            components.push(
                row(
                    new ButtonBuilder()
                        .setLabel('Send feedback')
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId(TesterButtons.SendFeedback)
                )
            );
        }
        interaction.editReply({ embeds: [embed], components }).catch(() => {});
    }
});
