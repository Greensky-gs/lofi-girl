declare global {
    namespace NodeJS {
        interface ProcessEnv {
            token: string;
            feedback: string;
        }
    }
}

export {};