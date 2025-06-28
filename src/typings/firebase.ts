import { If } from "./core"
import { stationTracks } from "./station";

export type stationType<Raw extends boolean = boolean> = {
    authors: If<Raw, string, string[]>;
    beats: string;
    id: string;
    img: string;
    title: string;
    tracks: If<Raw, string, stationTracks>;
    url: string;
} & (Raw extends true ? {} : {
    emoji: string;
})