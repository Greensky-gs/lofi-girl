import { Precondition } from 'amethystjs';
import { getTester } from '../utils/functions';

export default new Precondition('isTester').setButtonRun(({ button, user }) => {
    if (!getTester(user.id)) {
        button.deferUpdate().catch(() => {});
        return {
            ok: false,
            type: 'button',
            button
        };
    }
    return {
        ok: true,
        type: 'button',
        button
    };
});
