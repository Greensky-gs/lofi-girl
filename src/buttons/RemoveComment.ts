import { ButtonHandler } from "amethystjs";
import isTester from "../preconditions/isTester";
import { TesterButtons } from "../typings/tester";
import { ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { row } from "../utils/functions";

export default new ButtonHandler({
    preconditions: [isTester],
    customId: TesterButtons.RemoveComment
}).setRun(async({ button, message, user }) => {
    button.deferUpdate().catch(() => {});

    const embed = new EmbedBuilder(message.embeds[0]);
    embed.spliceFields(1, 1, {
        name: 'Comment',
        value: 'No comment',
        inline: false
    })

    message.edit({
        embeds:  [ embed],
        components: [
            row(new ButtonBuilder()
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
            .setStyle(ButtonStyle.Danger))
        ]
    }).catch(() => {});
})