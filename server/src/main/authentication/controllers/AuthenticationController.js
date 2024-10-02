import { encrypt } from "../../util/encrypt.js";
import { User } from "../../common/models/User.js";
import { AuthToken } from "../../common/models/AuthToken.js";
import { usernameExists as userExists } from "../../common/services/UserService.js";

/**
 * @param {number} userId 
 * @returns {Promise<AuthToken>}
 */
async function generateAccessToken(userId) {
    const user = userId;
    const issuer = process.env.JWT_ISSUER;
    const expirationDate = parseInt(process.env.JWT_TIME_TO_LIVE, 10) * 1000 + Date.now();

    const token = await AuthToken.create({
        user: user,
        issuer: issuer,
        expiration: expirationDate,
        userId: userId,
    });

    return token;
}

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
*/
export async function register(req, res) {
    try {
        if (await userExists(req.body.username)) {
            return res.status(409)
                .json({
                    error: "Username in use.",
                    message: `The username '${req.body.username}' is already in use`,
                });
        }

        const data = req.body;
        data.password = encrypt(data.password);
        if(data.admin == undefined)
            data.admin = false;

        const user = await User.create(data);
        return res.status(201)
            .json(user.toJSONSanitized());
    } catch (err) {
        console.log(err);
        return res.status(500)
            .json({
                error: "Error creating user.",
                message: err,
            });
    }
}

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function login(req, res) {
    try {
        const user = await User.findOne({
            where: {
                username: req.body.username
            }
        });

        if (!user) {
            return res.status(404).json({
                error: "No user.",
                message: `No user with the username '${req.body.username}'`,
            });
        }

        const encryptedPassword = encrypt(req.body.password);

        if (user.password !== encryptedPassword) {
            return res.status(401)
                .json({
                    error: "Invalid password.",
                    message: "Invalid password"
                });
        }

        const token = await generateAccessToken(user.id);
        const jwttoken = token.generateJWT();
        return res.status(201)
            .json({
                expiration: token.expiration.getTime(),
                token: jwttoken,
                user,
            });
    } catch (e) {
        return res.status(500)
            .json({
                error: "Server error.",
                message: e,
            });
    }
}