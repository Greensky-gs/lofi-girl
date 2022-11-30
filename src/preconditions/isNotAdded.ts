import { Precondition } from 'amethystjs';
import { getStationByUrl } from '../utils/functions';

export default new Precondition('isNotAdded').setButtonRun(({ message, button }) => {
    if (getStationByUrl(message.embeds[0].url, false))
        return {
            ok: false,
            message: 'Station already exists',
            metadata: {
                message: 'This station already exists'
            },
            button,
            isChatInput: false,
            isButton: true
        };
    return {
        ok: true,
        isChatInput: false,
        button
    };
});
