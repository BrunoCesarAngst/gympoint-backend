import * as Yup from 'yup';
import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string()
        .required()
        .min(3),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number()
        .positive()
        .required()
        .min(1),
      height: Yup.number()
        .positive()
        .required()
        .min(0),
      weight: Yup.number()
        .positive()
        .required()
        .min(0)
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ errors: err.errors });
    }

    const studentExists = await Student.findOne({
      where: { email: req.body.email }
    });

    if (studentExists) {
      return res.status(400).json({ error: 'Student already exists' });
    }
    const { id, name, email, age, weight, height } = await Student.create(
      req.body
    );

    return res.json({
      id,
      name,
      email,
      age,
      weight,
      height
    });
  }

  async index(req, res) {
    const students = await Student.findAll();
    return res.json(students);
  }

  async show(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .min(1)
    });

    const { id } = req.params;
    try {
      await schema.validate({ id }, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ errors: err.errors });
    }

    const student = await Student.findByPk(id);

    // if (id == null || undefined) {
    //   return res.status(400).json({ error: 'Identifier not informed!' });
    // }

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists' });
    }

    return res.json(student);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().min(3),
      email: Yup.string().email(),
      age: Yup.number()
        .positive()
        .min(1),
      height: Yup.number()
        .positive()
        .min(0),
      weight: Yup.number()
        .positive()
        .min(0)
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ errors: err.errors });
    }

    const { id } = req.params;
    const { email } = req.body;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists' });
    }

    if (email && email !== student.email) {
      const studentExists = await Student.findOne({ where: { email } });

      if (studentExists) {
        return res.status(400).json({ error: 'Student already exists.' });
      }
    }

    const { name, age, height, weight } = await student.update(req.body);

    return res.json({ name, email, age, height, weight });
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .min(1)
    });

    const { id } = req.params;
    try {
      await schema.validate({ id }, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ errors: err.errors });
    }

    const student = await Student.findByPk(id);

    // if (id == null || undefined) {
    //   return res.status(400).json({ error: 'Identifier not informed!' });
    // }

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists' });
    }

    await Student.destroy({ where: { id } });
    return res.send();
  }
}

export default new StudentController();
