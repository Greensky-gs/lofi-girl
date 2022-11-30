import { Precondition } from 'amethystjs';
import { GuildMember } from 'discord.js';

export default new Precondition('connectedSameChannel').setChatInputRun(({ interaction }) => {
    if (interaction.guild?.members?.me?.voice?.channel?.id !== (interaction.member as GuildMember).voice?.channel?.id)
        return {
            ok: false,
            message: 'User not connected in the same channel than the bot',
            metadata: {
                message: 'You are not connected in the same channel than me'
            },
            isChatInput: true,
            interaction
        };
    return {
        ok: true,
        isChatInput: true,
        interaction
    };
});
