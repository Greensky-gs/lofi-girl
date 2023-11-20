import { Precondition } from 'amethystjs';
import { GuildMember, VoiceChannel } from 'discord.js';
import { isLofIManager, isUserAlone } from '../utils/functions';

export default new Precondition('adminIfNotAlone').setChatInputRun(({ interaction }) => {
    const channel = (interaction.member as GuildMember).voice.channel as VoiceChannel;

    if (!isUserAlone(channel) && !(interaction.member as GuildMember).permissions.has('Administrator') && !isLofIManager(interaction.member as GuildMember)) {
        return {
            ok: false,
            metadata: {
                message: interaction.client.langs.getText(interaction, 'preconditions', 'adminIfNotAlone')
            },
            type: 'chatInput',
            interaction
        };
    }
    return {
        ok: true,
        type: 'chatInput',
        interaction
    };
});
