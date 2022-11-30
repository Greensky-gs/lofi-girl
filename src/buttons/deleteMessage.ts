import { ButtonHandler } from "amethystjs";
import waitTwenty from "../preconditions/waitTwenty";

export default new ButtonHandler({
    customId: 'delete-message',
    preconditions: [ waitTwenty ]
}).setRun(({ message, button }) => {
    if (!message.deletable) button.reply({
        ephemeral: true,
        content: `:x: | I can't delete this message`
    }).catch(() => {});
    message.delete().catch(() => {});
})