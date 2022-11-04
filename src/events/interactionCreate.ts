import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    CommandInteractionOptionResolver,
    ComponentType,
    Message,
    ModalBuilder,
    SelectMenuBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js';
import { LofiEvent } from '../structures/Event';
import { stations, refuseTemplates } from '../utils/configs.json';
import { station } from '../typings/station';
import { cmdInteraction } from '../typings/command';
import confs from '../utils/configs.json';
import { writeFileSync } from 'fs';
import { waitForInteraction } from '../utils/waitFor';

export default new LofiEvent('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        const cmd = interaction.client.commands.find((x) => x.name === interaction.commandName);
        if (
            interaction.client.CooldownManager.hasCooldown({
                cmd: cmd.name,
                id: interaction.user.id
            })
        )
            return interaction
                .reply(
                    `:x: | You have a cooldown on this command.\nPlease try again in ${Math.floor(
                        (interaction.client.CooldownManager.remainingCooldownTime({
                            cmd: cmd.name,
                            id: interaction.user.id
                        }) as number) / 1000
                    )} seconds`
                )
                .catch(() => {});

        interaction.client.CooldownManager.setCooldown({
            time: cmd.cooldown,
            cmd: cmd.name,
            id: interaction.user.id
        });
        if (cmd.dm === false && !interaction.guild)
            return interaction.reply(`:x: | This command is only executable in a server`).catch(() => {});
        if (
            cmd.admin === true &&
            interaction.guild &&
            !(interaction as CommandInteraction<'cached'>).member.permissions.has('Administrator')
        )
            return interaction.reply(`:x: | This command is an admin-only command`).catch(() => {});

        const run = new Promise((resolve) =>
            resolve(
                cmd.execute({
                    interaction: interaction as cmdInteraction,
                    options: interaction.options as CommandInteractionOptionResolver
                })
            )
        );
        run.catch((error) => {
            console.error(error);
            interaction[interaction.deferred || interaction.replied ? 'editReply' : 'reply']({
                components: [],
                embeds: [],
                content: `:x: | An error occured while running the command`
            }).catch(() => {});
        });
    }
    if (interaction.isAutocomplete()) {
        const focused = interaction.options.getFocused(true);

        if (focused.name === 'command') {
            return interaction
                .respond(
                    interaction.client.commands
                        .filter((c) => c.name.includes(focused.value) || focused.value.includes(c.name))
                        .map((x) => ({ name: x.name, value: x.name }))
                )
                .catch(() => {});
        }
        if (focused.name === 'station') {
            const RawResponse = (stations as station[])
                .concat({ name: 'random', url: 'random', emoji: '🎲', type: 'get a random station' })
                .filter(
                    (s) =>
                        s.name.toLowerCase().includes(focused.value.toLowerCase()) ||
                        focused.value.toLowerCase().includes(s.name.toLowerCase()) ||
                        s.type.includes(focused.value.toLowerCase()) ||
                        focused.value.toLowerCase().includes(s.type)
                );

            let response: station[] = [];
            if (RawResponse.length > 25) {
                // Here we are going to randomise the response to display differents musics everytime
                for (let i = 0; i < 25; i++) {
                    const arr = RawResponse.filter((x) => !response.map((y) => y.url).includes(x.url));
                    const selected = arr[Math.floor(Math.random() * arr.length)];

                    response.push(selected);
                }
            } else {
                response = RawResponse;
            }

            return interaction
                .respond(response.map((x) => ({ name: `${x.emoji} ${x.name} - ${x.type}`, value: x.url })))
                .catch(() => {});
        }
    }
    if (interaction.isButton()) {
        if (interaction.user.id !== process.env.botOwner)
            return interaction
                .reply({
                    content: `:x: | You're not allowed to interact with this message`,
                    ephemeral: true
                })
                .catch(() => {});

        if (interaction.customId === 'accept') {
            const data = {
                title: interaction.message.embeds[0].title,
                url: interaction.message.embeds[0].url
            };

            const beats = data.title.split('lofi hip hop/')[1] ?? 'no beats found';
            const modal = new ModalBuilder()
                .setCustomId('accept-modal')
                .setTitle('Station data')
                .setComponents(
                    new ActionRowBuilder({
                        components: [
                            new TextInputBuilder()
                                .setCustomId('a.name')
                                .setLabel('Name')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder(data.title)
                                .setRequired(true)
                        ]
                    }),
                    new ActionRowBuilder({
                        components: [
                            new TextInputBuilder()
                                .setCustomId('a.beats')
                                .setLabel('Beats')
                                .setRequired(true)
                                .setStyle(TextInputStyle.Short)
                                .setValue(beats.substring(0, beats.length - 2))
                        ]
                    }),
                    new ActionRowBuilder({
                        components: [
                            new TextInputBuilder()
                                .setCustomId('a.emoji')
                                .setLabel('Emoji')
                                .setRequired(true)
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('Emoji')
                        ]
                    })
                );

            await interaction.showModal(modal).catch(() => {});
            const reply = await interaction.awaitModalSubmit({
                time: 300000
            });

            if (!reply) return;
            const title = reply.fields.getTextInputValue('a.name');
            const beatsV = `(lofi hip hop/${reply.fields.getTextInputValue('a.beats')})`;
            const emoji = reply.fields.getTextInputValue('a.emoji');

            confs.stations.push({
                url: data.url,
                name: `${title} - ${beatsV}`,
                emoji,
                type: 'playlist'
            });
            writeFileSync(
                `./${__filename.endsWith('.ts') ? 'src' : 'dist'}/utils/configs.json`,
                JSON.stringify(confs, null, 4)
            );

            reply
                .reply({
                    content: `🎧 | Music added`,
                    ephemeral: true
                })
                .catch(() => {});
            const user = interaction.client.users.cache.get(interaction.message.components[0].components[2].customId);
            user.send(
                `🎧 | Your [suggestion](${data.url}) has been accepted !\nThank you for submitting a music`
            ).catch(() => {});

            interaction.message.edit({ components: [], content: `Music added` }).catch(() => {});
        }
        if (interaction.customId === 'refuse') {
            const msg = (await interaction
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
                user: interaction.user,
                component_type: ComponentType.Button
            });

            if (!mode) return msg.edit({ content: `:bulb: | Command canceled`, components: [] }).catch(() => {});
            let reply: string;

            if (mode.customId === 'template') {
                await mode.deferUpdate();
                await interaction.editReply({
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
                    user: interaction.user,
                    component_type: ComponentType.StringSelect,
                    message: msg
                });
                if (!template)
                    return msg
                        .edit({
                            content: `:bulb: | Command canceled`,
                            components: []
                        })
                        .catch(() => {});
                reply = refuseTemplates.find((t) => t.label === template.values[0]).reply;
                await template.message.edit({
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
                const modalResult = await mode.awaitModalSubmit({
                    time: 300000
                });

                if (!modalResult)
                    return msg.edit({
                        content: `:bulb: | Command canceled`,
                        components: []
                    });
                modalResult.deferUpdate();
                reply = modalResult.fields.getTextInputValue('reply-input-content');
            }
            const user = interaction.client.users.cache.get(interaction.message.components[0].components[2].customId);

            user.send(reply).catch(() => {});
            interaction.message
                .edit({
                    components: [],
                    content: `:x: | Suggesstion refused`
                })
                .catch(() => {});
        }
    }
});
