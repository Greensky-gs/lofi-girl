import { ButtonHandler } from "amethystjs";
import { TesterButtons } from "../typings/tester";
import botOwner from "../preconditions/botOwner";
import { getStationByUrl } from "../utils/functions";
import confs from '../utils/configs.json'
import { feedback } from "../typings/station";
import { writeFileSync } from "fs";

export default new ButtonHandler({
    customId: TesterButtons.OwnerValidate,
    preconditions: [ botOwner ]
}).setRun(async({ button, message, user }) => {
    const station = getStationByUrl(message.embeds[0].url);
    const tester = message.client.users.cache.get(message.components[0].components[2].customId);

    if (!tester) return button.reply({
        ephemeral: true,
        content: `:x: | The tester isn't cached. Please try again later`
    }).catch(() => {});

    const embed = message.embeds[0];

    const index = confs.stations.indexOf(confs.stations.find(x => x.url === station.url));

    const data = {
        comment: embed.fields[0].value === 'N/A' ? undefined : embed.fields[0].value,
        keywords: embed.fields[1].value === 'N/A' ? [] : embed.fields[1].value.split(' ')
    }
    confs.stations[index].feedbacks.push({
        user_id: tester.id,
        comments: data.comment,
        keywords: data.keywords
    } as feedback);

    writeFileSync('./dist/utils/configs.json', JSON.stringify(confs, null, 4));
    message.edit({
        content: `Feedback added`,
        components: []
    }).catch(() => {});
})