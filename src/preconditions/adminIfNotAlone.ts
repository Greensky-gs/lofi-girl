import { Precondition } from 'amethystjs';
import { GuildMember, VoiceChannel } from 'discord.js';
import { isUserAlone } from '../utils/functions';

export default new Precondition('adminIfNotAlone').setChatInputRun(({ interaction }) => {
    const channel = (interaction.member as GuildMember).voice.channel as VoiceChannel;

    if (!isUserAlone(channel) && !(interaction.member as GuildMember).permissions.has('Administrator')) {
        return {
            ok: false,
            metadata: {
                message: ":x: | Since you're not alone, you need the `administrator` permission to run this command"
            },
            isChatInput: true,
            interaction
        };
    }
    return {
        ok: true,
        isChatInput: true,
        interaction
    };
});
