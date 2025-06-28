import { Precondition } from 'amethystjs';
import { players } from '../cache/players';

export default new Precondition('playing').setChatInputRun(({ interaction }) => {
    if (interaction.replied || interaction.deferred)
        return { ok: false, message: 'Already handled', type: 'chatInput', interaction };
    const queue = players.has(interaction.guild.id);
    if (!interaction.guild || !interaction.guild.members.me?.voice?.channel || !queue) {
        return {
            ok: false,
            message: 'Not playing',
            type: 'chatInput',
            interaction,
            metadata: {
                message: interaction.client.langs.getText(interaction, 'preconditions', 'playing')
            }
        };
    }
    return {
        ok: true,
        type: 'chatInput',
        interaction
    };
});
