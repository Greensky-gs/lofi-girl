import { AmethystEvent } from 'amethystjs';
import { ActivityOptions, ActivityType } from 'discord.js';
import { station } from '../typings/station';
import { stations, recommendation } from '../utils/configs.json';

export default new AmethystEvent('ready', async(client) => {
    const statuses: (() => Promise<ActivityOptions>)[] = [
        async() => {
            return {
                name: "Lofi music",
                type: ActivityType.Listening,
                url: 'https://youtube.com/c/LofiGirl'
            }
        },
        async() => {
            await client.guilds.fetch();
            return {
                name: `${client.guilds.cache.size} servers`,
                type: ActivityType.Listening
            }
        },
        async() => {
            return {
                name: `${stations.length} musics`,
                type: ActivityType.Listening
            }
        },
        async() => {
            if (Object.keys(recommendation).length > 0) {
                return {
                    name: `${(recommendation as station).emoji} ${(recommendation as station).name}`,
                    type: ActivityType.Listening,
                    url: (recommendation as station).url
                }
            } else {
                return {
                    name: `music in ${client.player.queues.size} servers`,
                    type: ActivityType.Playing
                }
            }
        }
    ]
    let index = 0;
    client.user.setActivity(await statuses[index]());
    index++;

    setInterval(async() => {
        index++;
        client.user.setActivity(await statuses[index % statuses.length]());
    }, 20000);
})