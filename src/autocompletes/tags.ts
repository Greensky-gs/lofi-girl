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

        const valids: typeof filtered = [];
        filtered.forEach((flt) => {
            if ((valids.join('.').length + flt.length + 1) < 100) valids.push(flt)
        })

        if (filtered.length === 0) return [];
        return [{ name: resizeStr(valids.join(' ')), value: valids.join('.') }];
    }
});
