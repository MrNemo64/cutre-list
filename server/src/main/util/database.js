import { Sequelize } from "sequelize";

import { initialize as initializeModels } from "../common/models/initializeModels.js"; 

/**
 * @type {import("sequelize").Options}
 */
export const DEFAULT_OPTIONS = {
    dialect: "sqlite",
    storage: "./storage/data.sqlite",
    logging: false,
};

/**
 * @param {import("sequelize").Options} [options = DEFAULT_OPTIONS] Options for the database
 * @returns {Promise<Sequelize>}
 */
export async function setupDatabase(options = DEFAULT_OPTIONS) {
    const sequelize = new Sequelize(options);
    
    await initializeModels(sequelize);
    return sequelize;
}