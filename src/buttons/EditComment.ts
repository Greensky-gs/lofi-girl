import { ButtonHandler } from 'amethystjs';
import { TesterButtons } from '../typings/tester';
import isTester from '../preconditions/isTester';
import { getStationByUrl, resizeStr, row } from '../utils/functions';
import { ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export default new ButtonHandler({
    customId: TesterButtons.EditComment,
    preconditions: [isTester]
}).setRun(async ({ button, message }) => {
    const station = getStationByUrl(message.embeds[0].url);

    const components = message.components;
    const buttons = components[0].components;

    await Promise.all([
        button
            .showModal(
                new ModalBuilder()
                    .setTitle(button.client.langs.getText(button, 'testerEditComment', 'modalTitle'))
                    .setCustomId('modal-comment')
                    .setComponents(
                        row<TextInputBuilder>(
                            new TextInputBuilder()
                                .setLabel(
                                    button.client.langs.getText(button, 'testerEditComment', 'modalTextInputName')
                                )
                                .setStyle(TextInputStyle.Paragraph)
                                .setMaxLength(1000)
                                .setRequired(true)
                                .setPlaceholder(
                                    resizeStr(
                                        button.client.langs.getText(button, 'testerEditComment', 'modalPlaceholder', {
                                            stationEmoji: station.emoji,
                                            stationName: station.name
                                        })
                                    )
                                )
                                .setCustomId('comment')
                        )
                    )
            )
            .catch(() => {}),
        message.edit({
            components: [row(...buttons.map((x) => new ButtonBuilder(x.toJSON() as unknown).setDisabled(true)))]
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
            name: button.client.langs.getText(button, 'testerEditComment', 'commentFieldName'),
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
                components: [row(...buttons.map((x) => new ButtonBuilder(x as unknown).setDisabled(false)))]
            })
            .catch(() => {});
    }
});
