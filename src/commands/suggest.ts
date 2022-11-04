import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    TextChannel
} from 'discord.js';
import { getBasicInfo, getVideoID, validateURL, videoInfo } from 'ytdl-core';
import { LofiCommand } from '../structures/Command';
import { lofiGirlID, stations } from '../utils/configs.json';
import { boolEmojis, getVidLink } from '../utils/functions';

export default new LofiCommand({
    name: 'suggest',
    description: 'Submit a lofi playlist from youtube to add it in my stations',
    dm: true,
    admin: false,
    cooldown: 5,
    options: [
        {
            name: 'url',
            description: 'Youtube link of the video',
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    execute: async ({ interaction, options }) => {
        const url = options.getString('url');
        await interaction.deferReply();

        if (!validateURL(url)) return interaction.editReply(`:x: | You didn't sent a valid video url`).catch(() => {});
        const id = getVideoID(url);
        const info = (await getBasicInfo(`https://www.youtube.com/watch?=${id}`).catch(() => {})) as videoInfo;

        if (info.videoDetails.author.id !== lofiGirlID)
            return interaction
                .editReply(`:x: | You can suggest only videos from [Lofi Girl](https://youtube.com/c/LofiGirl)`)
                .catch(() => {});
        if (stations.find((x) => x.url === getVidLink(info.videoDetails.videoId)))
            return interaction.editReply(`🎧 | This station already exists in my song list`).catch(() => {});

        const channel = (await interaction.client.channels.fetch(process.env.suggestChannel)) as TextChannel;
        const s = await channel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(info.videoDetails.title)
                        .setThumbnail(
                            info.thumbnail_url ?? interaction.client.user.displayAvatarURL({ forceStatic: true })
                        )
                        .setURL(getVidLink(info.videoDetails.videoId))
                        .setDescription(
                            `${interaction.user.username} suggested a video : [${info.videoDetails.title}](${getVidLink(
                                info.videoDetails.videoId
                            )})`
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
                    : `🎧 | Your [suggestion](${getVidLink(info.videoDetails.videoId)}) has been sent to the bot owner`
            )
            .catch(() => {});
    }
});
