import { AmethystCommand } from 'amethystjs';
import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    TextChannel
} from 'discord.js';
import { video_info, extractID, yt_validate, InfoData } from 'play-dl'
import suggestChannel from '../preconditions/suggestChannel';
import { lofiGirlID } from '../utils/configs.json';
import { boolEmojis, buildLocalizations, getStationByUrl } from '../utils/functions';

const locals = buildLocalizations('suggestion');
export default new AmethystCommand({
    name: 'suggestion',
    description: 'Suggest a lofi music to the bot owner',
    preconditions: [suggestChannel],
    options: [
        {
            name: 'url',
            description: 'Url of the Lofi video you want to suggest',
            required: true,
            type: ApplicationCommandOptionType.String,
            nameLocalizations: locals.options.url.name,
            descriptionLocalizations: locals.options.url.description
        }
    ],
    nameLocalizations: locals.name,
    descriptionLocalizations: locals.description
}).setChatInputRun(async ({ interaction, options }) => {
    const url = options.getString('url');
    await interaction.deferReply();

    if (!yt_validate(url))
        return interaction
            .editReply(interaction.client.langs.getText(interaction, 'suggest', 'invalidVideo'))
            .catch(() => {});
    const id = extractID(url);
    const roboURL = `https://www.youtube.com/watch?v=${id}`;
    const info = (await video_info(roboURL).catch(() => {})) as InfoData;

    const station = getStationByUrl(url, false);
    if (station)
        return interaction
            .editReply(
                interaction.client.langs.getText(interaction, 'suggest', 'alreadyExists', {
                    stationEmoji: station.emoji
                })
            )
            .catch(() => {});

    const channel = (await interaction.client.channels.fetch(process.env.suggestChannel)) as TextChannel;
    const s = await channel
        .send({
            embeds: [
                new EmbedBuilder()
                    .setTitle(info.video_details.title)
                    .setThumbnail(info.video_details.thumbnails[0]?.url ?? interaction.client.user.displayAvatarURL({ forceStatic: true }))
                    .setURL(roboURL)
                    .setDescription(
                        `${interaction.user.username} suggested a video : [${info.video_details.title}](${roboURL})`
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
                ? interaction.client.langs.getText(interaction, 'suggest', 'errorOccured')
                : interaction.client.langs.getText(interaction, 'suggest', 'sended', { url: roboURL })
        )
        .catch(() => {});
});
