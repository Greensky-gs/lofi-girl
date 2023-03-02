import { AmethystEvent } from 'amethystjs';
import { ActivityOptions, ActivityType, ButtonBuilder, ButtonStyle, EmbedBuilder, TextChannel } from 'discord.js';
import { station } from '../typings/station';
import { stations, recommendation } from '../utils/configs.json';
import { row } from '../utils/functions';
import { PanelIds } from '../typings/bot';

export default new AmethystEvent('ready', async (client) => {
    const statuses: (() => Promise<ActivityOptions>)[] = [
        async () => {
            return {
                name: 'Lofi music',
                type: ActivityType.Listening,
                url: 'https://youtube.com/c/LofiGirl'
            };
        },
        async () => {
            await client.guilds.fetch();
            return {
                name: `${client.guilds.cache.size} servers`,
                type: ActivityType.Listening
            };
        },
        async () => {
            return {
                name: `${stations.length} musics`,
                type: ActivityType.Listening
            };
        },
        async () => {
            return {
                name: `music in ${client.player.queues.size} servers`,
                type: ActivityType.Playing
            };
        }
    ];
    const initialLength = statuses.length;
    const actualRecommendation: station | { url: undefined } = { url: undefined };

    let index = 0;
    client.user.setActivity(await statuses[index]());
    index++;

    setInterval(async () => {
        index++;
        client.user.setActivity(await statuses[index % statuses.length]());

        if (
            Object.keys(recommendation).length > 0 &&
            actualRecommendation?.url !== recommendation.url &&
            actualRecommendation.url
        ) {
            const fnt = async (): Promise<ActivityOptions> => {
                return {
                    name: `${(recommendation as station).emoji} ${(recommendation as station).name}`,
                    type: ActivityType.Listening,
                    url: (recommendation as station).url
                };
            };
            if (statuses.length > initialLength) {
                statuses[4] = fnt;
            } else {
                statuses.push(fnt);
            }
        }
    }, 20000);

    client.user.setPresence({
        status: 'idle'
    });

    // Panel
    const panelChannel = (await client.channels.fetch(process.env.panelChannel)) as TextChannel;
    if (!panelChannel) {
        throw new Error('Panel channel is unfoundable');
    }
    const pinned = await panelChannel.messages.fetchPinned();
    pinned
        .first()
        ?.delete()
        .catch(() => {});

    const panel = await panelChannel
        .send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Lofi Girl Panel')
                    .setDescription(
                        `This is the control panel of <@${client.user.id}>\nUse the buttons below to interact with the panel`
                    )
                    .setColor(panelChannel.guild.members.me.displayHexColor)
                    .setTimestamp()
                    .setThumbnail(client.user.displayAvatarURL({ forceStatic: false }))
            ],
            components: [
                row(
                    new ButtonBuilder()
                        .setLabel('Instant informations')
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId(PanelIds.InstantInfo),
                    new ButtonBuilder()
                        .setLabel('Clear channel')
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(PanelIds.ClearChannel),
                    new ButtonBuilder()
                        .setLabel('Remove a station')
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(PanelIds.RemoveStation),
                    new ButtonBuilder()
                        .setLabel('Keywords')
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(PanelIds.Keywords),
                    new ButtonBuilder()
                        .setLabel('Restart bot')
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId(PanelIds.Reboot)
                ),
                row(
                    new ButtonBuilder().setLabel('Testers').setCustomId(PanelIds.Testers).setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setLabel('Manage feedback')
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(PanelIds.ManageFeedback)
                )
            ]
        })
        .catch(() => {});

    if (panel) panel.pin().catch(() => {});
    const embed = () => {
        return new EmbedBuilder().setTitle('Error').setTimestamp().setColor('#ff0000');
    };
    process.on('uncaughtExceptionMonitor', (error, origin) => {
        panelChannel
            .send({
                embeds: [
                    embed()
                        .setDescription(
                            `Name: ${error.name}\nMessage: ${error.message}${
                                error.cause ? `\nCause: ${error.cause}` : ''
                            }${error.stack ? `\nStack: ${error.stack}` : ''}`
                        )
                        .setFields({
                            name: 'Origin',
                            value: `${origin}`
                        })
                ]
            })
            .catch(() => {});
    });
    process.on('uncaughtException', (error, origin) => {
        panelChannel
            .send({
                embeds: [
                    embed()
                        .setDescription(
                            `Name: ${error.name}\nMessage: ${error.message}${
                                error.cause ? `\nCause: ${error.cause}` : ''
                            }${error.stack ? `\nStack: ${error.stack}` : ''}`
                        )
                        .setFields({
                            name: 'Origin',
                            value: `${origin}`
                        })
                ]
            })
            .catch(() => {});
    });
    process.on('unhandledRejection', (error, promise) => {
        console.log(error);
        panelChannel
            .send({
                embeds: [
                    embed()
                        .setDescription('```json\n' + JSON.stringify(error, null, 4) + '\n```')
                        .setFields({
                            name: 'Promise',
                            value: `\`\`\`json\n${JSON.stringify(promise, null, 4)}\`\`\``,
                            inline: false
                        })
                ]
            })
            .catch(() => {});
    });
});
