import { Precondition } from 'amethystjs';

export default new Precondition('waitTwentySeconds').setButtonRun(({ button, message }) => {
    const diff = Date.now() - message.createdTimestamp;
    if (diff < 20000)
        return {
            ok: false,
            isChatInput: false,
            isButton: true,
            message: 'Wait twenty seconds',
            metadata: {
                message: 'Please wait **20 seconds** before deleting this message'
            },
            button
        };
    return {
        ok: true,
        isChatInput: false,
        isButton: true,
        button
    };
});
