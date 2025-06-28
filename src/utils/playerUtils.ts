import { AudioPlayer, AudioPlayerState, AudioPlayerStatus, createAudioResource, StreamType } from "@discordjs/voice";
import { players, playlists } from "../cache/players";
import { stationType } from "../typings/firebase";
import { database } from "../cache/db";
import { getStream } from "firebase/storage";
import { getRandomStation } from "./functions";

export const buildResource = (object: stationType<false>) => {
    const audioRef = database.audioRef(object.id);
    
    const audioStream = getStream(audioRef)
    return createAudioResource(audioStream as any, {
        inputType: StreamType.Arbitrary,
        metadata: {
            title: object.title
        }
    })
}
export const stateChange = (player: AudioPlayer, before: AudioPlayerState, after: AudioPlayerState, guildId: string) => {
    const data = players.get(guildId);
    const playlist = playlists.get(guildId) ?? [];

    if (!data) return;
    if (before.status === AudioPlayerStatus.Playing && after.status === AudioPlayerStatus.Idle) {
        if (!data.looping && playlist.length === 0) {
            player.stop();

            data.connection.destroy();
            players.delete(guildId)
        } else if (playlist.length > 0) {
            const nextTrack = playlist.shift()
            playlists.set(guildId, playlist);

            const res = buildResource(nextTrack);

            data.currentTrack = nextTrack;
            data.startedAt = Date.now()
            player.play(res);

            players.set(guildId, data);
        } else {
            const nextTrack = getRandomStation();
            const res = buildResource(nextTrack);

            data.startedAt = Date.now()
            data.currentTrack = nextTrack;

            player.play(res);
            players.set(guildId, data);
        }
    }
}