import { AmethystEvent } from 'amethystjs';

export default new AmethystEvent('buttonDenied', ({ button, metadata }) => {
    const fnt = button.deferred || button.replied ? 'editReply' : 'reply';
    button[fnt]({
        content: metadata.message ?? ":x: | You can't do this",
        ephemeral: true
    });
});
