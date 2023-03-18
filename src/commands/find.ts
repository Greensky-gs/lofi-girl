import { AmethystCommand } from 'amethystjs';
import {
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder, StringSelectMenuBuilder
} from 'discord.js';
import { stations, recommendation } from '../utils/configs.json';
import { TesterButtons } from '../typings/tester';
import { buildLocalizations, formatTime, getTester, row } from '../utils/functions';
import { ButtonIds } from '../typings/bot';

const locals = buildLocalizations('find');
export default new AmethystCommand({
    name: 'find',
    description: 'Find some stations that you like using tags',
    options: [
        {
            name: 'tags',
            description: 'Tags you want to search with',
            autocomplete: true,
            type: ApplicationCommandOptionType.String,
            required: true,
            nameLocalizations: locals.options.tags.name,
            descriptionLocalizations: locals.options.tags.description
        }
    ],
    nameLocalizations: locals.name,
    descriptionLocalizations: locals.description
}).setChatInputRun(async ({ interaction, options }) => {
    const tags = options.getString('tags').split('.');
    const available = stations.filter((x) => x.feedbacks.some((f) => f.keywords.some((k) => tags.includes(k))));

    if (available.length === 0)
        return interaction
            .reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(interaction.client.langs.getText(interaction, 'findCommand', 'noStation'))
                        .setDescription(
                            `${interaction.client.langs.getText(interaction, 'findCommand', 'noStationDescription')}${
                                stations.filter((x) => x.feedbacks.length === 0).length > 2
                                    ? interaction.client.langs.getText(interaction, 'findCommand', 'testerPromotion')
                                    : ''
                            }`
                        )
                        .setColor(interaction.guild?.members?.me?.displayHexColor ?? 'DarkOrange')
                        .setThumbnail(interaction.client.user.displayAvatarURL())
                ]
            })
            .catch(() => {});

    if (available.length === 1) {
        const station = available[0];
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
            value: station.type === 'station' ? interaction.client.langs.getText(interaction, 'infoStation', 'durationTypeLive') : `${formatTime(Math.floor(video.durationMS / 1000), interaction)}`,
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
        return;
    }

    const selectorOptions = available.length <= 25 ? available : [];
    if (selectorOptions.length === 0) {
        for (let i = 0; i < 25; i++) {
            selectorOptions.push(available[Math.floor(Math.random() * available.length)]);
        }
    }
    const selector = new StringSelectMenuBuilder()
        .setCustomId(ButtonIds.FindStationSelector)
        .setMaxValues(1)
        .setOptions(
            selectorOptions.map((st) => ({
                label: `${st.name}`,
                value: st.url,
                emoji: st.emoji,
                description: `${st.type}`
            }))
        );
    interaction
        .reply({
            components: [row<StringSelectMenuBuilder>(selector)],
            embeds: [
                new EmbedBuilder()
                    .setTitle(interaction.client.langs.getText(interaction, 'findCommand', 'matching'))
                    .setDescription(
                        `${interaction.client.langs.getText(interaction, 'findCommand', 'matchingDescription', { availableLength: available.length })}${
                            available.length <= 25 ? '' : interaction.client.langs.getText(interaction, 'findCommand', 'pickedUp', { selectorOptionsLength: selector.options.length })
                        }`
                    )
                    .setColor('DarkOrange')
                    .setThumbnail(interaction.client.user.displayAvatarURL())
                    .setFooter({
                        text: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
            ]
        })
        .catch(() => {});
});
