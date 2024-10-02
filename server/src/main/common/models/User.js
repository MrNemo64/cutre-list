import { DataTypes, Model, Sequelize } from "sequelize";

export class User extends Model {

    toJSONSanitized() {
        return {
            ...this.toJSON(),
            password: undefined,
            deletedAt: undefined,
        };
    }

}

export const MODEL_DEFINITION = {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }
};