import { ButtonHandler } from 'amethystjs';
import { TesterButtons } from '../typings/tester';
import isTester from '../preconditions/isTester';
import { boolEmojis, getStationByUrl, row } from '../utils/functions';
import { ButtonBuilder, ButtonStyle, EmbedBuilder, Message, TextChannel } from 'discord.js';
import suggestChannel from '../preconditions/suggestChannel';

export default new ButtonHandler({
    customId: TesterButtons.TesterValidate,
    preconditions: [isTester, suggestChannel]
}).setRun(async ({ button, message, user }) => {
    const station = getStationByUrl(message.embeds[0].url);
    const embed = new EmbedBuilder(message.embeds[0]);

    await button.deferReply({ ephemeral: true }).catch(() => {});
    const channel = (await message.client.channels.fetch(process.env.suggestChannel)) as TextChannel;

    if (!channel)
        return button
            .editReply({
                content: `:x: | Suggest channel isn't correctly configured. Please contact the developer.`
            })
            .catch(() => {});

    const data = {
        comment: embed.data.fields[1]?.value === 'No comment' ? undefined : embed.data.fields[1].value,
        keywords: embed.data.fields[0]?.value === 'No keywords' ? [] : embed.data.fields[0].value.split(' ')
    };

    const msg = (await channel
        .send({
            embeds: [
                new EmbedBuilder()
                    .setURL(station.url)
                    .setTitle(`${station.emoji} ${station.name}`)
                    .setColor('Orange')
                    .setDescription(
                        `${user.username} just sent this feedback about [${station.emoji} ${station.name}](${station.url})`
                    )
                    .setFields(
                        {
                            name: 'Comment',
                            value: data.comment ?? 'N/A',
                            inline: false
                        },
                        {
                            name: 'Keywords',
                            value: data.keywords?.join(' ') ?? 'N/A',
                            inline: false
                        }
                    )
                    .setImage(embed.data.image.url)
            ],
            components: [
                row(
                    new ButtonBuilder()
                        .setLabel('Validate')
                        .setEmoji(boolEmojis(true))
                        .setCustomId(TesterButtons.OwnerValidate)
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setLabel('Reject')
                        .setEmoji(boolEmojis(false))
                        .setCustomId(TesterButtons.OwnerRefuse)
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setLabel('User-id')
                        .setCustomId(user.id)
                        .setDisabled(true)
                        .setStyle(ButtonStyle.Secondary)
                )
            ],
            content: `<@${process.env.botOwner}>`
        })
        .catch(() => {})) as Message<true>;

    button
        .editReply({
            content: msg
                ? `Your feedback has been sent to the owner`
                : `Your feedback hasn't been sent to the owner because of an internal error`
        })
        .catch(() => {});

    message
        .edit({
            embeds: [embed],
            content: `Feedback ${msg ? 'sent' : 'not sent'}`,
            components: []
        })
        .catch(() => {});
});
