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
router.param('projectId', validateProjectExists);

router.post('/:projectId/task',
    body('name').notEmpty().withMessage('Task name is required'),
    body('description').notEmpty().withMessage('The description task is required'),
    handleInputErrors,
    TaskController.createTask
);

router.get('/:projectId/task',
    TaskController.getProjectTasks
)

router.get('/:projectId/task/:taskId',
    param('taskId').isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    TaskController.getTaskById
)

router.put('/:projectId/task/:taskId',
    param('taskId').isMongoId().withMessage('Invalid ID'),
    body('name').notEmpty().withMessage('Task name is required'),
    body('description').notEmpty().withMessage('The description task is required'),
    handleInputErrors,
    TaskController.updateTask
)

router.delete('/:projectId/task/:taskId',
    param('taskId').isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    TaskController.deleteTask
)

export default router;