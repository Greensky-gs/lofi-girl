import { AmethystEvent } from 'amethystjs';

export default new AmethystEvent('buttonDenied', ({ button, metadata }) => {
    const fnt = button.deferred || button.replied ? 'editReply' : 'reply';
    button[fnt]({
        content: metadata.message ?? button.client.langs.getText(button, 'utils', 'notAllowedToInteract'),
        ephemeral: true
    });
});
