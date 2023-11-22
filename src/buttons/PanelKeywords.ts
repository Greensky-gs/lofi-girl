import { ButtonHandler, waitForInteraction } from 'amethystjs';
import { PanelIds } from '../typings/bot';
import botOwner from '../preconditions/botOwner';
import { boolEmojis, row } from '../utils/functions';
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
import configs from '../utils/configs.json';
import { writeFileSync } from 'fs';

export default new ButtonHandler({
    customId: PanelIds.Keywords,
    preconditions: [botOwner]
}).setRun(async ({ button, message, user }) => {
    const rows = [];
    message.components.forEach((component) => {
        const actionRow = new ActionRowBuilder();
        component.components.forEach((components) => {
            actionRow.addComponents(new ButtonBuilder(components.data as unknown));
        });
        rows.push(actionRow);
    });
    rows[0].components[3].setDisabled(true);

    message
        .edit({
            components: rows
        })
        .catch(() => {});

    const msg = (await button
        .reply({
            fetchReply: true,
            content: button.client.langs.getText(button, 'panelKeywords', 'actionContent'),
            components: [
                row(
                    new ButtonBuilder()
                        .setLabel(button.client.langs.getText(button, 'panelKeywords', 'add'))
                        .setCustomId(PanelIds.AddKeyword)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setLabel(button.client.langs.getText(button, 'panelKeywords', 'list'))
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(PanelIds.KeywordsList),
                    new ButtonBuilder()
                        .setLabel(button.client.langs.getText(button, 'panelKeywords', 'remove'))
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(PanelIds.RemoveKeyword),
                    new ButtonBuilder()
                        .setLabel(button.client.langs.getText(button, 'panelKeywords', 'cancel'))
                        .setCustomId('cancel')
                        .setStyle(ButtonStyle.Danger)
                )
            ]
        })
        .catch(() => {})) as Message<true>;

    const rep = await waitForInteraction({
        message: msg,
        componentType: ComponentType.Button,
        user
    }).catch(() => {});

    const reedit = () => {
        rows[0].components[3].setDisabled(false);
        message
            .edit({
                components: rows
            })
            .catch(() => {});
    };
    if (!rep || rep.customId === 'cancel') {
        reedit();
        return msg.delete().catch(() => {});
    }
    if (rep.customId === PanelIds.AddKeyword) {
        if (configs.testKeywords.length === 25) {
            reedit();
            msg.edit({
                content: button.client.langs.getText(button, 'panelKeywords', 'cantAddMoreKeywords'),
                components: []
            }).catch(() => {});
            return;
        }
        await rep.showModal(
            new ModalBuilder()
                .setTitle(button.client.langs.getText(button, 'panelKeywords', 'addTitle'))
                .setCustomId('keywordModal')
                .setComponents(
                    row<TextInputBuilder>(
                        new TextInputBuilder()
                            .setLabel(button.client.langs.getText(button, 'panelKeywords', 'addLabel'))
                            .setPlaceholder(button.client.langs.getText(button, 'panelKeywords', 'addPlaceholder'))
                            .setRequired(true)
                            .setStyle(TextInputStyle.Short)
                            .setCustomId('keyword')
                    )
                )
        );
        const keyword = await rep
            .awaitModalSubmit({
                time: 60000
            })
            .catch(() => {});

        if (!keyword) {
            reedit();
            return msg.delete().catch(() => {});
        }
        keyword.deferUpdate().catch(() => {});
        const word = keyword.fields.getTextInputValue('keyword').split(/ +/)[0];
        if (!word) {
            reedit();
            msg.edit(button.client.langs.getText(button, 'panelKeywords', 'keywordNotFound')).catch(() => {});
            return setTimeout(() => {
                msg.delete().catch(() => {});
            }, 5000);
        }
        if (configs.testKeywords.includes(word.toLowerCase())) {
            reedit();
            msg.edit(button.client.langs.getText(button, 'panelKeywords', 'alreadyExists')).catch(() => {});
            return setTimeout(() => {
                msg.delete().catch(() => {});
            }, 5000);
        }

        configs.testKeywords.push(word.toLowerCase());
        writeFileSync('./dist/utils/configs.json', JSON.stringify(configs, null, 4));

        reedit();
        msg.edit({
            content: button.client.langs.getText(button, 'panelKeywords', 'added'),
            components: [
                row(button.client.langs.getButton(button, 'deleteMessage', { id: 'delete-message', style: 'Danger' }))
            ]
        }).catch(() => {});
        return;
    }
    if (rep.customId === PanelIds.KeywordsList) {
        reedit();
        const embed = new EmbedBuilder()
            .setTitle(button.client.langs.getText(button, 'panelKeywords', 'listTitle'))
            .setThumbnail(message.client.user.displayAvatarURL())
            .setTimestamp()
            .setColor(message.guild.members.me.displayHexColor)
            .setDescription(
                button.client.langs.getText(button, 'panelKeywords', 'listDescription', {
                    listLength: configs.testKeywords.length.toLocaleString(button.locale),
                    list: configs.testKeywords.map((x) => `\`${x}\``).join(' ')
                })
            );

        rep.deferUpdate().catch(() => {});
        msg.edit({
            embeds: [embed],
            components: [
                row(button.client.langs.getButton(button, 'deleteMessage', { id: 'delete-message', style: 'Danger' }))
            ],
            content: button.client.langs.getText(button, 'panelKeywords', 'listContent')
        }).catch(() => {});
        return;
    }
    if (rep.customId === PanelIds.RemoveKeyword) {
        rep.deferUpdate().catch(() => {});
        await msg
            .edit({
                components: [
                    row<StringSelectMenuBuilder>(
                        new StringSelectMenuBuilder()
                            .setCustomId('keyword-delete-selector')
                            .setOptions(
                                configs.testKeywords.map((x) => ({
                                    label: x[0].toUpperCase() + x.slice(1),
                                    description: button.client.langs.getText(
                                        button,
                                        'panelKeywords',
                                        'deleteDescription',
                                        { keyword: x }
                                    ),
                                    value: x
                                }))
                            )
                            .setMaxValues(configs.testKeywords.length)
                    )
                ],
                content: button.client.langs.getText(button, 'panelKeywords', 'deleteContent')
            })
            .catch(() => {});

        const reply = await waitForInteraction({
            componentType: ComponentType.StringSelect,
            message: msg,
            user
        }).catch(() => {});
        if (!reply) {
            reedit();
            return msg.delete().catch(() => {});
        }
        await reply.deferUpdate().catch(() => {});
        await msg
            .edit({
                content: button.client.langs.getText(button, 'panelKeywords', 'confirmationContent', {
                    keyword: reply.values.map((x) => `\`${x}\``).join(' ')
                }),
                components: [
                    row(
                        button.client.langs.getButton(button, 'yes', { id: 'yes', style: 'Success' }),
                        button.client.langs.getButton(button, 'no', { id: 'no', style: 'Danger' })
                    )
                ]
            })
            .catch(() => {});
        const confirmation = await waitForInteraction({
            componentType: ComponentType.Button,
            user,
            message: msg
        }).catch(() => {});
        if (!confirmation || confirmation.customId === 'no') {
            reedit();
            return msg.delete().catch(() => {});
        }

        configs.testKeywords = configs.testKeywords.filter((x) => !reply.values.includes(x));
        writeFileSync('./dist/utils/configs.json', JSON.stringify(configs, null, 4));

        msg.edit({
            components: [],
            content: button.client.langs.getText(button, 'panelKeywords', 'deleted', {
                emoji: boolEmojis(true),
                list: reply.values.map((x) => `\`${x}\``).join(' ')
            })
        }).catch(() => {});
        reedit();
        setTimeout(() => {
            msg.delete().catch(() => {});
        }, 5000);
        return;
    }
});
