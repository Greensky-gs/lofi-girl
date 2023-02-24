import { AutocompleteListener } from 'amethystjs';
import { station } from '../typings/station';
import { stations, recommendation } from '../utils/configs.json';

export default new AutocompleteListener({
    commandName: [{ commandName: 'info' }, { commandName: 'play' }, { commandName: 'switch' }, { commandName: 'add' }],
    listenerName: 'station',
    run: ({ options }) => {
        const name = options.getFocused().toLowerCase();

        const concatenated: station[] = [
            { name: 'random', type: 'get a random station', url: 'random', emoji: '🎲', feedbacks: [] }
        ];

        if (Object.keys(recommendation).length > 0) {
            concatenated.push({
                name: 'recommendation',
                type: 'get the recommendation of the day',
                emoji: '❤️',
                url: 'recommendation',
                feedbacks: []
            });
        }
        const list: station[] = (stations as station[])
            .concat(concatenated)
            .filter(
                (x) =>
                    name.includes(x.emoji) ||
                    name.includes(x.name) ||
                    x.name.toLowerCase().includes(name) ||
                    x.type.toLowerCase().includes(name) ||
                    name.includes(x.type.toLowerCase())
            );

        if (list.length <= 25) return list.map((x) => ({ name: `${x.emoji} ${x.name} - ${x.type}`, value: x.url }));
        // Here we randomise the result

        const returned: station[] = [];

        for (let i = 0; i < 25; i++) {
            const available = list.filter((x) => !returned.includes(x));
            returned.push(available[Math.floor(Math.random() * available.length)]);
        }
        return returned.map((x) => ({ name: `${x.emoji} ${x.name} - ${x.type}`, value: x.url }));
    }
});
