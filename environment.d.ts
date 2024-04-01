declare global {
    namespace NodeJS {
        interface ProcessEnv {
            token: string;
            feedback?: string;
            botOwner: string;
            suggestChannel?: string;
            beta_token?: string;
            botPrefix?: string;
            panelChannel: string;
            apiPort: string;
            apiSelfPort: string;
            dumpChannel?: string;
        }
    }
}

export {};