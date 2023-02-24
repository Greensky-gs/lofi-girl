import { ButtonHandler } from 'amethystjs';
import { TesterButtons } from '../typings/tester';
import isTester from '../preconditions/isTester';
import { getStationByUrl, row } from '../utils/functions';
import { ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export default new ButtonHandler({
    customId: TesterButtons.EditComment,
    preconditions: [isTester]
}).setRun(async ({ button, user, message }) => {
    const station = getStationByUrl(message.embeds[0].url);

    const components = message.components;
    const buttons = components[0].components;

    await Promise.all([
        button
            .showModal(
                new ModalBuilder()
                    .setTitle('Comment')
                    .setCustomId('modal-comment')
                    .setComponents(
                        row<TextInputBuilder>(
                            new TextInputBuilder()
                                .setLabel('Comment')
                                .setStyle(TextInputStyle.Paragraph)
                                .setMaxLength(1000)
                                .setRequired(true)
                                .setPlaceholder(`Edit your comment about ${station.emoji} ${station.name} here`)
                                .setCustomId('comment')
                        )
                    )
            )
            .catch(() => {}),
        message.edit({
            components: [row(...buttons.map((x) => new ButtonBuilder(x.toJSON()).setDisabled(true)))]
        })
    ]);

    const modal = await button
        .awaitModalSubmit({
            time: 120000
        })
        .catch(() => {});

    if (modal) {
        modal.deferUpdate().catch(() => {});
        const embed = new EmbedBuilder(message.embeds[0].toJSON());
        embed.spliceFields(1, 1, {
            name: 'Comment',
            value: modal.fields.getTextInputValue('comment'),
            inline: false
        });

        message
            .edit({
                components: [
                    row(
                        new ButtonBuilder()
                            .setLabel('Edit comment')
                            .setCustomId(TesterButtons.EditComment)
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setLabel('Delete comment')
                            .setCustomId(TesterButtons.RemoveComment)
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setLabel('Keywords')
                            .setCustomId(TesterButtons.KeywordsButton)
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setLabel('Send')
                            .setCustomId(TesterButtons.TesterValidate)
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setLabel('Cancel')
                            .setCustomId(TesterButtons.TesterCancel)
                            .setStyle(ButtonStyle.Danger)
                    )
                ],
                embeds: [embed]
            })
            .catch(() => {});
    } else {
        message
            .edit({
                components: [row(...buttons.map((x) => new ButtonBuilder(x).setDisabled(false)))]
            })
            .catch(() => {});
    }
});
