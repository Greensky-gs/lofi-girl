import { Precondition } from "amethystjs";
import { getTester } from "../utils/functions";

export default new Precondition('isTester').setButtonRun(({ button, user }) => {
    if (!getTester(user.id)) {
        button.deferUpdate().catch(() => {});
        return {
            ok: false,
            isChatInput: false,
            isButton: true
        }
    }
    return {
        ok: true,
        isChatInput: false,
        isButton: true
    }
})