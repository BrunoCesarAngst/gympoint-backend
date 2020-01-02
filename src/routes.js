import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import FileController from './app/controllers/FileController';
import PlansController from './app/controllers/PlansController';

import authMiddleware from './app/middlewares/auth';

const uploads = multer(multerConfig);

const routes = new Router();

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

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

export default routes;
