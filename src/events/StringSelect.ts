import { AmethystEvent } from 'amethystjs';
import { ButtonIds } from '../typings/bot';
import { formatTime, getStationByUrl } from '../utils/functions';
import { EmbedBuilder } from 'discord.js';

export default new AmethystEvent('stringSelectInteraction', async (selector) => {
    if (selector.customId === ButtonIds.FindStationSelector) {
        const message = selector.message;
        const skipCheck = !message.guild;

        if (
            !(
                skipCheck ||
                [selector.user.id, undefined].includes(
                    message.guild?.members?.cache?.find(
                        (x) =>
                            x.user.username === message.embeds[0].footer.text &&
                            x.user.displayAvatarURL({ forceStatic: false }) === message.embeds[0].footer.iconURL
                    )?.id
                )
            ) &&
            Date.now() - message.createdTimestamp < 21600000
        )
            return selector
                .reply({
                    ephemeral: true,
                    content: selector.client.langs.getText(selector, 'utils', 'notAllowedToInteract')
                })
                .catch(() => {});
        const station = getStationByUrl(selector.values[0]);

        const embed = new EmbedBuilder()
            .setThumbnail(selector.client.user.displayAvatarURL({ forceStatic: true }))
            .setTitle(`${station.emoji} ${station.name}`)
            .setColor('Orange')
            .setFields({
                name: selector.client.langs.getText(selector, 'infoStation', 'linkName'),
                value: `[${station.name}](${station.url})`,
                inline: true
            })
            .setURL(station.url)
            .setFooter(message.embeds[0].footer);

        if (station.feedbacks.length > 0) {
            embed.setDescription(
                (station.feedbacks.filter((x) => x.comments).length > 0
                    ? station.feedbacks.filter((x) => x.comments.length)[
                          Math.floor(Math.random() * station.feedbacks.filter((x) => x.comments).length)
                      ].comments + '\n'
                    : '') +
                    selector.client.langs.getText(selector, 'infoStation', 'peoplesOpinion') +
                    [...new Set(station.feedbacks.map((x) => x.keywords).flat())].join(', ')
            );
        }
        selector.deferUpdate().catch(() => {});
        selector.message.edit({ embeds: [embed] }).catch(() => {});

        const data = await selector.client.player.search(station.url, {
            requestedBy: selector.user
        });
        const video = data.tracks[0];
        if (!video) return;

        if (video.thumbnail)
            embed.setImage(video.thumbnail ?? selector.client.user.displayAvatarURL({ forceStatic: true }));
        embed.addFields({
            name: selector.client.langs.getText(selector, 'infoStation', 'duration'),
            value:
                station.type === 'radio'
                    ? selector.client.langs.getText(selector, 'infoStation', 'durationTypeLive')
                    : `${formatTime(Math.floor(video.durationMS / 1000), selector)}`,
            inline: true
        });

        selector.message.edit({ embeds: [embed] }).catch(() => {});
    }
});
