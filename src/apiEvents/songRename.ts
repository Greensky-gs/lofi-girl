import { ApiEvent } from "../structures/APIEvent";
import confs from '../utils/configs.json'
import { getStationByUrl } from "../utils/functions";
import { writeFileSync } from 'node:fs'

export default new ApiEvent('stationRename', (change) => {
    const station = getStationByUrl(change.url, false);
    if (!station) return;

    writeFileSync('./dist/utils/configs.json', JSON.stringify(confs.stations.map(x => x.url === change.url ? { ...x, name: change.name } : x), null, 4))
})