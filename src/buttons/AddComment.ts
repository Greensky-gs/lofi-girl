import { ButtonHandler } from 'amethystjs';
import { TesterButtons } from '../typings/tester';
import isTester from '../preconditions/isTester';
import { getStationByUrl, row } from '../utils/functions';
import { ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export default new ButtonHandler({
    customId: TesterButtons.AddComment,
    preconditions: [isTester]
}).setRun(async ({ button, user, message }) => {
    const station = getStationByUrl(message.embeds[0].url);

    button.showModal(
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
                        .setPlaceholder(`Write your comment about ${station.emoji} ${station.name} here`)
                )
            )
    );
});
