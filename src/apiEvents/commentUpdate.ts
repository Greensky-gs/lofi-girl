import { writeFileSync } from "fs";
import { ApiEvent } from "../structures/APIEvent";
import confs from '../utils/configs.json'
import { getStationByUrl } from "../utils/functions";

export default new ApiEvent('commentUpdate', (change) => {
    const station = getStationByUrl(change.url, false);
    if (!station) return

    station.feedbacks.find(x => x.user_id == change.comment.userId)
    ? station.feedbacks = station.feedbacks.map(x => x.user_id === change.comment.userId ? { ...x, comments: change.comment.comment, keywords: change.comment.keywords } : x)
    : station.feedbacks.push({
        user_id: change.comment.userId,
        comments: change.comment.comment,
        keywords: change.comment.keywords
    });

    confs.stations = confs.stations.map(x => x.url === station.url ? station : x)

    writeFileSync('./dist/utils/configs.json', JSON.stringify(confs, null, 4))
})