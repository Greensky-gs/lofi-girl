export type stationType = 'playlist' | 'station' | 'get a random station' | 'get the recommendation of the day';

export type station = {
    type: stationType;
    name: string;
    emoji: string;
    url: string;
};
