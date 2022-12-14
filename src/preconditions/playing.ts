import { Precondition } from 'amethystjs';

export default new Precondition('playing').setChatInputRun(({ interaction }) => {
    if (interaction.replied || interaction.deferred)
        return { ok: false, message: 'Already handled', isChatInput: true, interaction };
    const queue = interaction.client.player.getQueue(interaction.guild);
    if (!interaction.guild || !interaction.guild.members.me?.voice?.channel || !queue || !queue.playing) {
        return {
            ok: false,
            message: 'Not playing',
            isChatInput: true,
            interaction,
            metadata: {
                message: ":x: | I'm not playing music"
            }
        };
    }
    return {
        ok: true,
        isChatInput: true,
        interaction
    };
});
