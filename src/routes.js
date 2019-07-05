import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.get('', UserController.list);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// todas as rotas que virem abaixo desta declaração, executarão a middleware
routes.use(authMiddleware);

routes.put('/users', UserController.update);

export default routes;
