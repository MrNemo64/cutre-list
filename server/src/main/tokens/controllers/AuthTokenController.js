import { AuthToken } from "../../common/models/AuthToken.js";

import { sendEventToToken } from "../../common/services/EventService.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function revoke(req, res) {
    /**
     * @type {AuthToken}
     */
    const token = req.authToken;
    token.set({
        revoked: true,
    });
    await token
        .save()
        .then(() => {
            sendEventToToken(req.params.tokenId, {
                name: "TokenInvalidatedEvent",
                data: undefined,
            })
            res.sendStatus(200);
        })
        .catch((err) =>
            res.status(500).json({
                error: "Error revoking token.",
                message: err,
            })
        );
}
