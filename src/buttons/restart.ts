import { ButtonHandler, waitForMessage } from "amethystjs";
import { PanelIds } from "../typings/bot";
import botOwner from "../preconditions/botOwner";
import { Message, TextChannel } from "discord.js";

export default new ButtonHandler({
    customId: PanelIds.Reboot,
    preconditions: [botOwner]
}).setRun(async({ button }) => {
    const msg = await button.reply({
        fetchReply: true,
        content: `Reboot <t:${((Date.now() + 10000) / 1000).toFixed(0)}:R>.\nType \`cancel\` to cancel`
    }).catch(() => {}) as Message<true>;
    const cancel = await waitForMessage({
        channel: button.channel as TextChannel,
        user: button.user,
        time: 10000
    }).catch(() => {});

    if (!cancel || cancel.content.toLowerCase() !== 'cancel') {
        await msg.delete().catch(() => {});
        process.exit();
    } else {
        msg.delete().catch(() => {});
        cancel.delete().catch(() => {});
    }
})