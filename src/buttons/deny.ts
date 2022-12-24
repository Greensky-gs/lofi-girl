import { ButtonHandler, waitForInteraction } from 'amethystjs';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Message,
    ComponentType,
    SelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js';
import botOwner from '../preconditions/botOwner';
import { refuseTemplates } from '../utils/configs.json';

export default new ButtonHandler({
    customId: 'refuse',
    preconditions: [botOwner]
}).setRun(async ({ button, message, user }) => {
    const msg = (await button
        .reply({
            fetchReply: true,
            ephemeral: true,
            content: `❓ | What do you want to use ?`,
            components: [
                new ActionRowBuilder({
                    components: [
                        new ButtonBuilder({
                            label: 'Template',
                            customId: 'template',
                            style: ButtonStyle.Secondary
                        }),
                        new ButtonBuilder({ label: 'Custom', customId: 'custom', style: ButtonStyle.Secondary })
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

    if (!mode) return msg.edit({ content: `:bulb: | Command canceled`, components: [] }).catch(() => {});
    let reply: string;

    if (mode.customId === 'template') {
        await mode.deferUpdate();
        await button.editReply({
            content: `❓ | Choose a template`,
            components: [
                new ActionRowBuilder({
                    components: [
                        new SelectMenuBuilder({ type: ComponentType.StringSelect })
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
                }) as ActionRowBuilder<SelectMenuBuilder>
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
                    content: `:bulb: | Command canceled`,
                    components: []
                })
                .catch(() => {});
        reply = refuseTemplates.find((t) => t.label === template.values[0]).reply;
        await button.editReply({
            content: `:white_check_mark: | Template used`,
            components: []
        });
    } else {
        const modal = new ModalBuilder()
            .setTitle('Reply')
            .setCustomId('reply-input-modal')
            .setComponents(
                new ActionRowBuilder({
                    components: [
                        new TextInputBuilder()
                            .setLabel('Reply content')
                            .setPlaceholder('Enter your reply content here')
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
                content: `:bulb: | Command canceled`,
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
            content: `:x: | Suggesstion refused`
        })
        .catch(() => {});
    button.editReply({
        components: [],
        content: ':x: | Suggestion refused'
    });
});
