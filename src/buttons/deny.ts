import { ButtonHandler, waitForInteraction } from 'amethystjs';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Message,
    ComponentType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    StringSelectMenuBuilder
} from 'discord.js';
import botOwner from '../preconditions/botOwner';
import { refuseTemplates } from '../utils/configs.json';

export default new ButtonHandler({
    customId: 'refuse',
    preconditions: [botOwner]
}).setRun(async ({ button, user }) => {
    const msg = (await button
        .reply({
            fetchReply: true,
            ephemeral: true,
            content: button.client.langs.getText(button, 'denyButton', 'usageQuestion'),
            components: [
                new ActionRowBuilder({
                    components: [
                        new ButtonBuilder({
                            label: button.client.langs.getText(button, 'denyButton', 'templateName'),
                            customId: 'template',
                            style: ButtonStyle.Secondary
                        }),
                        new ButtonBuilder({
                            label: button.client.langs.getText(button, 'denyButton', 'customName'),
                            customId: 'custom',
                            style: ButtonStyle.Secondary
                        })
                    ]
                }) as ActionRowBuilder<ButtonBuilder>
            ]
        })
        .catch(() => {})) as Message<true>;

    const mode = await waitForInteraction({
        message: msg,
        user: button.user,
        componentType: ComponentType.Button,
        whoCanReact: 'useronly'
    });

    if (!mode)
        return msg
            .edit({ content: button.client.langs.getText(button, 'utils', 'commandCanceled'), components: [] })
            .catch(() => {});
    let reply: string;

    if (mode.customId === 'template') {
        await mode.deferUpdate();
        await button.editReply({
            content: button.client.langs.getText(button, 'denyButton', 'templateQuestion'),
            components: [
                new ActionRowBuilder({
                    components: [
                        new StringSelectMenuBuilder({ type: ComponentType.StringSelect })
                            .setCustomId('template-selector')
                            .setMaxValues(1)
                            .setOptions(
                                refuseTemplates.map((t) => ({
                                    label: t.label,
                                    description: t.value,
                                    value: t.label
                                }))
                            )
                    ]
                }) as ActionRowBuilder<StringSelectMenuBuilder>
            ]
        });

        const template = await waitForInteraction({
            user: user,
            componentType: ComponentType.StringSelect,
            message: msg,
            whoCanReact: 'everyone'
        });
        if (!template)
            return msg
                .edit({
                    content: button.client.langs.getText(button, 'utils', 'commandCanceled'),
                    components: []
                })
                .catch(() => {});
        reply = refuseTemplates.find((t) => t.label === template.values[0]).reply;
        await button.editReply({
            content: button.client.langs.getText(button, 'denyButton', 'templateUsed'),
            components: []
        });
    } else {
        const modal = new ModalBuilder()
            .setTitle(button.client.langs.getText(button, 'denyButton', 'replyName'))
            .setCustomId('reply-input-modal')
            .setComponents(
                new ActionRowBuilder({
                    components: [
                        new TextInputBuilder()
                            .setLabel(button.client.langs.getText(button, 'denyButton', 'replyLabel'))
                            .setPlaceholder(button.client.langs.getText(button, 'denyButton', 'replyPlaceholder'))
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph)
                            .setCustomId('reply-input-content')
                    ]
                })
            );

        await mode.showModal(modal);
        const modalResult = await mode
            .awaitModalSubmit({
                time: 300000
            })
            .catch(() => {});

        if (!modalResult)
            return msg.edit({
                content: button.client.langs.getText(button, 'utils', 'commandCanceled'),
                components: []
            });
        modalResult.deferUpdate();
        reply = modalResult.fields.getTextInputValue('reply-input-content');
    }
    const sender = button.client.users.cache.get(button.message?.components[0]?.components[2]?.customId);

    if (sender) sender.send(reply).catch(() => {});
    button.message
        .edit({
            components: [],
            content: button.client.langs.getText(button, 'denyButton', 'suggestionRefused')
        })
        .catch(() => {});
    button.editReply({
        components: [],
        content: button.client.langs.getText(button, 'denyButton', 'suggestionRefused')
    });
});
