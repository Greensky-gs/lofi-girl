export type stationType = 'playlist' | 'station' | 'get a random station' | 'get the recommendation of the day';

export type feedback = {
    user_id: string;
    keywords: string[];
    comments: string;
};
export type station = {
    type: stationType;
    name: string;
    emoji: string;
    url: string;
    feedbacks: feedback[];
};
