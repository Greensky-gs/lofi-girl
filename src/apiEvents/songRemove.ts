import { writeFileSync } from "node:fs";
import { ApiEvent } from "../structures/APIEvent";
import confs from '../utils/configs.json'

export default new ApiEvent('stationRemove', (change) => {
    writeFileSync('./dist/utils/configs.json', JSON.stringify({ ...confs, stations: confs.stations.filter(x => x.url !== change.url) }, null, 4))
})