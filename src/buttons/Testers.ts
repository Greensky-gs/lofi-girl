import { ButtonHandler, waitForInteraction, waitForMessage } from 'amethystjs';
import { PanelIds } from '../typings/bot';
import botOwner from '../preconditions/botOwner';
import {
    ActionRowBuilder,
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
import { boolEmojis, row } from '../utils/functions';
import configs from '../utils/configs.json';
import { writeFileSync } from 'fs';

export default new ButtonHandler({
    customId: PanelIds.Testers,
    preconditions: [botOwner]
}).setRun(async ({ button, message, user }) => {
    const rows = [];
    message.components.forEach((component) => {
        const actionRow = new ActionRowBuilder();
        component.components.forEach((components) => {
            actionRow.addComponents(new ButtonBuilder(components.data));
        });
        rows.push(actionRow);
    });
    rows[1].components[0].setDisabled(true);

    message
        .edit({
            components: rows
        })
        .catch(() => {});
    const reedit = () => {
        rows[1].components[0].setDisabled(false);
        message
            .edit({
                components: rows
            })
            .catch(() => {});
    };

    const msg = (await button
        .reply({
            fetchReply: true,
            content: `What do you want to do with testers ?`,
            components: [
                row(
                    new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Add').setCustomId(PanelIds.AddTester),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel('List')
                        .setCustomId(PanelIds.ListTester),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel('Remove')
                        .setCustomId(PanelIds.RemoveTester),
                    new ButtonBuilder().setLabel('Cancel').setStyle(ButtonStyle.Danger).setCustomId('cancel')
                )
            ]
        })
        .catch(() => {})) as Message<true>;
    const action = await waitForInteraction({
        componentType: ComponentType.Button,
        message: msg,
        user
    }).catch(() => {});
    if (!action || action.customId === 'cancel') {
        msg.delete().catch(() => {});
        return reedit();
    }

    if (action.customId === PanelIds.AddTester) {
        await action
            .showModal(
                new ModalBuilder()
                    .setTitle('Tester informations')
                    .setCustomId('tester-info')
                    .setComponents(
                        row<TextInputBuilder>(
                            new TextInputBuilder()
                                .setLabel('Identifier')
                                .setPlaceholder([button.client.user.id, user.id][Math.floor(Math.random() * 2)])
                                .setRequired(true)
                                .setStyle(TextInputStyle.Short)
                                .setCustomId('id')
                        )
                    )
            )
            .catch(() => {});
        const modalReply = await action
            .awaitModalSubmit({
                time: 60000
            })
            .catch(() => {});

        if (modalReply) modalReply.deferUpdate().catch(() => {});
        if (!modalReply) {
            reedit();
            return msg.delete().catch(() => {});
        }
        const id = modalReply.fields.getTextInputValue('id');

        if (configs.testers.find((x) => x.id === id)) {
            reedit();
            msg.edit({
                content: `:x: | This tester already exists`
            }).catch(() => {});
            setTimeout(() => {
                msg.delete().catch(() => {});
            }, 5000);
            return;
        }
        await msg
            .edit({
                content: `Please select the mode of notification`,
                components: [
                    row<StringSelectMenuBuilder>(
                        new StringSelectMenuBuilder()
                            .setCustomId('mode-selector')
                            .setMaxValues(1)
                            .setOptions(
                                {
                                    label: 'Song end',
                                    value: 'songend',
                                    description: 'Be notified when a requested song ends'
                                },
                                {
                                    label: 'On station info',
                                    value: 'onstationinfo',
                                    description: 'Add button when using /info station command'
                                },
                                {
                                    label: 'On playing info',
                                    value: 'onplayinginfo',
                                    description: `Add button when using /playing command`
                                },
                                {
                                    label: 'On info',
                                    value: 'oninfo',
                                    description: `Add button when using /playing or /info station command`
                                },
                                {
                                    label: 'Everytime',
                                    value: 'everytime',
                                    description: `All the options at once`
                                },
                                {
                                    label: 'Cancel',
                                    value: 'cancel',
                                    description: 'Cancel process',
                                    emoji: boolEmojis(false)
                                }
                            )
                    )
                ]
            })
            .catch(() => {});
        const mode = await waitForInteraction({
            componentType: ComponentType.StringSelect,
            user,
            message: msg
        }).catch(() => {});
        if (!mode || mode.values[0] === 'cancel') {
            reedit();
            return msg.delete().catch(() => {});
        }
        configs.testers.push({
            id: id,
            when: mode.values[0]
        });
        writeFileSync(`./dist/utils/configs.json`, JSON.stringify(configs, null, 4));
        reedit();
        msg.edit({
            content: `${boolEmojis(true)} | \`${id}\` added with \`${mode.values[0]}\``,
            components: []
        }).catch(() => {});
        return setTimeout(() => {
            msg.delete().catch(() => {});
        }, 5000);
        return;
    }
    if (action.customId === PanelIds.ListTester) {
        action.deferUpdate().catch(() => {});
        await msg
            .edit({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Song testers')
                        .setColor(message.guild.members.me.displayHexColor)
                        .setThumbnail(user.client.user.displayAvatarURL())
                        .setDescription(
                            `There are **${configs.testers.length}** song tester(s) :\n${configs.testers
                                .map((t) => `\`${t.id}\` ( <@${t.id}> ) : \`${t.when}\``)
                                .join('\n')}`
                        )
                ],
                components: [
                    row(
                        new ButtonBuilder()
                            .setLabel('Delete message')
                            .setCustomId('delete-message')
                            .setStyle(ButtonStyle.Primary)
                    )
                ],
                content: `Here is the list of the song testers`
            })
            .catch(() => {});
        reedit();
        return;
    }
    if (action.customId === PanelIds.RemoveTester) {
        await action
            .showModal(
                new ModalBuilder()
                    .setTitle('Tester informations')
                    .setCustomId('id')
                    .setComponents(
                        row<TextInputBuilder>(
                            new TextInputBuilder()
                                .setLabel('Identifier')
                                .setPlaceholder(
                                    [button.client.user.id, message.id, msg.id, user.id][Math.floor(Math.random() * 4)]
                                )
                                .setRequired(true)
                                .setCustomId('id')
                                .setStyle(TextInputStyle.Short)
                        )
                    )
            )
            .catch(() => {});
        const modalReply = await action
            .awaitModalSubmit({
                time: 60000
            })
            .catch(() => {});
        if (modalReply) modalReply.deferUpdate().catch(() => {});
        if (!modalReply) {
            reedit();
            msg.delete().catch(() => {});
            return;
        }
        const id = modalReply.fields.getTextInputValue('id');
        if (!configs.testers.find((x) => x.id === id)) {
            reedit();
            msg.edit({
                content: `:x: | I can't find this tester`
            }).catch(() => {});
            setTimeout(() => {
                msg.delete().catch(() => {});
            }, 5000);
            return;
        }
        await msg
            .edit({
                content: `Are you sure to remove the tester \`${id}\` ( <@${id}> ) ?`,
                components: [
                    row(
                        new ButtonBuilder().setLabel('Yes').setCustomId('yes').setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setLabel('No').setCustomId('no').setStyle(ButtonStyle.Danger)
                    )
                ]
            })
            .catch(() => {});
        const confirmation = await waitForInteraction({
            componentType: ComponentType.Button,
            user,
            message: msg
        });

        if (!confirmation || confirmation.customId === 'no') {
            reedit();
            msg.delete().catch(() => {});
            return;
        }
        configs.testers = configs.testers.filter((x) => x.id !== id);
        writeFileSync('./dist/utils/configs.json', JSON.stringify(configs, null, 4));

        reedit();
        msg.edit({
            content: `${boolEmojis(true)} | Tester \`${id}\` ( <@${id}> ) has been removed`,
            components: []
        }).catch(() => {});
        setTimeout(() => {
            msg.delete().catch(() => {});
        }, 5000);
    }
});
