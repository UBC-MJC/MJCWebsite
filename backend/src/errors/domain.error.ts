class InvalidGameInputError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidGameInputError";
    }
}

class NoCurrentSeasonError extends Error {
    constructor() {
        super("No season in progress");
        this.name = "NoCurrentSeasonError";
    }
}

export { InvalidGameInputError, NoCurrentSeasonError };
