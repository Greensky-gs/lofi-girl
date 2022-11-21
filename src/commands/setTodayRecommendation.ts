import { AmethystCommand } from "amethystjs";
import { getStationByUrl } from "../utils/functions";
import configs from '../utils/configs.json';
import { station } from "../typings/station";
import { writeFileSync } from "fs";

export default new AmethystCommand({
    name: 'recommendation',
    description: "Set the today recommendation",
    cooldown: 0
})
.setMessageRun(({ message, options }) => {
    if (message.author.id !== process.env.botOwner) return;

    if (options.emptyArgs) return message.channel.send(`:x: | Please provide a video url`)
    const station = getStationByUrl(options.first, false);

    const randomised = getStationByUrl('random');
    if (!station) return message.channel.send(`:x: | This station doesn't exist. Take for exemple this : [${randomised.emoji} ${randomised.name}](<${station.url}>)`);

    if ((configs.recommendation as station)?.url === station.url && options.second !== '-f') {
        return message.channel.send(`:x: | This is the recommendation of the day. Use \`${message.client.configs.prefix}recommendation <station url> -f\` to set it anyway`);
    }

    configs.recommendation = station;
    writeFileSync(`./dist/utils/configs.json`, JSON.stringify(configs, null, 4));

    message.channel.send(`Set [${station.emoji} ${station.name}](<${station.url}>) as the recommendation of the day`)
})