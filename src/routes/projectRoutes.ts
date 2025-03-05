import { Router } from 'express';
import { body, param } from 'express-validator';
import { ProjectController } from '../controllers/ProjectController';
import { handleInputErrors } from '../middleware/validation';
import { TaskController } from '../controllers/TaskController';
import { projectExists } from '../middleware/project';
import { taskBelongsToProject, taskExists } from '../middleware/task';
import { authenticate } from '../middleware/auth';
import { TeamMemberController } from '../controllers/TeamController';

const router = Router()
router.use(authenticate)

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
router.param('projectId', projectExists);

router.post('/:projectId/tasks',
    body('name').notEmpty().withMessage('Task name is required'),
    body('description').notEmpty().withMessage('The description task is required'),
    handleInputErrors,
    TaskController.createTask
);

router.param('taskId', taskExists);
router.param('taskId', taskBelongsToProject);

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

router.post('/:projectId/task/:taskId/status',
    param('taskId').isMongoId().withMessage('Invalid ID'),
    body('status').notEmpty().withMessage('Status is required'),
    handleInputErrors,
    TaskController.updateStatus
);

/** Routes for teams */
router.post('/:projectId/team/find',
    body('email').isEmail().toLowerCase().withMessage('Email is not valid'),
    handleInputErrors,
    TeamMemberController.findMemberByEmail
)

router.post('/:projectId/team/',
    body('id').isMongoId().withMessage('ID is not valid'),
    handleInputErrors,
    TeamMemberController.addMemberById
)

router.delete('/:projectId/team/',
    body('id').isMongoId().withMessage('ID is not valid'),
    handleInputErrors,
    TeamMemberController.removeMemberById
)

router.get('/:projectId/team/',
    TeamMemberController.getProjectTeam
)
export default router;