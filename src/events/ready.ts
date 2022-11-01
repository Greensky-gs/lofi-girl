import { LofiEvent } from "../structures/Event";

export default new LofiEvent('ready', (c) => {
    console.log(`Logged as ${c.user.tag}`);
});