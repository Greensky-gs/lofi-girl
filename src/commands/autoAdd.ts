import { AmethystCommand, preconditions } from 'amethystjs';
import adminIfNotAlone from '../preconditions/adminIfNotAlone';
import connected from '../preconditions/connected';
import playing from '../preconditions/playing';
import { getLoopState, setLoopState } from '../utils/functions';

export default new AmethystCommand({
    name: 'autoadd',
    description: 'Toggle auto music adding at the end of a music',
    preconditions: [preconditions.GuildOnly, connected, playing, adminIfNotAlone]
}).setChatInputRun(({ interaction }) => {
    const state = !getLoopState(interaction.guild.id);
    setLoopState(interaction.guild.id, state);

    interaction.reply(`🎧 | The loop has been **${state ? 'enabled' : 'disabled'}**`);
});
