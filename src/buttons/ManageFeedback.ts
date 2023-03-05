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
    TextChannel,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js';
import confs from '../utils/configs.json';
import { writeFileSync } from 'fs';

export default new ButtonHandler({
    customId: PanelIds.ManageFeedback,
    preconditions: [botOwner]
}).setRun(async ({ button, message, user }) => {
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
            .setTitle("Station")
            .setCustomId('station-selection')
            .setComponents(
                row<TextInputBuilder>(new TextInputBuilder()
                    .setCustomId('stationName')
                    .setLabel('Station name')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setPlaceholder('Please enter a station name')
                    .setMaxLength(100)
                )
            )
    );
    const stationName = await button.awaitModalSubmit({
        time: 60000
    }).catch(() => {});

    if (!stationName) {
        reedit();
        return;
    }
    
    const msg = stationName ? await stationName.reply({
        fetchReply: true,
        content: `...thinking`
    }).catch(() => {}) as Message<true> : undefined;
    const stations = confs.stations.filter(
        (x) =>
            x.name.toLowerCase().includes(stationName.fields.getTextInputValue('stationName').toLowerCase()) ||
            stationName.fields.getTextInputValue('stationName').toLowerCase().includes(x.name.toLowerCase())
    );
    if (stations.length === 0) {
        reedit();
        msg.edit({
            content: `:x: | Cannot find a matching station`
        }).catch(() => {});
        return setTimeout(() => {
            msg.delete().catch(() => {});
        }, 5000);
    }
    if (stations.length > 1) {
        await msg
            .edit({
                content: `I found **${stations.length}** matching stations`,
                components: [
                    row<StringSelectMenuBuilder>(
                        new StringSelectMenuBuilder()
                            .setPlaceholder('Choose a station')
                            .setCustomId('station.selector')
                            .setMaxValues(1)
                            .setOptions(
                                stations
                                    .splice(0, 23)
                                    .map((st) => ({
                                        label: st.name[0].toUpperCase() + st.name.slice(1),
                                        value: st.url,
                                        description: `Station ${st.name}`,
                                        emoji: st.emoji
                                    }))
                                    .concat([
                                        {
                                            label: 'Cancel',
                                            value: 'cancel',
                                            description: 'Cancel the selection',
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
                content: `Canceled`,
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
            content: `:x: | The station [${station.emoji} ${station.name}](${station.url}) has no feedback`,
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
                content: `With wich comment do you want to work with ?`,
                components: [
                    row<StringSelectMenuBuilder>(
                        new StringSelectMenuBuilder()
                            .setPlaceholder('Select a comment')
                            .setMaxValues(1)
                            .setOptions(
                                feedbacks.map((x) => ({
                                    label: `By ${x.user_id}`,
                                    value: x.user_id,
                                    description:
                                        x.comments.length > 0
                                            ? `Starting by ${resizeStr(x.comments, 50)}`
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
                content: 'Canceled',
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
        NoComment: 'No comment',
        NoKeywords: 'No keywords',
        Save: 'saveFeedback'
    };
    const buttons = (allDisabled?: boolean) => {
        return [
            row(
                ...[
                    new ButtonBuilder()
                        .setLabel('Add comment')
                        .setCustomId(ids.AddComment)
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(feedback.comments !== ids.NoComment),
                    new ButtonBuilder()
                        .setLabel('Edit comment')
                        .setCustomId(ids.EditComment)
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(feedback.comments === ids.NoComment),
                    new ButtonBuilder()
                        .setLabel('Add keywords')
                        .setCustomId(ids.AddKeywords)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(feedback.keywords.length === 25),
                    new ButtonBuilder()
                        .setLabel('Remove a keyword')
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(ids.RemoveKeyword)
                        .setDisabled(feedback.keywords.length === 0),
                    new ButtonBuilder()
                        .setLabel('Delete keywords')
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId(ids.DeleteKeywords)
                        .setDisabled(feedback.keywords.length === 0)
                ].map((x) => (!!allDisabled === true ? x.setDisabled(true) : x))
            ),
            row(
                ...[
                    new ButtonBuilder()
                        .setLabel('Delete comment')
                        .setCustomId(ids.DeleteComment)
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(feedback.comments === ids.NoComment),
                    new ButtonBuilder()
                        .setLabel('Delete feedback')
                        .setCustomId(ids.DeleteFeedback)
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(feedback.comments === ids.NoComment && feedback.keywords.length === 0),
                    new ButtonBuilder().setLabel('Cancel').setStyle(ButtonStyle.Danger).setCustomId(ids.Cancel),
                    new ButtonBuilder().setLabel('Save').setStyle(ButtonStyle.Success).setCustomId(ids.Save)
                ].map((x) => (!!allDisabled === true ? x.setDisabled(true) : x))
            )
        ];
    };
    const embed = () => {
        return new EmbedBuilder()
            .setTitle(`Feedback modification`)
            .setURL(station.url)
            .setDescription(
                `You are editing the feedback by <@${feedback.user_id}> on the [${station.emoji} ${station.name}](${station.url}) station`
            )
            .setColor(message.guild.members.me.displayHexColor)
            .setFields(
                {
                    name: 'Comment',
                    value: feedback.comments ?? ids.NoComment,
                    inline: false
                },
                {
                    name: 'Keywords',
                    value: feedback.keywords.length > 0 ? feedback.keywords.join(', ') : ids.NoKeywords,
                    inline: false
                }
            );
    };
    await msg
        .edit({
            content: `What do you want to do with the [${station.emoji} ${station.name}](<${station.url}>) station ?`,
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
                    content: `:x: | You cannot interact with this message`,
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
                        .setTitle('Comment adding')
                        .setCustomId('feedback.add.comment')
                        .setComponents(
                            row<TextInputBuilder>(
                                new TextInputBuilder()
                                    .setLabel('Comment')
                                    .setPlaceholder('Write the comment here')
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
                        content: `:x: | There is no keyword to add`
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
                        .map((k) => ({ label: k[0].toUpperCase() + k.slice(1), value: k, description: `Keyword ${k}` }))
                        .concat({
                            label: 'Cancel',
                            value: 'cancel',
                            description: 'Cancel the selection'
                        })
                );
            const ctx = await interaction.reply({
                content: `Wich keywords do you want to add ?`,
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
                        .setTitle('Comment edition')
                        .setCustomId('comment.edition')
                        .setComponents(
                            row<TextInputBuilder>(
                                new TextInputBuilder()
                                    .setLabel('Comment')
                                    .setMaxLength(1000)
                                    .setCustomId('comment')
                                    .setRequired(true)
                                    .setPlaceholder('Write your comment here')
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
                    content: `Wich keyword(s) do you want to remove ?`,
                    components: [
                        row<StringSelectMenuBuilder>(
                            new StringSelectMenuBuilder()
                                .setCustomId('keyword.selection')
                                .setOptions(
                                    feedback.keywords
                                        .map((k) => ({
                                            label: k[0].toUpperCase() + k.slice(1),
                                            value: k,
                                            description: `Remove the keyword ${k}`
                                        }))
                                        .concat({
                                            label: 'Cancel',
                                            value: 'cancel',
                                            description: 'Cancel the selection'
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
                content: `${boolEmojis(true)} | The station [${station.emoji} ${station.name}](<${
                    station.url
                }>) has been edited`,
                embeds: [],
                components: []
            }).catch(() => {});
            setTimeout(() => {
                msg.delete().catch(() => {});
            }, 5000);
            reedit();
            collector.stop('saved');

            writeFileSync('./dist/utils/configs.json', JSON.stringify(confs, null, 4));
        }
    });
    collector.on('end', (collected, reason) => {
        if (reason === 'canceled') {
            reedit();
            msg.edit({
                content: `Canceled`,
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
