import { AmethystEvent } from 'amethystjs';
import { commandDeniedCode } from 'amethystjs';

export default new AmethystEvent('commandDenied', (command, reason) => {
    const includedReplies = [
        { x: commandDeniedCode.GuildOnly, y: 'This command is not usable in direct messages' },
        {
            x: commandDeniedCode.UnderCooldown,
            y: `You have a cooldown of ${Math.floor(
                (reason.metadata?.remainingCooldownTime ?? 1000) / 1000
            )} seconds on this command`
        },
        {
            x: commandDeniedCode.UserMissingPerms,
            y: `You need ${reason.metadata.permissions?.need?.length} permissions to run this command. You have ${reason.metadata?.permissions?.got?.length}`
        },
        {
            x: commandDeniedCode.ClientMissingPerms,
            y: `I need ${reason.metadata.permissions?.need?.length} permissions to run this command. I have ${reason.metadata.permissions?.got?.length}`
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
