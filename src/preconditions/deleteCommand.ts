import { Precondition } from 'amethystjs';

export default new Precondition('deleteCommand').setMessageRun(({ message }) => {
    if (message.deletable && message.author.id === process.env.botOwner) message.delete().catch(() => {});
    return {
        ok: true,
        isChatInput: false,
        channelMessage: message
    };
});
