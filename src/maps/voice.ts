import { AudioPlayer, AudioResource, VoiceConnection } from '@discordjs/voice';
import { Collection, VoiceBasedChannel } from 'discord.js';

export default new Collection<
    string,
    {
        player: AudioPlayer;
        connection: VoiceConnection;
        ressource: AudioResource;
        url: string;
        channel: VoiceBasedChannel;
    }
>();
