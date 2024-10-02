export const CREATE_TASK = {
    type: "object",
    properties: {
        title: { type: "string", nonEmptyString: true },
        description: { type: "string", nonEmptyString: true },
        priority: {
            type: "string",
            enum: ["none", "low", "medium", "high"],
        },
        parentTaskId: { type: "integer" },
        trayId: { type: "integer" },
        startDate: { type: "string", format: "date" },
        deadLine: { type: "string", format: "date" },
    },
    required: ["title"],
    additionalProperties: false,
};

export const UPDATE_TASK = {
    type: "object",
    properties: {
        title: { type: "string", nonEmptyString: true },
        description: { type: "string", nonEmptyString: true },
        priority: {
            type: "string",
            enum: ["none", "low", "medium", "high"],
        },
        state: {
            type: "string",
            enum: ["in_progress", "done", "wont_do"],
        },
        parentTaskId: { type: [ "integer", "null" ] },
        trayId: { type: [ "integer", "null" ] },
        startDate: { type: [ "string", "null" ], format: "date-time" },
        deadLine: { type:[ "string", "null" ], format: "date-time" },
    },
    additionalProperties: false,
};
