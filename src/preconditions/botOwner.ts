import { Precondition } from 'amethystjs';

export default new Precondition('botOwner')
    .setButtonRun(({ button, user }) => {
        if (user.id !== process.env.botOwner)
            return {
                ok: false,
                type: 'button',
                button,
                message: 'Bot owner only',
                metadata: {
                    message: button.client.langs.getText(button, 'utils', 'notAllowedToInteract')
                }
            };
        return {
            ok: true,
            type: 'button',
            button
        };
    })
    .setMessageRun(({ message }) => {
        if (message.author.id !== process.env.botOwner) {
            return {
                ok: false,
                type: 'message',
                channelMessage: message,
                message: 'Bot owner only',
                metadata: {
                    message: `:x: | You are not allowed to interact with this message`
                }
            };
        }
        return {
            ok: true,
            type: 'message',
            channelMessage: message
        };
    });
