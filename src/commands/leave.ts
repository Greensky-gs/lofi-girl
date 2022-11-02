import { LofiCommand } from '../structures/Command';

export default new LofiCommand({
    name: 'leave',
    description: 'Disconnect voice channel',
    admin: true,
    cooldown: 5,
    dm: false,
    execute: async ({ interaction }) => {
        const queue = interaction.client.player.getQueue(interaction.guild);
        if (!queue) return interaction.reply(`:x: | I'm actually not connected to a voice channel`);

        queue.destroy(true);
        interaction.reply(`:white_check_mark: | Disconnected from voice channel`).catch(() => {});
    }
});
