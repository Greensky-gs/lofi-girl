import voice from '../maps/voice';
import { LofiCommand } from '../structures/Command';

export default new LofiCommand({
    name: 'leave',
    description: 'Disconnect voice channel',
    admin: true,
    cooldown: 5,
    dm: false,
    execute: async ({ interaction }) => {
        const queue = interaction.client.player.getQueue(interaction.guild);
        const v = voice.get(interaction.guild.id);
        if (!queue && !v) return interaction.reply(`:x: | I'm actually not connected to a voice channel`);

        if (queue) {
            queue.destroy(true);
        } else {
            v.connection.destroy();
            voice.delete(interaction.guild.id);
        }

        interaction.reply(`:white_check_mark: | Disconnected from voice channel`).catch(() => {});
    }
});
