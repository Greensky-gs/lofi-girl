import { Precondition } from 'amethystjs';

export default new Precondition('playing').setChatInputRun(({ interaction }) => {
    if (interaction.replied || interaction.deferred)
        return { ok: false, message: 'Already handled', type: 'chatInput', interaction };
    const queue = interaction.client.player.nodes.get(interaction.guild);
    if (!interaction.guild || !interaction.guild.members.me?.voice?.channel || !queue || !queue.isPlaying()) {
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
