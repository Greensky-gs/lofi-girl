import { Precondition } from 'amethystjs';

export default new Precondition('waitTwentySeconds').setButtonRun(({ button, message }) => {
    const diff = Date.now() - message.createdTimestamp;
    if (diff < 20000) {
        const list = '🕐🕑🕒🕓🕔🕕🕖🕗🕘🕙🕚🕛🕜🕝🕞🕟🕠🕡🕢🕣🕤🕥🕦🕧';
        const emoji = list[Math.floor(Math.random() * list.length)];

        return {
            ok: false,
            isChatInput: false,
            isButton: true,
            message: 'Wait twenty seconds',
            metadata: {
                message: button.client.langs.getText(button, 'preconditions', 'waitTwenty', { emoji })
            },
            button
        };
    }
    return {
        ok: true,
        isChatInput: false,
        isButton: true,
        button
    };
});
