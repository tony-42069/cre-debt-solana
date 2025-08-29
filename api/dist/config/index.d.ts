interface Config {
    nodeEnv: string;
    port: number;
    apiBaseUrl: string;
    database: {
        url: string;
    };
    solana: {
        rpcUrl: string;
        cluster: string;
    };
    programs: {
        propertyRegistry: string;
        loanCore: string;
        borrowerRegistry: string;
    };
    platform: {
        authority: string;
        treasury: string;
        tokenAccount: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    cors: {
        origin: string;
    };
    apiDocs: {
        enabled: boolean;
        path: string;
    };
}
declare const config: Config;
export { config };
//# sourceMappingURL=index.d.ts.map