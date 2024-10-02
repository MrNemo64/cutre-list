/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {Function} next
 */
export async function canAuthUserSeeUser(req, res, next) {
    if(req.authUser.id != req.params.userId)
        return res.status(403)
        .json({
            error: "Forbidden",
            message: "Can not access this endpoint",
        });
    return next();
}