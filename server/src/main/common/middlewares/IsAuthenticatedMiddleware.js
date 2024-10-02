import jwt from "jwt-simple";

import { AuthToken } from "./../models/AuthToken.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {Function} next
 */
export async function check(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            error: "No Auth headers.",
            message: "Auth headers not provided in the request",
        });
    }

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Invalid auth mechanism",
            message: "Token must be a Bearer.",
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Missing token",
            message: "No token was provided in the header.",
        });
    }

    try {
        const payload = jwt.decode(token, process.env.JWT_SECRET);
        const jwttoken = await AuthToken.findByPk(payload.id);
        if (!jwttoken) {
            return res.status(403).json({
                error: "Invalid access token provided.",
                message: "Token does not exist",
            });
        }
        if(jwttoken.isExpeired) {
            return res.status(403).json({
                error: "Invalid access token provided.",
                message: "Token expired",
            });
        }
        if(jwttoken.isRevoked) {
            return res.status(403).json({
                error: "Invalid access token provided.",
                message: "Token revoked",
            });
        }

        req.authToken = jwttoken;
        const authUser = await jwttoken.getUser();
        if(!authUser) {
            return res.status(400)
                .json({
                    error: "Auth user does not exist.",
                    message: "Auth user does not exist.",
                });
        }
        req.authUser = authUser;

        next();

    } catch (err) {
        return res.status(403).json({
            error: "Invalid access token provided.",
            message: "Invalid token provided",
        });
    }
}