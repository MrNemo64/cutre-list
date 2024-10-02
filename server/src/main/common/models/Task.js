import { DataTypes, Model, Sequelize } from "sequelize";

export class Task extends Model {

    toJSONSanitized(reduced = false) {
        const trayId = this.trayId || null;
        return reduced ? {
            id: this.id,
            title: this.title,
            description: this.description,
        } : {
            ...this.toJSON(),
            trayId,
            deletedAt: undefined,
            parentTaskId: this.parentTaskId || undefined,
        };
    }

}

export const TaskState = Object.freeze({
    IN_PROGRESS: Symbol("in_progress"),
    DONE: Symbol("done"),
    WONT_DO: Symbol("wont_do"),
    values() {
        return ["in_progress", "done", "wont_do"];
    }
});

export const TaskPriority = Object.freeze({
    NONE: Symbol("none"),
    LOW: Symbol("low"),
    MEDIUM: Symbol("medium"),
    HIGH: Symbol("high"),
    values() {
        return ["none", "low", "medium", "high"];
    }
});

export const MODEL_DEFINITION = {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
    },
    state: {
        type: DataTypes.ENUM(TaskState.values()),
        defaultValue: "in_progress",
        allowNull: false,
    },
    priority: {
        type: DataTypes.ENUM(TaskPriority.values()),
        defaultValue: "none",
        allowNull: false,
    },
    startDate: {
        type: DataTypes.DATE,
    },
    deadLine: {
        type: DataTypes.DATE,
    },
    completionDate: {
        type: DataTypes.DATE,
    },
    attachment: {
        type: DataTypes.STRING,
    },
};