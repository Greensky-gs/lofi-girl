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
    if (
        !(interaction.member as GuildMember).voice?.channel &&
        interaction.client.player.getQueue(interaction.guild) &&
        interaction.guild.members.me?.voice?.channel?.members?.filter((x) => !x.user.bot).size === 0
    )
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
