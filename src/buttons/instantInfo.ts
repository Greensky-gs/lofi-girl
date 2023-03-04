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
                    .setTitle('Instant informations')
                    .setDescription(`Instant informations about <@${button.client.user.id}>`)
                    .setFields(
                        {
                            name: 'Uptime',
                            value: `Online <t:${data.uptime}:R> ( <t:${data.uptime}:F> )`,
                            inline: true
                        },
                        {
                            name: 'Membercount',
                            value: `${data.memberCount} members in ${data.guildSize} guilds`,
                            inline: true
                        },
                        {
                            name: 'Playing in',
                            value: `${data.playingIn} servers`,
                            inline: true
                        },
                        {
                            name: '\u200b',
                            value: '\u200b',
                            inline: false
                        },
                        {
                            name: 'Stations',
                            value: `${data.stationsCount} stations, ${data.testerCount} testers and ${data.keywords} keywords`,
                            inline: true
                        },
                        {
                            name: 'Ping',
                            value: `Websocket: \`${button.client.ws.ping}ms\`\nResponse to this interaction: \`${
                                Date.now() - received
                            }ms\``
                        },
                        {
                            name: 'Memory',
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
