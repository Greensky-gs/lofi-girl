import { Precondition } from 'amethystjs';

export default new Precondition('botOwner').setButtonRun(({ button, user }) => {
    if (user.id !== process.env.botOwner)
        return {
            ok: false,
            isChatInput: false,
            isButton: true,
            button,
            message: 'Bot owner only',
            metadata: {
                message: ":x: | You're not allowed to interact with this message"
            }
        };
    return {
        ok: true,
        isChatInput: false,
        isButton: true,
        button
    };
}).setMessageRun(({ message }) => {
    if (message.author.id !== process.env.botOwner) {
        return {
            ok: false,
            isChatInput: false,
            isButton: false,
            channelMessage: message,
            message: "Bot owner only",
            metadata: {
                message: `:x: | You are not allowed to interact with this message`
            }
        }
    }
    return {
        ok: true,
        isButton: false,
        isChatInput: false,
        channelMessage: message
    }
});
