import { ButtonHandler, waitForInteraction } from 'amethystjs';
import { PanelIds } from '../typings/bot';
import botOwner from '../preconditions/botOwner';
import {
    ComponentType,
    Message,
    ModalBuilder,
    StringSelectMenuBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js';
import { getRandomStation, getStationByUrl, resizeStr, row } from '../utils/functions';
import configs from '../utils/configs.json';
import { writeFileSync } from 'fs';

export default new ButtonHandler({
    customId: PanelIds.Recommendation,
    preconditions: [botOwner]
}).setRun(async ({ button, message, user }) => {
    const random = getRandomStation();
    await button
        .showModal(
            new ModalBuilder()
                .setTitle('Recommendation')
                .setComponents(
                    row<TextInputBuilder>(
                        new TextInputBuilder()
                            .setLabel('Station name')
                            .setPlaceholder(resizeStr(`${random.emoji} ${random.name}`))
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                            .setCustomId('stationName')
                    )
                )
                .setCustomId('recommendation')
        )
        .catch(() => {});
    const modal = await button
        .awaitModalSubmit({
            time: 60000
        })
        .catch(() => {});
    if (!modal) return;
    const stationName = modal.fields.getTextInputValue('stationName').toLowerCase();

    const stations = configs.stations.filter(
        (x) => x.name.toLowerCase().includes(stationName) || stationName.toLowerCase().includes(x.name)
    );
    if (stations.length === 0) {
        modal
            .reply({
                content: `:x: | No station found`
            })
            .catch(() => {});
        setTimeout(() => {
            modal.deleteReply().catch(() => {});
        }, 5000);
        return;
    }
    const msg = (await modal
        .deferReply({
            fetchReply: true
        })
        .catch(() => {})) as Message<true>;
    if (stations.length > 1) {
        await modal
            .editReply({
                content: `I found **${stations.length}** matching stations. Please choose the correct one`,
                components: [
                    row<StringSelectMenuBuilder>(
                        new StringSelectMenuBuilder()
                            .setPlaceholder('Choose the correct station here')
                            .setMaxValues(1)
                            .setOptions(
                                ...[
                                    ...stations
                                        .splice(0, 24)
                                        .map((st) => ({
                                            label: st.name,
                                            emoji: st.emoji,
                                            value: st.url,
                                            description: `Station ${resizeStr(st.name, 80)}`
                                        })),
                                    {
                                        label: 'Cancel',
                                        value: 'cancel',
                                        description: 'Cancel the selection',
                                        emoji: '❌'
                                    }
                                ]
                            )
                            .setCustomId('recommendation-selection')
                    )
                ]
            })
            .catch(() => {});
        const selection = await waitForInteraction({
            componentType: ComponentType.StringSelect,
            user,
            message: msg
        }).catch(() => {});
        if (!selection || selection.values[0] === 'cancel') {
            modal
                .editReply({
                    content: `:x: | Canceled`,
                    components: []
                })
                .catch(() => {});
            return setTimeout(() => {
                modal.deleteReply().catch(() => {});
            }, 5000);
        }
        const station = getStationByUrl(selection.values[0]);
        stations.splice(0);
        stations.push(station);
    }

    const station = stations[0];
    modal
        .editReply({
            content: `❤️ | [${station.emoji} ${station.name}](<${station.url}>) set as the recommendation of the day`,
            components: []
        })
        .catch(() => {});
    setTimeout(() => {
        modal.deleteReply().catch(() => {});
    }, 5000);

    configs.recommendation = station;
    writeFileSync('./dist/utils/configs.json', JSON.stringify(configs, null, 4));
});
