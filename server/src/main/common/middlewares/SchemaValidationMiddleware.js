import Ajv from "ajv";
import addFormats from "ajv-formats";

export function verify(schema) {
    if (!schema) throw new Error("No schema provided");

    return (req, res, next) => {
        const { body } = req;

        const ajv = new Ajv({ allErrors: true });
        ajv.addKeyword({
            keyword: "nonEmptyString",
            type: "string",
            code: function (cxt) {
                return typeof cxt.data === "string" && cxt.data.trim() !== "";
            },
            errors: true,
            nonEmptyString: 'The input must be a non-empty string',
        });

        addFormats(ajv);
        const validate = ajv.compile(schema);
        if (validate(body)) return next();

        return res.status(400).json({
            error: "Invalid payload",
            message: ajv.errorsText(validate.errors),
        });
    };
}
