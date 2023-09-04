import { DebugImportance, Precondition } from 'amethystjs';

export default new Precondition('suggestChannel')
    .setChatInputRun(({ interaction }) => {
        if (!process.env.suggestChannel) {
            interaction.client.debug(`ENV suggestChannel variable is not configured`, DebugImportance.Critical);
            return {
                ok: false,
                type: 'chatInput',
                interaction,
                metadata: {
                    message: interaction.client.langs.getText(interaction, 'preconditions', 'suggestChannel')
                }
            };
        }
        return {
            ok: true,
            type: 'chatInput',
            interaction
        };
    })
    .setButtonRun(({ button }) => {
        if (!process.env.suggestChannel) {
            button.client.debug(`ENV suggestChannel variable is not configured`, DebugImportance.Critical);
            button
                .reply({
                    ephemeral: true,
                    content: button.client.langs.getText(button, 'preconditions', 'suggestChannel')
                })
                .catch(() => {});
            return {
                ok: false,
                type: 'button',
                button
            };
        }
        return {
            ok: true,
            type: 'button',
            button
        };
    });
