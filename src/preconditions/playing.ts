import { Precondition } from 'amethystjs';

export default new Precondition('playing').setChatInputRun(({ interaction }) => {
    if (interaction.replied || interaction.deferred)
        return { ok: false, message: 'Already handled', isChatInput: true, interaction };
    const queue = interaction.client.player.nodes.get(interaction.guild);
    if (!interaction.guild || !interaction.guild.members.me?.voice?.channel || !queue || !queue.isPlaying()) {
        return {
            ok: false,
            message: 'Not playing',
            isChatInput: true,
            interaction,
            metadata: {
                message: interaction.client.langs.getText(interaction, 'preconditions', 'playing')
            }
        };
    }
    return {
        ok: true,
        isChatInput: true,
        interaction
    };
});
