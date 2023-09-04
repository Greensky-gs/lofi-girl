import { ButtonHandler, waitForInteraction } from 'amethystjs';
import { PanelIds } from '../typings/bot';
import botOwner from '../preconditions/botOwner';
import { boolEmojis, getStationByUrl, resizeStr, row } from '../utils/functions';
import {
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    Message,
    ModalBuilder,
    StringSelectMenuBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js';
import confs from '../utils/configs.json';
import { writeFileSync } from 'fs';

export default new ButtonHandler({
    customId: PanelIds.ManageFeedback,
    preconditions: [botOwner]
}).setRun(async ({ button, message, user, client }) => {
    const rows = [];
    message.components.forEach((component) => {
        const actionRow = row();
        component.components.forEach((components) => {
            actionRow.addComponents(new ButtonBuilder(components.data));
        });
        rows.push(actionRow);
    });
    rows[1].components[1].setDisabled(true);

    message
        .edit({
            components: rows
        })
        .catch(() => {});
    const reedit = () => {
        rows[1].components[1].setDisabled(false);
        message
            .edit({
                components: rows
            })
            .catch(() => {});
    };
    await button.showModal(
        new ModalBuilder()
            .setTitle(button.client.langs.getText(button, 'manageFeedback', 'stationNameModalTitle'))
            .setCustomId('station-selection')
            .setComponents(
                row<TextInputBuilder>(
                    new TextInputBuilder()
                        .setCustomId('stationName')
                        .setLabel(button.client.langs.getText(button, 'manageFeedback', 'stationNameModalLabel'))
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                        .setPlaceholder(
                            button.client.langs.getText(button, 'manageFeedback', 'stationNameModalPlaceholder')
                        )
                        .setMaxLength(100)
                )
            )
    );
    const stationName = await button
        .awaitModalSubmit({
            time: 60000
        })
        .catch(() => {});

    if (!stationName) {
        reedit();
        return;
    }

    const msg = stationName
        ? ((await stationName
              .reply({
                  fetchReply: true,
                  content: button.client.langs.getText(button, 'manageFeedback', 'thiking')
              })
              .catch(() => {})) as Message<true>)
        : undefined;
    const stations = confs.stations.filter(
        (x) =>
            x.name.toLowerCase().includes(stationName.fields.getTextInputValue('stationName').toLowerCase()) ||
            stationName.fields.getTextInputValue('stationName').toLowerCase().includes(x.name.toLowerCase())
    );
    if (stations.length === 0) {
        reedit();
        msg.edit({
            content: button.client.langs.getText(button, 'manageFeedback', 'cannotFindStation')
        }).catch(() => {});
        return setTimeout(() => {
            msg.delete().catch(() => {});
        }, 5000);
    }
    if (stations.length > 1) {
        await msg
            .edit({
                content: button.client.langs.getText(button, 'manageFeedback', 'foundMultipleStations', {
                    stationsCount: stations.length
                }),
                components: [
                    row<StringSelectMenuBuilder>(
                        new StringSelectMenuBuilder()
                            .setPlaceholder(
                                button.client.langs.getText(button, 'manageFeedback', 'chooseAStationLabel')
                            )
                            .setCustomId('station.selector')
                            .setMaxValues(1)
                            .setOptions(
                                stations
                                    .splice(0, 23)
                                    .map((st) => ({
                                        label: st.name[0].toUpperCase() + st.name.slice(1),
                                        value: st.url,
                                        description: button.client.langs.getText(
                                            button,
                                            'manageFeedback',
                                            'chooseStationMapping',
                                            { stationName: st.name }
                                        ),
                                        emoji: st.emoji
                                    }))
                                    .concat([
                                        {
                                            label: button.client.langs.getText(
                                                button,
                                                'manageFeedback',
                                                'cancelChooseLabel'
                                            ),
                                            value: 'cancel',
                                            description: button.client.langs.getText(
                                                button,
                                                'manageFeedback',
                                                'cancelChooseDescription'
                                            ),
                                            emoji: '❌'
                                        }
                                    ])
                            )
                    )
                ]
            })
            .catch(() => {});
        const stationSelection = await waitForInteraction({
            message: msg,
            componentType: ComponentType.StringSelect,
            user
        }).catch(() => {});

        if (!stationSelection || stationSelection.values[0] === 'cancel') {
            reedit();
            msg.edit({
                content: button.client.langs.getText(button, 'utils', 'actionCanceled'),
                components: []
            }).catch(() => {});
            return setTimeout(() => {
                msg.delete().catch(() => {});
            }, 5000);
        }
        stations.splice(0);
        stations.push(getStationByUrl(stationSelection.values[0]));
        await stationSelection.deferUpdate().catch(() => {});
    }
    const station = stations[0];
    if (station.feedbacks.length === 0) {
        reedit();
        msg.edit({
            content: button.client.langs.getText(button, 'manageFeedback', 'hasNoFeedback', {
                stationEmoji: station.emoji,
                stationName: station.name,
                stationUrl: station.url
            }),
            components: []
        }).catch(() => {});
        return setTimeout(() => {
            msg.delete().catch(() => {});
        }, 5000);
    }
    const feedbacks = station.feedbacks;
    if (feedbacks.length > 1) {
        await msg
            .edit({
                content: button.client.langs.getText(button, 'manageFeedback', 'commentSelectionText'),
                components: [
                    row<StringSelectMenuBuilder>(
                        new StringSelectMenuBuilder()
                            .setPlaceholder(
                                button.client.langs.getText(button, 'manageFeedback', 'commentSelectionPlaceholder')
                            )
                            .setMaxValues(1)
                            .setOptions(
                                feedbacks.map((x) => ({
                                    label: button.client.langs.getText(
                                        button,
                                        'manageFeedback',
                                        'commentMappingLabel',
                                        { userId: x.user_id }
                                    ),
                                    value: x.user_id,
                                    description:
                                        x.comments.length > 0
                                            ? button.client.langs.getText(
                                                  button,
                                                  'manageFeedback',
                                                  'commentMappingDescription',
                                                  { start: resizeStr(x.comments, 50) }
                                              )
                                            : x.keywords.splice(0, 5).join(' ')
                                }))
                            )
                    )
                ]
            })
            .catch(() => {});
        const commentSelection = await waitForInteraction({
            user,
            componentType: ComponentType.StringSelect,
            message: msg
        }).catch(() => {});
        if (!commentSelection) {
            reedit();
            msg.edit({
                content: button.client.langs.getText(button, 'utils', 'actionCanceled'),
                components: []
            }).catch(() => {});
            return setTimeout(() => {
                msg.delete().catch(() => {});
            }, 5000);
        }
        await commentSelection.deferUpdate().catch(() => {});
        feedbacks.splice(0, 24);
        feedbacks.push(station.feedbacks.find((x) => x.user_id === commentSelection.values[0]));
    }
    const feedback = feedbacks[0];
    const ids = {
        DeleteFeedback: 'deleteFeedback',
        EditComment: 'editComment',
        DeleteComment: 'deleteComment',
        AddComment: 'addComment',
        AddKeywords: 'addKeywords',
        DeleteKeywords: 'deleteKeywords',
        RemoveKeyword: 'removeKeyword',
        Cancel: 'cancel',
        NoComment: button.client.langs.getText(button, 'manageFeedback', 'commentFieldDefault'),
        NoKeywords: 'No keywords',
        Save: 'saveFeedback'
    };
    const buttons = (allDisabled?: boolean) => {
        return [
            row(
                ...[
                    new ButtonBuilder()
                        .setLabel(button.client.langs.getText(button, 'manageFeedbackButtons', 'addComment'))
                        .setCustomId(ids.AddComment)
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(feedback.comments !== ids.NoComment),
                    new ButtonBuilder()
                        .setLabel(button.client.langs.getText(button, 'manageFeedbackButtons', 'editComment'))
                        .setCustomId(ids.EditComment)
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(feedback.comments === ids.NoComment),
                    new ButtonBuilder()
                        .setLabel(button.client.langs.getText(button, 'manageFeedbackButtons', 'addKeywords'))
                        .setCustomId(ids.AddKeywords)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(feedback.keywords.length === 25),
                    new ButtonBuilder()
                        .setLabel(button.client.langs.getText(button, 'manageFeedbackButtons', 'RemoveKeyword'))
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(ids.RemoveKeyword)
                        .setDisabled(feedback.keywords.length === 0),
                    new ButtonBuilder()
                        .setLabel(button.client.langs.getText(button, 'manageFeedbackButtons', 'deleteKeywords'))
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId(ids.DeleteKeywords)
                        .setDisabled(feedback.keywords.length === 0)
                ].map((x) => (!!allDisabled === true ? x.setDisabled(true) : x))
            ),
            row(
                ...[
                    new ButtonBuilder()
                        .setLabel(button.client.langs.getText(button, 'manageFeedbackButtons', 'deleteComment'))
                        .setCustomId(ids.DeleteComment)
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(feedback.comments === ids.NoComment),
                    new ButtonBuilder()
                        .setLabel(button.client.langs.getText(button, 'manageFeedbackButtons', 'deleteFeedback'))
                        .setCustomId(ids.DeleteFeedback)
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(feedback.comments === ids.NoComment && feedback.keywords.length === 0),
                    new ButtonBuilder()
                        .setLabel(button.client.langs.getText(button, 'manageFeedbackButtons', 'cancel'))
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId(ids.Cancel),
                    new ButtonBuilder()
                        .setLabel(button.client.langs.getText(button, 'manageFeedbackButtons', 'save'))
                        .setStyle(ButtonStyle.Success)
                        .setCustomId(ids.Save)
                ].map((x) => (!!allDisabled === true ? x.setDisabled(true) : x))
            )
        ];
    };
    const embed = () => {
        return new EmbedBuilder()
            .setTitle(button.client.langs.getText(button, 'manageFeedback', 'feedbackModificationTitle'))
            .setURL(station.url)
            .setDescription(
                button.client.langs.getText(button, 'manageFeedback', 'feedbackModificationDescription', {
                    stationName: station.name,
                    stationEmoji: station.emoji,
                    stationUrl: station.url,
                    userId: feedback.user_id
                })
            )
            .setColor(message.guild.members.me.displayHexColor)
            .setFields(
                {
                    name: button.client.langs.getText(button, 'manageFeedback', 'commentFieldName'),
                    value: feedback.comments ?? ids.NoComment,
                    inline: false
                },
                {
                    name: button.client.langs.getText(button, 'manageFeedback', 'commentKeywordsDefault'),
                    value: feedback.keywords.length > 0 ? feedback.keywords.join(', ') : ids.NoKeywords,
                    inline: false
                }
            );
    };
    await msg
        .edit({
            content: button.client.langs.getText(button, 'panelKeywords', 'actionContent'),
            components: buttons(),
            embeds: [embed()]
        })
        .catch(() => {});
    const collector = msg.createMessageComponentCollector({
        time: 180000
    });

    collector.on('collect', async (interaction) => {
        if (interaction.user.id !== user.id) {
            interaction
                .reply({
                    content: button.client.langs.getText(interaction, 'utils', 'notAllowedToInteract'),
                    ephemeral: true
                })
                .catch(() => {});
            return;
        }
        if (interaction.customId === ids.Cancel) {
            return collector.stop('canceled');
        }
        if (interaction.customId === ids.AddComment) {
            await interaction
                .showModal(
                    new ModalBuilder()
                        .setTitle(button.client.langs.getText(button, 'manageFeedback', 'addCommentModalTitle'))
                        .setCustomId('feedback.add.comment')
                        .setComponents(
                            row<TextInputBuilder>(
                                new TextInputBuilder()
                                    .setLabel(
                                        button.client.langs.getText(button, 'manageFeedback', 'addCommentModalLabel')
                                    )
                                    .setPlaceholder(
                                        button.client.langs.getText(
                                            button,
                                            'manageFeedback',
                                            'addCommentModalPlaceholder'
                                        )
                                    )
                                    .setCustomId('comment')
                                    .setMaxLength(1000)
                                    .setStyle(TextInputStyle.Paragraph)
                                    .setRequired(true)
                            )
                        )
                )
                .catch(() => {});
            const modal = await interaction
                .awaitModalSubmit({
                    time: 60000
                })
                .catch(() => {});

            if (!modal) return;
            feedback.comments = modal.fields.getTextInputValue('comment');
            modal.deferUpdate().catch(() => {});

            msg.edit({
                components: buttons(),
                embeds: [embed()]
            }).catch(() => {});
        }
        if (interaction.customId === ids.DeleteComment) {
            feedback.comments = ids.NoComment;
            interaction.deferUpdate().catch(() => {});
            msg.edit({
                embeds: [embed()],
                components: buttons()
            }).catch(() => {});
        }
        if (interaction.customId === ids.AddKeywords) {
            if (confs.testKeywords.filter((x) => !feedback.keywords.includes(x)).length === 0) {
                interaction
                    .reply({
                        content: button.client.langs.getText(button, 'manageFeedback', 'noKeywordsToAdd')
                    })
                    .catch(() => {});
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {});
                }, 5000);
                return;
            }
            msg.edit({
                components: buttons(true)
            }).catch(() => {});
            const selector = new StringSelectMenuBuilder()
                .setCustomId('keywords.selector')
                .setMaxValues(confs.testKeywords.filter((x) => !feedback.keywords.includes(x)).length + 1)
                .setOptions(
                    confs.testKeywords
                        .filter((x) => !feedback.keywords.includes(x))
                        .map((k) => ({
                            label: k[0].toUpperCase() + k.slice(1),
                            value: k,
                            description: button.client.langs.getText(button, 'manageFeedback', 'keywordMapping', {
                                keyword: k
                            })
                        }))
                        .concat({
                            label: button.client.langs.getText(button, 'manageFeedback', 'keywordsCancelLabel'),
                            value: 'cancel',
                            description: button.client.langs.getText(button, 'manageFeedback', 'keywordsCancelDesc')
                        })
                );
            const ctx = await interaction.reply({
                content: button.client.langs.getText(button, 'manageFeedback', 'keywordsSelectionContent'),
                components: [row<StringSelectMenuBuilder>(selector)],
                fetchReply: true
            });
            const selection = await waitForInteraction({
                componentType: ComponentType.StringSelect,
                user,
                message: ctx
            }).catch(() => {});

            ctx.delete().catch(() => {});
            if (!selection || selection.values.includes('cancel')) {
                msg.edit({
                    components: buttons()
                }).catch(() => {});
                return;
            }
            feedback.keywords.push(...selection.values);
            msg.edit({
                components: buttons(),
                embeds: [embed()]
            }).catch(() => {});
        }
        if (interaction.customId === ids.DeleteFeedback) {
            interaction.deferUpdate().catch(() => {});
            feedback.comments = ids.NoComment;
            feedback.keywords = [];

            msg.edit({
                embeds: [embed()],
                components: buttons()
            }).catch(() => {});
        }
        if (interaction.customId === ids.EditComment) {
            await interaction
                .showModal(
                    new ModalBuilder()
                        .setTitle(button.client.langs.getText(button, 'manageFeedback', 'commentEditModalTitle'))
                        .setCustomId('comment.edition')
                        .setComponents(
                            row<TextInputBuilder>(
                                new TextInputBuilder()
                                    .setLabel(
                                        button.client.langs.getText(button, 'manageFeedback', 'commentEditModalTitle')
                                    )
                                    .setMaxLength(1000)
                                    .setCustomId('comment')
                                    .setRequired(true)
                                    .setPlaceholder(
                                        button.client.langs.getText(
                                            button,
                                            'manageFeedback',
                                            'commentEditModalPlaceholder'
                                        )
                                    )
                                    .setStyle(TextInputStyle.Paragraph)
                            )
                        )
                )
                .catch(() => {});
            const modal = await interaction
                .awaitModalSubmit({
                    time: 60000
                })
                .catch(() => {});

            if (!modal) return;
            modal.deferUpdate().catch(() => {});

            feedback.comments = modal.fields.getTextInputValue('comment');
            msg.edit({
                components: buttons(),
                embeds: [embed()]
            }).catch(() => {});
        }
        if (interaction.customId === ids.RemoveKeyword) {
            msg.edit({
                components: buttons(true)
            }).catch(() => {});

            const keywordSelection = (await interaction
                .reply({
                    content: button.client.langs.getText(button, 'manageFeedback', 'keywordsRemoveContent'),
                    components: [
                        row<StringSelectMenuBuilder>(
                            new StringSelectMenuBuilder()
                                .setCustomId('keyword.selection')
                                .setOptions(
                                    feedback.keywords
                                        .map((k) => ({
                                            label: k[0].toUpperCase() + k.slice(1),
                                            value: k,
                                            description: button.client.langs.getText(
                                                button,
                                                'manageFeedback',
                                                'removeKeywordsDescription',
                                                { keyword: k }
                                            )
                                        }))
                                        .concat({
                                            label: button.client.langs.getText(
                                                button,
                                                'manageFeedback',
                                                'keywordsCancelLabel'
                                            ),
                                            value: 'cancel',
                                            description: button.client.langs.getText(
                                                button,
                                                'manageFeedback',
                                                'keywordsCancelDesc'
                                            )
                                        })
                                )
                                .setMaxValues(feedback.keywords.length + 1)
                        )
                    ],
                    fetchReply: true
                })
                .catch(() => {})) as Message<true>;
            const keyword = await waitForInteraction({
                message: keywordSelection,
                user,
                componentType: ComponentType.StringSelect
            }).catch(() => {});

            keywordSelection.delete().catch(() => {});
            if (!keyword || keyword.values.includes('cancel')) {
                msg.edit({
                    components: buttons()
                }).catch(() => {});
                return;
            }
            feedback.keywords = feedback.keywords.filter((k) => !keyword.values.includes(k));
            msg.edit({
                embeds: [embed()],
                components: buttons()
            }).catch(() => {});
        }
        if (interaction.customId === ids.Save) {
            station.feedbacks.splice(
                0,
                station.feedbacks.indexOf(station.feedbacks.find((x) => x.user_id === feedback.user_id)),
                feedback
            );
            stations.splice(0, stations.indexOf(stations.find((x) => x.url === station.url)), station);

            msg.edit({
                content: button.client.langs.getText(button, 'manageFeedback', 'saved', {
                    stationName: station.name,
                    stationUrl: station.url,
                    stationEmoji: station.emoji,
                    emoji: boolEmojis(true)
                }),
                embeds: [],
                components: []
            }).catch(() => {});
            setTimeout(() => {
                msg.delete().catch(() => {});
            }, 5000);
            reedit();
            collector.stop('saved');

            client.api.update('commentUpdate', {
                url: station.url,
                emitterId: '',
                comment: {
                    userId: feedback.user_id,
                    comment: feedback.comments,
                    keywords: feedback.keywords
                }
            });
            writeFileSync('./dist/utils/configs.json', JSON.stringify(confs, null, 4));
        }
    });
    collector.on('end', (collected, reason) => {
        if (reason === 'canceled') {
            reedit();
            msg.edit({
                content: button.client.langs.getText(button, 'utils', 'commandCanceled'),
                components: [],
                embeds: []
            }).catch(() => {});
            setTimeout(() => {
                msg.delete().catch(() => {});
            }, 5000);
            return;
        }
        if (reason === 'saved') return;
        msg.delete().catch(() => {});
        reedit();
    });
});
