import { Router } from 'express';
import Student from './app/models/Student';

const routes = new Router();

routes.get('/', async (req, res) => {
  const student = await Student.create({
    name: 'Bruno César Angst',
    email: 'b@c.a',
    age: 36,
    weight: 95.201,
    height: 1.74
  });

  return res.json(student);
});

export default routes;
