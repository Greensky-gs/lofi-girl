import { AmethystCommand } from "amethystjs";
import { AttachmentBuilder } from "discord.js";
import deleteCommand from "../preconditions/deleteCommand";

export default new AmethystCommand({
    name: 'configfile',
    aliases: ['configsfile', 'config-file', 'configs-file'],
    description: "Get the config file",
    preconditions: [deleteCommand]
})
.setMessageRun(({ message }) => {
    if (message.author.id !== process.env.botOwner) return;

    message.author.send({
        files: [
            new AttachmentBuilder(`./${__filename.endsWith('.ts') ? 'src' : 'dist'}/utils/configs.json`)
                .setName(`configs.json`)
                .setDescription(`Config file`)
        ],
        content: `Here is the config.json file`
    }).catch(() => {});
})