import { ButtonHandler, waitForInteraction, waitForMessage } from 'amethystjs';
import { PanelIds } from '../typings/bot';
import botOwner from '../preconditions/botOwner';
import {
    Message,
    StringSelectMenuBuilder,
    TextChannel,
    ComponentType,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js';
import confs from '../utils/configs.json';
import { boolEmojis, getRandomStation, getStationByUrl, resizeStr, row } from '../utils/functions';
import { writeFileSync } from 'fs';

export default new ButtonHandler({
    customId: PanelIds.RemoveStation,
    preconditions: [botOwner]
}).setRun(async ({ button, message, user }) => {
    const random = getRandomStation();
    await button.showModal(
        new ModalBuilder()
            .setTitle('Station name')
            .setCustomId('stationName')
            .setComponents(
                row<TextInputBuilder>(
                    new TextInputBuilder()
                        .setLabel('Name')
                        .setCustomId('stationName')
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder(resizeStr(`${random.emoji} ${random.name}`))
                )
            )
    );
    const stationName = await button
        .awaitModalSubmit({
            time: 60000
        })
        .catch(() => {});
    if (!stationName) return;

    const choice = confs.stations.filter(
        (x) =>
            x.name.toLowerCase().includes(stationName.fields.getTextInputValue('stationName').toLowerCase()) ||
            stationName.fields.getTextInputValue('stationName').toLowerCase().includes(x.name.toLowerCase())
    );

    const msg = (await stationName
        .deferReply({
            fetchReply: true
        })
        .catch(() => {})) as Message<true>;
    if (choice.length === 0) {
        stationName
            .editReply({
                content: `No station found`
            })
            .catch(() => {});
        setTimeout(() => {
            stationName.deleteReply(msg).catch(() => {});
        }, 5000);
        return;
    }
    let url: string;
    if (choice.length > 1) {
        await stationName
            .editReply({
                content: `Few stations have been found. Wich one is the correct ?`,
                components: [
                    row<StringSelectMenuBuilder>(
                        new StringSelectMenuBuilder()
                            .setCustomId('selector')
                            .setMaxValues(1)
                            .setPlaceholder('Choose the correct one')
                            .setOptions(choice.map((x) => ({ label: resizeStr(x.name), emoji: x.emoji, value: x.url })))
                    )
                ]
            })
            .catch(() => {});
        const ctx = await waitForInteraction({
            componentType: ComponentType.StringSelect,
            message: msg,
            user
        }).catch(() => {});
        if (!ctx) {
            stationName
                .editReply({
                    content: `Canceled`,
                    components: []
                })
                .catch(() => {});
            setTimeout(() => {
                stationName.deleteReply(msg).catch(() => {});
            }, 5000);
            return;
        }
        url = ctx.values[0];
        await ctx.deferUpdate().catch(() => {});
    } else {
        url = choice[0].url;
    }

    const station = getStationByUrl(url);
    await stationName
        .editReply({
            content: `Are you sure to delete [${station.emoji} ${station.name}](${station.url}) ?`,
            components: [
                row(
                    new ButtonBuilder().setLabel('Yes').setStyle(ButtonStyle.Success).setCustomId('yes'),
                    new ButtonBuilder().setLabel('No').setStyle(ButtonStyle.Danger).setCustomId('no')
                )
            ]
        })
        .catch(() => {});
    const confirm = await waitForInteraction({
        componentType: ComponentType.Button,
        user,
        message: msg
    }).catch(() => {});
    if (!confirm || confirm.customId === 'no') {
        stationName
            .editReply({
                content: `Canceled`,
                components: []
            })
            .catch(() => {});
        setTimeout(() => {
            stationName.deleteReply(msg).catch(() => {});
        }, 5000);
        return;
    }
    await stationName
        .editReply({
            content: `Deleting [${station.emoji} ${station.name}](${station.url})`,
            components: []
        })
        .catch(() => {});
    confs.stations.splice(confs.stations.indexOf(station), 1);
    writeFileSync('./dist/utils/configs.json', JSON.stringify(confs, null, 4));

    stationName
        .editReply({
            content: `${boolEmojis(true)} ${station.name} deleted`
        })
        .catch(() => {});
    setTimeout(() => {
        stationName.deleteReply(msg).catch(() => {});
    }, 5000);
});
