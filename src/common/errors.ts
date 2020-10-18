class GMError extends Error {
    baseError: Error;
    constructor(baseError: Error, ...params: any[]) {
        super(...params);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        this.name = 'GMError';
        this.baseError = baseError;
    }
}

export { GMError };
