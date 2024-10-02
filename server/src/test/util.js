import { AuthToken } from "../main/common/models/AuthToken.js";
import { User } from "../main/common/models/User.js";
import { encrypt } from "../main/util/encrypt.js";

/**
 * @returns {Promise<[User, AuthToken]>} the token
 */
export async function createUserAndGetToken() {
    const user = await User.create({
        username: "JuanElLoko",
        name: "Juan",
        email: "juan@el.loko",
        password: encrypt("pass1234"),
    });
    const token = await AuthToken.create({
        issuer: "test",
        expiration: Date.now() + 100000,
        userId: user.id,
    });
    return [user, token];
}