/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {Function} next
 */
export async function trayInParamExistsInUserInParam(req, res, next) {
    if(req.paramTray.creatorId == req.params.userId) {
        return next();
    }
    return res.status(400)
        .json({
            error: "No tray.",
            message: `Tray ${req.params.trayId} does not belong to ${req.params.userId}`,
        });
}