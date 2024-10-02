import { sendEventToUser } from "../../common/services/EventService.js";
import { Tray } from "../../common/models/Tray.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function createTray(req, res) {
    try {
        const data = req.body;
        if (!data.description) data.description = "";
        const tray = (await Tray.create({
            ...data,
            creatorId: req.params.userId,
        })).toJSONSanitized();
        sendEventToUser(req.authUser.id, {
            name: "TrayCreatedEvent",
            data: tray,
        });
        return res.status(201).json(tray);
    } catch (e) {
        return res.status(500).json({
            error: "Error creating tray.",
            message: e,
        });
    }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function getAllTraysFromUser(req, res) {
    await Tray.findAll({
        where: {
            creatorId: req.params.userId,
        },
    })
        .then((trays) =>
            res.status(200).json(trays.map((tray) => tray.toJSONSanitized()))
        )
        .catch((err) =>
            res.status(500).json({
                error: "Error getting trays.",
                message: err,
            })
        );
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export function getTrayById(req, res) {
    return res.status(200).json(req.paramTray.toJSONSanitized());
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function modifyTray(req, res) {
    /**
     * @type {Tray}
     */
    const tray = req.paramTray;
    if (Object.keys(req.body).length == 0)
        return res.status(400).json({
            error: "Bad request",
            message: "No values in body",
        });
    if(!req.body.description) req.body.description = "";
    tray.set(req.body);
    await tray
        .save()
        .then((tray) => {
            const jsonTray = tray.toJSONSanitized();
            sendEventToUser(req.authUser.id, {
                name: "TrayEdittedEvent",
                data: jsonTray,
            });
            res.status(200).json(jsonTray);
        })
        .catch((err) =>
            res.status(500).json({
                error: "Error saving tray.",
                message: err,
            })
        );
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function deleteTray(req, res) {
    /**
     * @type {Tray}
     */
    const tray = req.paramTray;
    await tray
        .destroy()
        .then(() => {
            res.sendStatus(200);
            sendEventToUser(req.authUser.id, {
                name: "TrayDeletedEvent",
                data: req.paramTray.id,
            });
        })
        .catch((err) =>
            res.status(500).json({
                error: "Error deleting tray.",
                message: err,
            })
        );
}
