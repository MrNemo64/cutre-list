import jwt from "jwt-simple";

import { DataTypes, Model, Sequelize } from "sequelize";

export class AuthToken extends Model {
    /**
     * @returns {string}
     */
    generateJWT() {
        return jwt.encode(this.payload, process.env.JWT_SECRET);
    }

    /**
     * @returns {boolean}
     */
    get isValid() {
        return !this.isRevoked && !this.isExpeired;
    }

    /**
     * @returns {boolean}
     */
    get isRevoked() {
        return this.revoked;
    }

    /**
     * @returns {boolean}
     */
    get isExpeired() {
        return this.expiration <= new Date();
    }

    get payload() {
        return { id: this.id };
    }
}

export const MODEL_DEFINITION = {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    issuer: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "UNKNOWN",
    },
    expiration: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    revoked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    }
};