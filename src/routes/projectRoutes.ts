import { Router } from 'express';
import { body, param } from 'express-validator';
import { ProjectController } from '../controllers/ProjectController';
import { handleInputErrors } from '../middleware/validation';
import { TaskController } from '../controllers/TaskController';
import { validateProjectExists } from '../middleware/project';

const router = Router();

router.post('/',
    body('projectName').notEmpty().withMessage('Project name is required'),
    body('clientName').notEmpty().withMessage('Client name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    handleInputErrors,
    ProjectController.createProject
);

router.get('/', ProjectController.getAllProjects);

router.get('/:id',
    param('id').isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    ProjectController.getProjectById
);

router.put('/:id',
    param('id').isMongoId().withMessage('Invalid ID'),
    body('projectName').notEmpty().withMessage('Project name is required'),
    body('clientName').notEmpty().withMessage('Client name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    handleInputErrors,
    ProjectController.updateProject
);

router.delete('/:id',
    param('id').isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    ProjectController.deleteProject
);

/** Routes for task */
router.post('/:projectId/task',
    validateProjectExists,
    body('name').notEmpty().withMessage('Task name is required'),
    body('description').notEmpty().withMessage('The description task is required'),
    handleInputErrors,
    TaskController.createTask
);

export default router;