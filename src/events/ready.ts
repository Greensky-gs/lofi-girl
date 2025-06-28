import { AmethystEvent } from "amethystjs";
import { getLoopState, getRandomStation } from "../utils/functions";
import { Langs } from "../langs/Manager";

export default new AmethystEvent('ready', async(client) => {
    client.langs = new Langs();
})