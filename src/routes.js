import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import FileController from './app/controllers/FileController';
import PlansController from './app/controllers/PlansController';
import EnrollmentController from './app/controllers/EnrollmentController';
import NotificationController from './app/controllers/NotificationController';
import CheckinsController from './app/controllers/CheckinsController';

import authMiddleware from './app/middlewares/auth';

const uploads = multer(multerConfig);

const routes = new Router();

routes.post('/sessions', SessionController.store);

routes.post('/students/:id/checkins', CheckinsController.store);
routes.get('/students/:id/checkins', CheckinsController.index);

/**
 * Area for authenticated users only
 */

routes.use(authMiddleware);

routes.get('/sessions', SessionController.index);

routes.post('/users', UserController.store);
routes.get('/users', UserController.index);
routes.get('/users/:id', UserController.show);
routes.put('/users/:id', UserController.update);
routes.delete('/users/:id', UserController.delete);

routes.post('/students', StudentController.store);
routes.get('/students', StudentController.index);
routes.get('/students/:id', StudentController.show);
routes.put('/students/:id', StudentController.update);
routes.delete('/students/:id', StudentController.delete);

routes.post('/files', uploads.single('file'), FileController.store);
routes.get('/files', FileController.index);

routes.post('/typeofplans', PlansController.store);
routes.get('/typeofplans', PlansController.index);
routes.get('/typeofplans/:id', PlansController.show);
routes.put('/typeofplans/:id', PlansController.update);
routes.delete('/typeofplans/:id', PlansController.delete);

routes.post('/enrollments', EnrollmentController.store);
routes.get('/enrollments', EnrollmentController.index);
routes.get('/enrollments/:id', EnrollmentController.show);
routes.put('/enrollments/:id', EnrollmentController.update);
routes.delete('/enrollments/:id', EnrollmentController.delete);

export default routes;
