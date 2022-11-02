import { ActionRowBuilder, ApplicationCommandOptionType, BaseInteraction, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, WebhookClient } from "discord.js";
import { LofiCommand } from "../structures/Command";

export default new LofiCommand({
    name: 'feedback',
    description: "Send your feedback about Lofi Girl",
    admin: false,
    dm: false,
    cooldown: 5,
    options: [
        {
            name: 'feedback',
            description: "Your feedback about the bot",
            required: false,
            type: ApplicationCommandOptionType.String
        }
    ],
    execute: async({ interaction, options }) => {
        let feedback = options.getString('feedback');
        let global: string;
        let ctx: BaseInteraction = interaction;

        if (!feedback) {
            const modal = new ModalBuilder()
                .setTitle('Feedback')
                .setCustomId('feedback-modal')
                .setComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                            .setLabel('Global feedback')
                            .setRequired(true)
                            .setMaxLength(20)
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('Global feedback about Lofi Girl Bot')
                            .setCustomId('global-feedback')
                        ) as ActionRowBuilder<TextInputBuilder>,
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setLabel('Detailled feedback')
                                .setRequired(true)
                                .setMinLength(100)
                                .setMaxLength(512)
                                .setStyle(TextInputStyle.Paragraph)
                                .setPlaceholder('Lofi Girl Bot detailled feedback')
                                .setCustomId('feedback-content')
                        ) as ActionRowBuilder<TextInputBuilder>
                )

            interaction.showModal(modal).catch(() => {});
            const reply = await interaction.awaitModalSubmit({
                time: 600000
            });
            if (!reply) return;
            feedback = reply.fields.getTextInputValue('feedback-content');
            global = reply.fields.getTextInputValue('global-feedback');
            ctx = reply;
        }
        if (!feedback) return;

        if (ctx.isRepliable()) {
            ctx.reply({
                ephemeral: true,
                content: `💫 | Thanks you for your feedback`
            }).catch(() => {});
        }
        const webhook = new WebhookClient({ url: process.env.feedback });
        webhook.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Feedback')
                    .setDescription(`${interaction.user.username} sent his feedback of the bot`)
                    .setFields(
                        {
                            name: 'Feedback',
                            value: feedback,
                            inline: true
                        }
                    )
                    .setColor('DarkGreen')
                    .setThumbnail(interaction.client.user.displayAvatarURL({ forceStatic: true }))
                    .setFooter({ text: global ?? interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ forceStatic: false }) })
            ]
        })
    }
})