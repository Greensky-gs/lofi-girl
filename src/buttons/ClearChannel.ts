import { ButtonHandler } from "amethystjs";
import { PanelIds } from "../typings/bot";
import botOwner from "../preconditions/botOwner";
import { Collection, Message, TextChannel } from "discord.js";

export default new ButtonHandler({
    customId: PanelIds.ClearChannel,
    preconditions: [botOwner]
}).setRun(async({ message, button }) => {
    button.deferUpdate().catch(() => {});
    const msgs = (await message.channel.messages.fetch().catch(() => {}));
    
    if (msgs) (message.channel as TextChannel).bulkDelete((msgs as Collection<string, Message<true>>).filter(x => !x.pinned)).catch(() => {});
})