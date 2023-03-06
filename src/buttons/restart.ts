import { ButtonHandler, waitForInteraction } from 'amethystjs';
import { PanelIds } from '../typings/bot';
import botOwner from '../preconditions/botOwner';
import { ButtonBuilder, ButtonStyle, ComponentType, Message } from 'discord.js';
import { row } from '../utils/functions';

export default new ButtonHandler({
    customId: PanelIds.Reboot,
    preconditions: [botOwner]
}).setRun(async ({ button }) => {
    const msg = (await button
        .reply({
            fetchReply: true,
            content: `Reboot <t:${((Date.now() + 10000) / 1000).toFixed(0)}:R>.`,
            components: [
                row(new ButtonBuilder()
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId('cancel-reboot')
                )
            ]
        })
        .catch(() => {})) as Message<true>;
    const cancel = await waitForInteraction({
        user: button.user,
        time: 10000,
        message: msg,
        componentType: ComponentType.Button
    }).catch(() => {});

    if (!cancel) {
        await msg.delete().catch(() => {});
        process.exit();
    } else {
        msg.delete().catch(() => {});
    }
});
