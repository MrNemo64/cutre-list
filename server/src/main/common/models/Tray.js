import { DataTypes, Model, Sequelize } from "sequelize";

export class Tray extends Model {

    toJSONSanitized() {
        return {
            ...this.toJSON(),
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
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
};