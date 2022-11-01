declare global {
    namespace NodeJS {
        interface ProcessEnv {
            token: string;
        }
    }
}

export {};