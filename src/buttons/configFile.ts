import { ButtonHandler } from "amethystjs";
import { PanelIds } from "../typings/bot";
import botOwner from "../preconditions/botOwner";
import { AttachmentBuilder } from "discord.js";

export default new ButtonHandler({
    customId: PanelIds.ConfigFile,
    preconditions: [botOwner]
}).setRun(({ button }) => {
    const file = new AttachmentBuilder('./dist/utils/configs.json')
        .setName('configs.json')
        .setDescription("Config file")
    
    if (!file) return button.reply({
        content: "❌ | An error occured when fetching the config file",
        ephemeral: true
    }).catch(() => {});

    button.reply({
        content: "Here is the config file",
        files: [ file ],
        ephemeral: true
    }).catch((error) => {
        button[button.replied ? 'editReply' : 'reply']({
            ephemeral: true,
            content: `An error occured while sending the file. This is probably because the file is too big to be sent.\n\`\`\`${JSON.stringify(error, null, 4)}\`\`\``
        }).catch(() => {});
    })
})