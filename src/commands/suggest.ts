import { AmethystCommand } from 'amethystjs';
import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    TextChannel
} from 'discord.js';
import { getBasicInfo, getVideoID, validateURL, videoInfo } from 'ytdl-core';
import suggestChannel from '../preconditions/suggestChannel';
import { lofiGirlID } from '../utils/configs.json';
import { boolEmojis, getStationByUrl } from '../utils/functions';

export default new AmethystCommand({
    name: 'suggestion',
    description: 'Suggest a lofi music to the bot owner',
    preconditions: [suggestChannel],
    options: [
        {
            name: 'url',
            description: 'Url of the Lofi video you want to suggest',
            required: true,
            type: ApplicationCommandOptionType.String
        }
    ]
}).setChatInputRun(async ({ interaction, options }) => {
    const url = options.getString('url');
    await interaction.deferReply();

    if (!validateURL(url)) return interaction.editReply(`:x: | This is not a valid video url`).catch(() => {});
    const id = getVideoID(url);
    const roboURL = `https://www.youtube.com/watch?v=${id}`;
    const info = (await getBasicInfo(roboURL).catch(() => {})) as videoInfo;

    if (!info || info.videoDetails.author.id !== lofiGirlID)
        return interaction
            .editReply(`:x: | You can suggest only videos from [Lofi Girl](https://youtube.com/c/LofiGirl) channel`)
            .catch(() => {});

    const station = getStationByUrl(url, false);
    if (station)
        return interaction.editReply(`${station.emoji} | This song already exists in my song list`).catch(() => {});

    const channel = (await interaction.client.channels.fetch(process.env.suggestChannel)) as TextChannel;
    const s = await channel
        .send({
            embeds: [
                new EmbedBuilder()
                    .setTitle(info.videoDetails.title)
                    .setThumbnail(info.thumbnail_url ?? interaction.client.user.displayAvatarURL({ forceStatic: true }))
                    .setURL(roboURL)
                    .setDescription(
                        `${interaction.user.username} suggested a video : [${info.videoDetails.title}](${roboURL})`
                    )
                    .setColor('DarkGreen')
            ],
            content: `<@${process.env.botOwner}>`,
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder({
                        label: 'Accept',
                        emoji: boolEmojis(true),
                        customId: 'accept',
                        style: ButtonStyle.Success
                    }),
                    new ButtonBuilder({
                        label: 'Refuse',
                        emoji: boolEmojis(false),
                        customId: 'refuse',
                        style: ButtonStyle.Danger
                    }),
                    new ButtonBuilder({
                        label: 'User-id',
                        style: ButtonStyle.Secondary,
                        disabled: true,
                        customId: interaction.user.id
                    })
                ) as ActionRowBuilder<ButtonBuilder>
            ]
        })
        .catch(() => {});

    interaction
        .editReply(
            !s
                ? `:x: | An error happened while sending the message to the bot owner`
                : `🎧 | Your [suggestion](${roboURL}) has been sent to the bot owner`
        )
        .catch(() => {});
});
