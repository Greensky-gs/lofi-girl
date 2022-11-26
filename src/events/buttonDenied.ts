import { AmethystEvent } from 'amethystjs';

export default new AmethystEvent('buttonDenied', ({ button, metadata }) => {
    const fnt = button[button.deferred || button.replied ? 'editReply' : 'reply'];
    fnt({
        content: metadata.message ?? ":x: | You can't do this",
        ephemeral: true
    });
});
