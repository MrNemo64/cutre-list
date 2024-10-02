export const MODIFY_USER = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      username: {
        type: 'string',
      },
      email: {
        type: 'string',
        pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
      },
      password: {
        type: 'string',
      },
    },
    additionalProperties: false,
};