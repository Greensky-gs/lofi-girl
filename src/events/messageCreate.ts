import { AttachmentBuilder } from 'discord.js';
import { LofiCommand } from '../structures/Command';
import { LofiEvent } from '../structures/Event';

export default new LofiEvent('messageCreate', (message) => {
    if (message.author.id !== process.env.botOwner || message.author.bot || message.webhookId) return;
    if (message.mentions.users.has(message.client.user.id)) {
        message.author
            .send({
                files: [
                    new AttachmentBuilder(`./${__filename.endsWith('.ts') ? 'src' : 'dist'}/utils/configs.json`)
                        .setName(`configs.json`)
                        .setDescription(`Config file`)
                ],
                content: `Here is the config.json file`
            })
            .catch(console.log);
    }
});
