import { ButtonHandler } from 'amethystjs';
import { TesterButtons } from '../typings/tester';
import isTester from '../preconditions/isTester';
import { ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { getStationByUrl, row } from '../utils/functions';

export default new ButtonHandler({
    customId: TesterButtons.SendFeedback,
    preconditions: [isTester]
}).setRun(({ button, user, message }) => {
    const station = getStationByUrl(message.embeds[0].url);

    button.deferUpdate().catch(() => {});
    message
        .edit({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Feedback')
                    .setDescription(`Send your feedback about [${station.emoji} ${station.name}](${station.url})`)
                    .setColor('Orange')
                    .setURL(station.url)
                    .setFields(
                        {
                            name: 'Keywords',
                            value: 'No keywords',
                            inline: false
                        },
                        {
                            name: 'Comment',
                            value: 'No comment',
                            inline: false
                        }
                    )
                    .setImage(message.embeds[0]?.data?.image?.url)
            ],
            components: [
                row(
                    new ButtonBuilder()
                        .setLabel('Comment')
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId(TesterButtons.AddComment),
                    new ButtonBuilder()
                        .setLabel('Keywords')
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(TesterButtons.KeywordsButton),
                    new ButtonBuilder()
                        .setLabel('Send')
                        .setStyle(ButtonStyle.Success)
                        .setCustomId(TesterButtons.TesterValidate),
                    new ButtonBuilder()
                        .setLabel('Cancel')
                        .setCustomId(TesterButtons.TesterCancel)
                        .setStyle(ButtonStyle.Danger)
                )
            ]
        })
        .catch(() => {});
});
