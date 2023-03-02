import { AutocompleteListener } from 'amethystjs';
import { testKeywords } from '../utils/configs.json';
import { resizeStr } from '../utils/functions';

export default new AutocompleteListener({
    commandName: [{ commandName: 'find' }],
    listenerName: 'tags',
    run: ({ focused, focusedValue }) => {
        const splited = focusedValue.split(/ +/);
        const filtered = testKeywords.filter((x) =>
            splited.some((y) => x.toLowerCase().includes(y.toLowerCase()) || y.toLowerCase().includes(x.toLowerCase()))
        );

        if (filtered.length === 0) return [];
        return [{ name: resizeStr(filtered.join(' ')), value: filtered.join('.') }];
    }
});
