import type { Request, Response, NextFunction } from "express";
import Task, { ITask } from "../models/Task";

declare global{
    namespace Express {
        interface Request {
            task: ITask;
        }
    }
}

export async function taskExists(req: Request, res: Response, next: NextFunction) {
    try {
        const { taskId } = req.params;
        const task = await Task.findById(taskId);
        if(!task) {
            const error = new Error('Task not found');
            res.status(404).json({ message: error.message });
            return;
        }

        req.task = task;
        next();
    } catch (error) {
        res.status(500).json({ error: 'An error ocurred' });
    }
}

export async function taskBelongsToProject(req: Request, res: Response, next: NextFunction) {
    try {
        if(req.task.project.toString() !== req.project.id.toString()) {
            const error = new Error('Action invalid');
            res.status(400).json({ error: error.message });
            return
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'An error ocurred' });
    }
}