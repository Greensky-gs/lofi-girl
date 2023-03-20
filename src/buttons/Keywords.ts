import { ButtonHandler, waitForInteraction } from 'amethystjs';
import isTester from '../preconditions/isTester';
import { TesterButtons } from '../typings/tester';
import { getStationByUrl, row } from '../utils/functions';
import { ButtonBuilder, ComponentType, EmbedBuilder, Message, StringSelectMenuBuilder } from 'discord.js';
import { testKeywords } from '../utils/configs.json';

export default new ButtonHandler({
    preconditions: [isTester],
    customId: TesterButtons.KeywordsButton
}).setRun(async ({ button, message, user }) => {
    const station = getStationByUrl(message.embeds[0].url);
    const embed = new EmbedBuilder(message.embeds[0]);
    const buttons = message.components[0].components.map((x) => new ButtonBuilder(x.toJSON()));

    await message
        .edit({
            components: [row(...buttons.map((x) => x.setDisabled(true)))]
        })
        .catch(() => {});
    const msg = (await button
        .reply({
            components: [
                row<StringSelectMenuBuilder>(
                    new StringSelectMenuBuilder()
                        .setMaxValues(1)
                        .setMaxValues(testKeywords.length)
                        .setPlaceholder('Keywords to select')
                        .setCustomId(TesterButtons.KeyworkdsSelector)
                        .setOptions(
                            testKeywords.map((k) => ({
                                label: k[0].toUpperCase() + k.slice(1),
                                description: button.client.langs.getText(button, 'keywords', 'addKKeyword', { keyword: k }),
                                value: k
                            }))
                        )
                )
            ],
            fetchReply: true,
            ephemeral: true
        })
        .catch(() => {})) as Message<true>;

    const reply = await waitForInteraction({
        componentType: ComponentType.StringSelect,
        message: msg,
        user,
        whoCanReact: 'useronly',
        replies: {
            everyone: {
                content: button.client.langs.getText(button, 'utils', 'notAllowedToInteract'),
                ephemeral: true
            }
        }
    }).catch(() => {});

    if (!reply) {
        msg?.delete().catch(() => {});
        message
            .edit({
                components: [row(...buttons.map((x) => x.setDisabled(false)))]
            })
            .catch(() => {});
        return;
    }

    const keywords = reply.values;
    embed.spliceFields(0, 1, {
        name: button.client.langs.getText(button, 'keywords', 'fieldName'),
        value: keywords.join(' '),
        inline: true
    });

    reply.deferUpdate().catch(() => {});
    msg?.delete().catch(() => {});
    message
        .edit({
            embeds: [embed],
            components: [row(...buttons.map((x) => x.setDisabled(false)))]
        })
        .catch(() => {});
});
