import { ButtonHandler } from 'amethystjs';
import { PanelIds } from '../typings/bot';
import botOwner from '../preconditions/botOwner';
import { EmbedBuilder } from 'discord.js';
import { stations, testers, testKeywords } from '../utils/configs.json';

export default new ButtonHandler({
    customId: PanelIds.InstantInfo,
    preconditions: [botOwner]
}).setRun(async ({ button, user, message }) => {
    const received = Date.now();
    await button.deferReply({ ephemeral: true }).catch(() => {});

    await button.client.guilds.fetch().catch(() => {});

    const data = {
        guildSize: button.client.guilds.cache.size,
        memberCount: button.client.guilds.cache.map((x) => x.memberCount).reduce((a, b) => a + b),
        uptime: ((Date.now() - button.client.uptime) / 1000).toFixed(0),
        playingIn: button.client.player.nodes.cache.size,
        stationsCount: stations.length,
        testerCount: testers.length,
        keywords: testKeywords.length
    };
    await button
        .editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(button.client.langs.getText(button, 'instantInfo', 'title'))
                    .setDescription(
                        button.client.langs.getText(button, 'instantInfo', 'description', {
                            clientId: button.client.user.id
                        })
                    )
                    .setFields(
                        {
                            name: button.client.langs.getText(button, 'instantInfo', 'uptimeName'),
                            value: button.client.langs.getText(button, 'instantInfo', 'uptimeValue', {
                                uptime: data.uptime
                            }),
                            inline: true
                        },
                        {
                            name: button.client.langs.getText(button, 'instantInfo', 'memberCountName'),
                            value: button.client.langs.getText(button, 'instantInfo', 'memberCountValue', {
                                membercount: data.memberCount,
                                guilds: data.guildSize
                            }),
                            inline: true
                        },
                        {
                            name: button.client.langs.getText(button, 'instantInfo', 'playingInName'),
                            value: button.client.langs.getText(button, 'instantInfo', 'playingInValue', {
                                guilds: data.playingIn
                            }),
                            inline: true
                        },
                        {
                            name: '\u200b',
                            value: '\u200b',
                            inline: false
                        },
                        {
                            name: button.client.langs.getText(button, 'instantInfo', 'stationsName'),
                            value: button.client.langs.getText(button, 'instantInfo', 'stationsValue', {
                                stationsCount: data.stationsCount,
                                testerCount: data.testerCount,
                                keywords: data.keywords
                            }),
                            inline: true
                        },
                        {
                            name: button.client.langs.getText(button, 'instantInfo', 'pingName'),
                            value: button.client.langs.getText(button, 'instantInfo', 'pingValue', {
                                websocket: button.client.ws.ping,
                                response: Date.now() - received
                            })
                        },
                        {
                            name: button.client.langs.getText(button, 'instantInfo', 'memory'),
                            value: '```json\n' + JSON.stringify(process.memoryUsage(), null, 4) + '\n```',
                            inline: false
                        }
                    )
                    .setColor(button.guild.members.me.displayHexColor)
                    .setThumbnail(button.client.user.displayAvatarURL())
            ]
        })
        .catch(() => {});
});
