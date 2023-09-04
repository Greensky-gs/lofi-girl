import { writeFileSync } from 'node:fs';
import { ApiEvent } from '../structures/APIEvent';
import confs from '../utils/configs.json';
import { getStationByUrl } from '../utils/functions';

export default new ApiEvent('stationAdd', (change) => {
    if (!!getStationByUrl(change.url, false)) return;
    confs.stations.push({
        name: change.name,
        emoji: change.emoji,
        url: change.url,
        type: change.type,
        feedbacks: []
    });

    writeFileSync('./dist/utils/configs', JSON.stringify(confs, null, 4));
});
