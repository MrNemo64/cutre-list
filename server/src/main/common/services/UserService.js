import { User } from "./../models/User.js";

/**
 * @param {string} username of the user to check if exists
 * @returns `true` if there is an user with the given username
 */
export async function usernameExists(username) {
    return !!(await User.findOne({
        where: { username }
    }));  
}