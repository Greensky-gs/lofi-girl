import { AutocompleteListener } from "amethystjs";
import { station } from "../typings/station";
import stations from '../utils/configs.json';

module.exports = new AutocompleteListener({
    commandName: ['info', 'play', 'switch'],
    run: ({ options }) => {
        const name = options.getFocused().toLowerCase();
        const list: station[] = (stations.stations as station[]).concat({ name: 'random', type: 'get a random station', url: 'random', emoji: '🎲' }).filter(x => name.includes(x.emoji) || name.includes(x.name) || x.name.toLowerCase().includes(name) || x.type.toLowerCase().includes(name) || name.includes(x.type.toLowerCase()));

        if (list.length <= 25) return list.map((x) => ({ name: `${x.emoji} ${x.name} - ${x.type}`, value: x.url }));
        // Here we randomise the result

        const returned: station[] = [];

        for (let i = 0; i < 25; i++) {
            const available = list.filter(x => !returned.includes(x));
            returned.push(available[Math.floor(Math.random() * available.length)]);
        }
        return returned.map(x => ({ name: `${x.emoji} ${x.name} - ${x.type}`, value: x.url }));
    }
})