import { encrypt } from "../../util/encrypt.js";

import { User } from "../../common/models/User.js";
import { usernameExists as userExists } from "../../common/services/UserService.js";
import { sendEventToUser } from "../../common/services/EventService.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export function getUserById(req, res) {
    return res.status(200).json(req.paramUser.toJSONSanitized());
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export function getUserByAuthToken(req, res) {
    return res.status(200).json(req.authUser.toJSONSanitized());
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function modifyUser(req, res) {
    /**
     * @type {User}
     */
    const user = req.paramUser;
    if (Object.keys(req.body).length == 0)
        return res.status(400).json({
            error: "Bad request",
            message: "No values in body",
        });
    if (req.body.username && await userExists(req.body.username))
        return res.status(409).json({
            error: "Username in use.",
            message: `The username '${req.body.username}' is already in use`,
        });
    if (req.body.password) req.body.password = encrypt(req.body.password);
    user.set(req.body);
    await user
        .save()
        .then(() => {
            const userJson = user.toJSONSanitized();
            sendEventToUser(user.id, {
                name: "UserEdittedEvent",
                data: userJson,
            })
            res.status(200).json(userJson);
        })
        .catch((err) =>
            res.status(500).json({
                error: "Error saving user.",
                message: err,
            })
        );
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function deleteUser(req, res) {
    /**
     * @type {User}
     */
    const user = req.paramUser;
    await user
        .destroy()
        .then(() => {
            sendEventToUser(user.id, {
                name: "UserDeletedEvent",
                data: undefined,
            });
            res.sendStatus(200);
        })
        .catch((err) =>
            res.status(500).json({
                error: "Error deleting user.",
                message: err,
            })
        );
}