import { AutocompleteListener } from 'amethystjs';

export default new AutocompleteListener({
    commandName: 'help',
    run: ({ interaction, options }) => {
        const focused = options.getFocused().toLowerCase();
        return interaction.client.chatInputCommands
            .filter(
                (x) =>
                    x.options.name.includes(focused) ||
                    focused.includes(x.options.name) ||
                    x.options.description.includes(focused)
            )
            .splice(0, 25)
            .map((x) => ({ name: x.options.name, value: x.options.name }));
    }
});
