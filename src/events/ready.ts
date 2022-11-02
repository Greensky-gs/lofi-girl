import { ActivityOptions, ActivityType } from 'discord.js';
import { LofiEvent } from '../structures/Event';
import { stations } from '../utils/configs.json';

export default new LofiEvent('ready', (c) => {
    console.log(`Logged as ${c.user.tag}`);

    type st = () => Promise<ActivityOptions>;
    const statuses: st[] = [
        async () => {
            return {
                name: `${stations.length} musics`,
                type: ActivityType.Listening
            };
        },
        async () => {
            await c.guilds.fetch();
            return {
                name: `${c.guilds.cache.size} servers`,
                type: ActivityType.Listening
            };
        },
        async () => {
            return {
                name: 'Lofi music',
                type: ActivityType.Listening,
                url: 'https://youtube.com/c/LofiGirl'
            };
        }
    ];
    let index = 0;
    const setPresence = async () => {
        c.user.setActivity(await statuses[index % 3]());
    };
    setPresence();
    setInterval(async () => {
        index++;
        setPresence();
    }, 20000);
});
