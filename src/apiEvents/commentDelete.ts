import { ApiEvent } from '../structures/APIEvent';
import confs from '../utils/configs.json';
import { writeFileSync } from 'node:fs';
import { getStationByUrl } from '../utils/functions';

export default new ApiEvent('commentDelete', (change) => {
    const station = getStationByUrl(change.url, false);
    if (!station) return;

    station.feedbacks = station.feedbacks.filter((x) => x.user_id !== change.userId);

    confs.stations = confs.stations.map((x) => (x.url === station.url ? station : x));

    writeFileSync('./dist/utils/configs.json', JSON.stringify(confs, null, 4));
});
