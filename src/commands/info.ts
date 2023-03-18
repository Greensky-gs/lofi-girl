import { AmethystCommand } from 'amethystjs';
import { ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { station } from '../typings/station';
import { stations, recommendation } from '../utils/configs.json';
import { buildLocalizations, formatTime, getStationByUrl, getTester, inviteLink, row } from '../utils/functions';
import { TesterButtons } from '../typings/tester';

const locals = buildLocalizations('info');
export default new AmethystCommand({
    name: 'info',
    description: "Display's informations",
    options: [
        {
            name: 'bot',
            description: "Display bot's informations",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: locals.options.bot.name,
            descriptionLocalizations: locals.options.bot.description
        },
        {
            name: 'station',
            description: 'Displays a station informations',
            nameLocalizations: locals.options.station.name,
            descriptionLocalizations: locals.options.station.description,
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'station',
                    autocomplete: true,
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description: 'Station to display',
                    nameLocalizations: locals.options.stationOption.name,
                    descriptionLocalizations: locals.options.stationOption.description
                }
            ]
        }
    ],
    nameLocalizations: locals.name,
    descriptionLocalizations: locals.description
}).setChatInputRun(async ({ interaction, options }) => {
    const cmd = options.getSubcommand();
    if (cmd === 'bot') {
        await interaction.deferReply();
        await interaction.client.guilds.fetch();

        const embed = new EmbedBuilder()
            .setTimestamp()
            .setThumbnail(interaction.client.user.displayAvatarURL({ forceStatic: true }))
            .setTitle(interaction.client.langs.getText(interaction, 'infoBot', 'title'))
            .setColor('Orange')
            .setDescription(interaction.client.langs.getText(interaction, 'infoBot', 'description'))
            .setFields(
                {
                    name: interaction.client.langs.getText(interaction, 'infoBot', 'servers'),
                    value: interaction.client.guilds.cache.size.toString(),
                    inline: true
                },
                {
                    name: interaction.client.langs.getText(interaction, 'infoBot', 'members'),
                    value: interaction.client.guilds.cache
                        .map((x) => x.memberCount)
                        .reduce((a, b) => a + b)
                        .toString(),
                    inline: true
                },
                {
                    name: interaction.client.langs.getText(interaction, 'infoBot', 'playingIn'),
                    value: interaction.client.langs.getText(interaction, 'infoBot', 'playingInContent', { count: interaction.client.player.queues.cache.filter((x) => x.node.isPlaying()).size }),
                    inline: true
                },
                {
                    name: interaction.client.langs.getText(interaction, 'infoBot', 'stations'),
                    value: stations.length.toString(),
                    inline: false
                },
                {
                    name: interaction.client.langs.getText(interaction, 'infoBot', 'links'),
                    value: interaction.client.langs.getText(interaction, 'infoBot', 'linksContent', { topgg: 'https://top.gg/bot/1037028318404419596/', lofigirl: inviteLink(interaction.client) }),
                    inline: false
                }
            );

        if (recommendation && Object.keys(recommendation).length === 4) {
            const { name, url, emoji } = recommendation as station;
            embed.addFields({
                name: interaction.client.langs.getText(interaction, 'infoBot', 'recommendation'),
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
                name: interaction.client.langs.getText(interaction, 'infoStation', 'linkName'),
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
                    interaction.client.langs.getText(interaction, 'infoStation', 'peoplesOpinion') +
                    [...new Set(station.feedbacks.map((x) => x.keywords).flat())].join(', ')
            );
        }
        if (recommendation && Object.keys(recommendation).length > 0 && station.url === recommendation.url)
            embed.setFooter({
                text: interaction.client.langs.getText(interaction, 'infoStation', 'recommendationOfTheDay'),
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
            name: interaction.client.langs.getText(interaction, 'infoStation', 'duration'),
            value: station.type === 'radio' ? interaction.client.langs.getText(interaction, 'infoStation', 'durationTypeLive') : `${formatTime(Math.floor(video.durationMS / 1000), interaction)}`,
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
