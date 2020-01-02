import * as Yup from 'yup';
import Plans from '../models/Plans';

class TypesOfPlansController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string()
        .required()
        .min(3),
      duration: Yup.number()
        .positive()
        .required()
        .min(1),
      price: Yup.number()
        .positive()
        .required()
        .min(0)
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ errors: err.errors });
    }

    /**
     * if there is the plan
     */
    const planExists = await Plans.findOne({
      where: { title: req.body.title }
    });
    if (planExists) {
      return res.status(400).json({ error: 'This plan already exists' });
    }

    /**
     * storing the plan
     */
    const { id, title, duration, price } = await Plans.create(req.body);

    return res.json({ id, title, duration, price });
  }

  async index(req, res) {
    const plans = await Plans.findAll();

    return res.json(plans);
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

    const plan = await Plans.findByPk(id);
    if (!plan) {
      return res.status(400).json({ error: "This plan don't exists" });
    }

    return res.json(plan);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string()
        .required()
        .min(3),
      duration: Yup.number()
        .positive()
        .required()
        .min(1),
      price: Yup.number()
        .positive()
        .required()
        .min(0)
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ errors: err.errors });
    }

    const { id } = req.params;
    const { title } = req.body;

    /**
     * if there is the plan
     */
    const plan = await Plans.findByPk(id);

    if (!plan) {
      return res.status(400).json({ error: "This plan don't exists" });
    }

    // if (title && title !== plan.title) {
    //   const planExist = await Plans.findOne({ where: { title } });

    //   if (planExist) {
    //     return res.status(400).json({ error: 'This plan already exists' });
    //   }
    // }

    /**
     * updating the plan
     */
    const { duration, price } = await plan.update(req.body);

    return res.json({ id, title, duration, price });
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

    const plan = await Plans.findByPk(id);
    if (!plan) {
      return res.status(400).json({ error: "This plan don't exists" });
    }

    await plan.destroy({ where: { id } });
    return res.send('The plan has been deleted');
  }
}

export default new TypesOfPlansController();
