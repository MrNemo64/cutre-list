/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {Function} next
 */
export async function authUserIsAdmin(req, res, next) {
    if (!req.authUser.admin)
        return res.status(403).json({
            error: "Forbidden",
            message: "Only for admins",
        });
    return next();
}
