import { ButtonHandler } from 'amethystjs';
import { TesterButtons } from '../typings/tester';
import botOwner from '../preconditions/botOwner';
import { getStationByUrl, row } from '../utils/functions';
import { ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export default new ButtonHandler({
    customId: TesterButtons.OwnerRefuse,
    preconditions: [botOwner]
}).setRun(async ({ button, message, user }) => {
    const station = getStationByUrl(message.embeds[0].url);
    const tester = message.client.users.cache.get(message.components[0].components[2].customId);

    if (!tester)
        return button
            .reply({
                ephemeral: true,
                content: button.client.langs.getText(button, 'ownerRejects', 'testerNotCached')
            })
            .catch(() => {});
    await button
        .showModal(
            new ModalBuilder()
                .setTitle(button.client.langs.getText(button, 'ownerRejects', 'modalTitle'))
                .setCustomId('modal-rejection')
                .setComponents(
                    row<TextInputBuilder>(
                        new TextInputBuilder()
                            .setLabel(button.client.langs.getText(button, 'ownerRejects', 'reasonLabel'))
                            .setPlaceholder(button.client.langs.getText(button, 'ownerRejects', 'reasonPlaceholder'))
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                            .setCustomId('reason')
                    )
                )
        )
        .catch(() => {});
    const reply = await button
        .awaitModalSubmit({
            time: 120000
        })
        .catch(() => {});

    if (!reply) return;
    reply.deferUpdate().catch(() => {});

    tester
        .send({
            content: `:x: | Your feedback has been rejected by the owner. Here is his message :\n${reply.fields.getTextInputValue(
                'reason'
            )}`
        })
        .catch(() => {});
    message
        .edit({
            components: [],
            content: button.client.langs.getText(button, 'ownerRejects', 'feedbackRejected')
        })
        .catch(() => {});
});
