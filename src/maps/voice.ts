import { AudioPlayer, AudioResource, VoiceConnection } from '@discordjs/voice';
import { Collection } from 'discord.js';

export default new Collection<string, { player: AudioPlayer; connection: VoiceConnection; ressource: AudioResource, url: string }>();
