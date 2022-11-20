export type stationType = 'playlist' | 'station' | 'get a random station';

export type station = {
    type: stationType;
    name: string;
    emoji: string;
    url: string;
}