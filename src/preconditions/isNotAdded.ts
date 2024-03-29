import { Precondition } from 'amethystjs';
import { getStationByUrl } from '../utils/functions';

export default new Precondition('isNotAdded').setButtonRun(({ message, button }) => {
    if (getStationByUrl(message.embeds[0].url, false))
        return {
            ok: false,
            message: 'Station already exists',
            metadata: {
                message: button.client.langs.getText(button, 'preconditions', 'isNotAdded')
            },
            button,
            type: 'button'
        };
    return {
        ok: true,
        type: 'button',
        button
    };
});
