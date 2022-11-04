import tracks from '../maps/tracks';
import voice from '../maps/voice';
import { LofiCommand } from '../structures/Command';
import { getQueue } from '../utils/functions';

export default new LofiCommand({
    name: 'leave',
    description: 'Disconnect voice channel',
    admin: true,
    cooldown: 5,
    dm: false,
    execute: async ({ interaction }) => {
        const queue = getQueue(interaction.guild.id);
        if (!queue) return interaction.reply(`:x: | I'm not playing music in a channel`);

        queue.connection.disconnect();
        voice.delete(interaction.guild.id);
        if (tracks.has(interaction.guild.id)) tracks.delete(interaction.guild.id);

        interaction.reply(`🎧 | Disconnected from voice channel`).catch(() => {});
    }
});
