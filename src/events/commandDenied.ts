import { AmethystEvent } from 'amethystjs';
import { commandDeniedCode } from 'amethystjs';

export default new AmethystEvent('commandDenied', (command, reason) => {
    const includedReplies = [
        { x: commandDeniedCode.GuildOnly, y: 'This command is not usable in direct messages' },
        {
            x: commandDeniedCode.UnderCooldown,
            y: command.interaction.client.langs.getText(command.interaction, 'commandDenied', 'underCooldown', {
                cooldown: Math.floor((reason.metadata?.remainingCooldownTime ?? 1000) / 1000)
            })
        },
        {
            x: commandDeniedCode.UserMissingPerms,
            y: command.interaction.client.langs.getText(command.interaction, 'commandDenied', 'userMissingPerms', {
                required: reason.metadata.permissions?.need?.length,
                has: reason.metadata.permissions?.got?.length
            })
        },
        {
            x: commandDeniedCode.ClientMissingPerms,
            y: command.interaction.client.langs.getText(command.interaction, 'commandDenied', 'clientMissingPerms', {
                required: reason.metadata.permissions?.need?.length,
                has: reason.metadata.permissions?.got?.length
            })
        }
    ];
    const fnt = command.interaction.replied ? 'editReply' : 'reply';
    if (includedReplies.find((x) => x.x === reason.code)) {
        if (!command.isMessage) {
            command.interaction[fnt]({
                content: includedReplies.find((x) => x.x === reason.code).y,
                ephemeral: true,
                embeds: [],
                components: []
            }).catch(() => {});
            return;
        }
    }
    command.interaction[fnt]({
        content: reason.metadata.message,
        embeds: [],
        components: [],
        ephemeral: true
    }).catch(() => {});
});
