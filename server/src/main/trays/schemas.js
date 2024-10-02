export const CREATE_TRAY = {
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 1,
        },
        description: {
            type: "string",
        },
    },
    required: ["name"],
    additionalProperties: false,
};

export const UPDATE_TRAY = {
    type: "object",
    properties: {
        name: {
            type: "string",
        },
        description: {
            type: "string",
        },
    },
    additionalProperties: false,
};
