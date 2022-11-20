import { Precondition } from 'amethystjs';
import { GuildMember } from 'discord.js';

export default new Precondition('inVoiceChannel').setChatInputRun(({ interaction }) => {
    if (interaction.replied || interaction.deferred)
        return { ok: false, message: 'Already handled', isChatInput: true, interaction };
    if (!interaction.guild)
        return {
            ok: false,
            message: 'Not connected to a voice channel',
            isChatInput: true,
            interaction,
            metadata: {
                message: 'You are not connected to a voice channel'
            }
        };
    if (!(interaction.member as GuildMember).voice?.channel)
        return {
            ok: false,
            message: 'Not connected to a voice channel',
            isChatInput: true,
            interaction,
            metadata: {
                message: 'You are not connected to a voice channel'
            }
        };
    return {
        ok: true,
        isChatInput: true,
        interaction
    };
});
