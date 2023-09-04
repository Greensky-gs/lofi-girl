import { Precondition } from 'amethystjs';
import { GuildMember } from 'discord.js';

export default new Precondition('inVoiceChannel').setChatInputRun(({ interaction }) => {
    if (interaction.replied || interaction.deferred)
        return { ok: false, message: 'Already handled', type: 'chatInput', interaction };
    if (!interaction.guild)
        return {
            ok: false,
            message: 'Not connected to a voice channel',
            type: 'chatInput',
            interaction,
            metadata: {
                message: interaction.client.langs.getText(interaction, 'preconditions', 'connected')
            }
        };
    if (
        !(interaction.member as GuildMember).voice?.channel ||
        (interaction.client.player.nodes.get(interaction.guild) &&
            interaction.guild.members.me?.voice?.channel?.members?.filter((x) => x.user.id === interaction.user.id)
                .size === 0)
    )
        return {
            ok: false,
            message: 'Not connected to a voice channel',
            type: 'chatInput',
            interaction,
            metadata: {
                message: interaction.client.langs.getText(interaction, 'preconditions', 'connected')
            }
        };
    return {
        ok: true,
        type: 'chatInput',
        interaction
    };
});
