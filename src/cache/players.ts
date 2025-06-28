import { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import { stationType } from "../typings/firebase";

export const players: Map<string, {
    player: AudioPlayer;
    connection: VoiceConnection;
    looping: boolean;
    currentTrack: stationType<false>;
    paused: boolean;
    user: string;
    startedAt: number;
}> = new Map();
export const playlists: Map<string, stationType<false>[]> = new Map();