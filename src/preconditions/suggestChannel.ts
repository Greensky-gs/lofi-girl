import { DebugImportance, Precondition } from 'amethystjs';

export default new Precondition('suggestChannel')
    .setChatInputRun(({ interaction }) => {
        if (!process.env.suggestChannel) {
            interaction.client.debug(`ENV suggestChannel variable is not configured`, DebugImportance.Critical);
            return {
                ok: false,
                isChatInput: true,
                interaction,
                metadata: {
                    message: '⚙️ | Suggest channel is not configured by the bot owner'
                }
            };
        }
        return {
            ok: true,
            isChatInput: true,
            interaction
        };
    })
    .setButtonRun(({ button }) => {
        if (!process.env.suggestChannel) {
            button.client.debug(`ENV suggestChannel variable is not configured`, DebugImportance.Critical);
            button
                .reply({
                    ephemeral: true,
                    content: '⚙️ | Suggest channel is not configured by the bot owner'
                })
                .catch(() => {});
            return {
                ok: false,
                isChatInput: false,
                isButton: true
            };
        }
        return {
            ok: true,
            isChatInput: false,
            isButton: true
        };
    });
