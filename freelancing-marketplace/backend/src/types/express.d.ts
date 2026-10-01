declare global {
    namespace Express {
        interface Request {
            auth?: {
                userId: string;
                sessionid: string;
                role: 'client' | 'freelancer';
                accountExists: boolean;
                isOnboarded: boolean;
            }
        }
    }
}

export { };