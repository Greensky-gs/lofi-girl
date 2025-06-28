import { AutocompleteListener } from "amethystjs";
import { stationType } from "../typings/firebase";
import { stations } from "../cache/stations";
import { resizeStr } from "../utils/functions";

export default new AutocompleteListener({
    listenerName: 'station',
    commandName: [{ commandName: 'play' }],
    run: ({ options, interaction, client }) => {
        const name = options.getFocused().toLowerCase();

        const concatenated: stationType<false>[] = [
            {
                title: interaction.client.langs.getText(interaction, 'stationAutocomplete', 'randomName'),
                id: 'random',
                url: 'random',
                emoji: '🎲',
                authors: [],
                tracks: {},
                img: '',
                beats: ""
            }
        ];
        
        // TODO Implement recommendation of the day

        const list: stationType<false>[] = Object.values(stations)
            .concat(concatenated)
            .filter(
                (x) =>
                    name.includes(x.emoji) ||
                    name.includes(x.title) ||
                    x.title.toLowerCase().includes(name) ||
                    x.title.toLowerCase().includes(name) ||
                    name.includes(x.title.toLowerCase())
            );

        const formatName = (x: stationType<false>) => `${x.emoji} ${
            x.id === 'recommentation' ? 
            client.langs.getText(interaction, 'stationAutocomplete', 'recommendationName') :
            x.id === 'random' ?
            client.langs.getText(interaction, 'stationAutocomplete', 'randomName') :
            x.authors.join(' x ')} - ${x.id === 'recommendation' ?
            client.langs.getText(interaction, 'stationAutocomplete', 'recommendationContent')
            : x.id === 'random' ? client.langs.getText(interaction, 'stationAutocomplete', 'randomContent')
            : `${x.title} ${x.beats}`}`
        if (list.length <= 25)
            return list.map((x) => ({
                name: resizeStr(formatName(x), 100),
                value: x.id
            }));
        // Here we randomise the result

        const returned: stationType<false>[] = [];

        for (let i = 0; i < 25; i++) {
            const available = list.filter((x) => !returned.includes(x));
            returned.push(available[Math.floor(Math.random() * available.length)]);
        }
        return returned.slice(0, 25).map((x) => ({
            name: resizeStr(
                formatName(x),
                100
            ),
            value: x.id
        }));
    }
})