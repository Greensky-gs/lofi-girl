declare global {
    namespace NodeJS {
        interface ProcessEnv {
            token: string;
            beta_token?: string;
            dbUrl: string;
            bucketUrl: string;
        }
    }
}

export {};