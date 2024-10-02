export const REGISTER = {
    type: "object",
    properties: {
        name: {
            type: "string",
        },
        username: {
            type: "string",
        },
        email: {
            type: "string",
            pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        },
        password: {
            type: "string",
        },
        admin: {
            type: "boolean",
        },
    },
    required: ["name", "username", "email", "password"],
    additionalProperties: false,
};

export const LOGIN = {
    type: "object",
    properties: {
        username: {
            type: "string",
        },
        password: {
            type: "string",
        },
    },
    required: ["username", "password"],
    additionalProperties: false,
};
