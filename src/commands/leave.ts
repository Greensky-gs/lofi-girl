import { AmethystCommand, preconditions } from 'amethystjs';
import adminIfNotAlone from '../preconditions/adminIfNotAlone';
import connected from '../preconditions/connected';
import playing from '../preconditions/playing';

export default new AmethystCommand({
    name: 'leave',
    description: 'Leave the voice channel',
    preconditions: [preconditions.GuildOnly, connected, playing, adminIfNotAlone]
}).setChatInputRun(({ interaction }) => {
    interaction.client.player.getQueue(interaction.guild).destroy(true);
    interaction.reply(`🎧 | I left the voice channel`).catch(() => {});
});
