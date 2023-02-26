import { ButtonHandler, waitForInteraction, waitForMessage } from "amethystjs";
import { PanelIds } from "../typings/bot";
import botOwner from "../preconditions/botOwner";
import { Message, StringSelectMenuBuilder, TextChannel, ComponentType, ButtonBuilder, ButtonStyle } from "discord.js";
import confs from '../utils/configs.json';
import { boolEmojis, getStationByUrl, resizeStr, row } from "../utils/functions";
import { writeFileSync } from "fs";

export default new ButtonHandler({
    customId: PanelIds.RemoveStation,
    preconditions: [botOwner]
})
    .setRun(async ({ button, message, user }) => {
        const msg = await button.reply({
            content: `What is the name of the station ?\nReply in the chat, by the station name\nReply by \`cancel\` to cancel`,
            fetchReply: true
        }).catch(() => {}) as Message<true>;

        const reply = await waitForMessage({
            channel: message.channel as TextChannel,
            user
        }).catch(() => {});

        if (reply) reply.delete().catch(() => {});
        if (!reply || reply.content.toLowerCase() === 'cancel') return button.deleteReply(msg).catch(() => {})
        const choice = confs.stations.filter(x => x.name.toLowerCase().includes(reply.content.toLowerCase()) || reply.content.toLowerCase().includes(x.name.toLowerCase()))

        if (choice.length === 0) {
            button.editReply({
                content: `No station found`
            }).catch(() => {});
            setTimeout(() => {
                button.deleteReply(msg).catch(() => {});
            }, 5000);
            return;
        };
        let url: string;
        if (choice.length > 1) {
            await button.editReply({
                content: `Few stations have been found. Wich one is the correct ?`,
                components: [
                    row<StringSelectMenuBuilder>(new StringSelectMenuBuilder()
                        .setCustomId('selector')
                        .setMaxValues(1)
                        .setPlaceholder('Choose the correct one')
                        .setOptions(
                            choice.map(x => ({ label: resizeStr(x.name), emoji: x.emoji, value: x.url }))
                        )
                    )
                ]
            }).catch(() => {});
            const ctx = await waitForInteraction({
                componentType: ComponentType.StringSelect,
                message: msg,
                user
            }).catch(() => {});
            if (!ctx) {
                button.editReply({
                    content: `Canceled`,
                    components: []
                }).catch(() => {});
                setTimeout(() => {
                    button.deleteReply(msg).catch(() => {});
                }, 5000);
                return;
            }
            url = ctx.values[0];
            await ctx.deferUpdate().catch(() => {});
        } else {
            url = choice[0].url;
        }

        const station = getStationByUrl(url);
        await button.editReply({
            content: `Are you sure to delete [${station.emoji} ${station.name}](${station.url}) ?`,
            components: [
                row(
                    new ButtonBuilder()
                        .setLabel('Yes')
                        .setStyle(ButtonStyle.Success)
                        .setCustomId('yes'),
                    new ButtonBuilder()
                        .setLabel('No')
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId('no')
                )
            ]
        }).catch(() => {});
        const confirm = await waitForInteraction({
            componentType: ComponentType.Button,
            user,
            message: msg
        }).catch(() => {});
        if (!confirm || confirm.customId === 'no') {
            button.editReply({
                content: `Canceled`,
                components: []
            }).catch(() => {})
            setTimeout(() => {
                button.deleteReply(msg).catch(() => {})
            }, 5000);
            return
        }
        await button.editReply({
            content: `Deleting [${station.emoji} ${station.name}](${station.url})`,
            components: []
        }).catch(() => {});
        confs.stations.splice(confs.stations.indexOf(station), 1);
        writeFileSync('./dist/utils/configs.json', JSON.stringify(confs, null, 4));

        button.editReply({
            content: `${boolEmojis(true)} ${station.name} deleted`
        }).catch(() => {})
        setTimeout(() => {
            button.deleteReply(msg).catch(() => {});
        }, 5000);
    })