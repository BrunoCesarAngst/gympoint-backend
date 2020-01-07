import * as Yup from 'yup';
import { startOfDay, parseISO, isBefore, format, addMonths } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';
import Enrollment from '../models/Enrollment';
import Plans from '../models/Plans';
import Student from '../models/Student';
import Notification from '../schemas/Notification';

import Mail from '../../lib/Mail';

class EnrollmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .positive()
        .required(),
      // .min(1),
      plan_id: Yup.number()
        .positive()
        .required(),
      // .min(1),
      start_date: Yup.date().required()
    });
    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ errors: err.errors });
    }

    const loggedInUser = req.userId;
    const { student_id, plan_id, start_date } = req.body;

    const studentExists = await Student.findOne({
      where: { id: student_id }
    });
    if (!studentExists) {
      return res.status(400).json({ error: "This student doesn't exist" });
    }

    const enrollmentExists = await Enrollment.findOne({
      where: { id: plan_id, canceled_at: null }
    });
    if (enrollmentExists) {
      return res.status(400).json({ error: 'Enrollment already registered' });
    }

    const planExists = await Plans.findByPk(plan_id);
    if (!planExists) {
      return res.status(400).json({ error: 'Unregistered plan' });
    }

    const enrolledStudent = await Enrollment.findOne({
      where: {
        student_id
      }
    });
    if (enrolledStudent) {
      if (enrolledStudent.student_id === student_id) {
        return res
          .status(400)
          .json({ error: 'The student is already enrolled' });
      }
    }

    // checking if the day has passed.
    const startDate = startOfDay(parseISO(start_date));
    // formatting the date
    const dateFormatted = format(startDate, 'MMMM dd');
    if (isBefore(startDate, new Date())) {
      return res
        .status(400)
        .json({ error: `Dates prior to ${dateFormatted} are not allowed` });
    }

    const titleOfPlan = planExists.title;

    const totalTime = addMonths(startDate, planExists.duration);

    const totalPrice = planExists.price * planExists.duration;

    const enrollment = await Enrollment.create({
      ...req.body,
      end_date: totalTime,
      price: totalPrice,
      created_by: loggedInUser
    });

    /**
     * Notify enrollment student
     */
    const student = await Student.findByPk(req.body.student_id);
    const initialDate = format(startDate, "'dia' dd 'de' MMMM 'de' yyyy", {
      locale: pt
    });
    const finalDate = format(totalTime, "'dia' dd 'de' MMMM 'de' yyyy", {
      locale: pt
    });

    await Notification.create({
      content: `${student.name} sua matrícula foi realizada com sucesso,\n seu plano é o ${titleOfPlan}, que inicia ${initialDate} e termina\n em ${finalDate}, pronto para malhar?`,
      student: student.id
    });

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Matricula GymPoint',
      template: 'enrollmentStore',
      context: {
        student: student.name,
        title: titleOfPlan,
        duration: planExists.duration,
        dateStart: initialDate,
        dateEnd: finalDate,
        price: totalPrice
      }
    });

    return res.json(enrollment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .positive()
        .required(),
      // .min(1),
      plan_id: Yup.number()
        .positive()
        .required(),
      // .min(1),
      start_date: Yup.date().required()
    });
    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ errors: err.errors });
    }

    const { id } = req.params;

    const enrollmentExists = await Enrollment.findByPk(id);
    if (!enrollmentExists) {
      return res.status(400).json({ error: "This enrollment don't exists" });
    }

    const { student_id, plan_id, start_date } = req.body;

    const studentExists = await Student.findOne({
      where: { id: student_id }
    });
    if (!studentExists) {
      return res.status(400).json({ error: "This student doesn't exist" });
    }

    const studentOfEnrollment = await Enrollment.findByPk(id);

    if (student_id !== studentOfEnrollment.student_id) {
      return res.status(400).json({ error: 'Not allowed to change student' });
    }

    const planExists = await Plans.findByPk(plan_id);
    if (!planExists) {
      return res.status(400).json({ error: 'Unregistered plan' });
    }

    // checking if the day has passed.
    const startDate = startOfDay(parseISO(start_date));
    // formatting the date
    const dateFormated = format(startDate, 'MMMM dd');
    if (isBefore(startDate, new Date())) {
      return res
        .status(400)
        .json({ error: `Dates prior to ${dateFormated} are not allowed` });
    }

    const initialDate = format(startDate, "'dia' dd 'de' MMMM 'de' yyyy", {
      locale: pt
    });

    const totalTime = addMonths(startDate, planExists.duration);

    const finalDate = format(totalTime, "'dia' dd 'de' MMMM 'de' yyyy", {
      locale: pt
    });

    const titleOfPlan = planExists.title;

    const totalPrice = planExists.price * planExists.duration;

    const enrollment = await enrollmentExists.update(req.body);

    await Mail.sendMail({
      to: `${studentExists.name} <${studentExists.email}>`,
      subject: 'Alteração de matricula GymPoint',
      template: 'enrollmentUpdate',
      context: {
        student: studentExists.name,
        title: titleOfPlan,
        duration: planExists.duration,
        dateStart: initialDate,
        dateEnd: finalDate,
        price: totalPrice
      }
    });

    return res.json(enrollment);
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const enrollments = await Enrollment.findAll({
      where: { canceled_at: null },
      order: ['start_date'],
      limit: 5,
      offset: (page - 1) * 5
    });

    return res.json(enrollments);
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

    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) {
      return res.status(400).json({ error: "This enrollment don't exists" });
    }

    return res.json(enrollment);
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

    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) {
      return res.status(400).json({ error: "This enrollment don't exists" });
    }

    await enrollment.destroy({ where: { id } });
    return res.send('The enrollment has been deleted');
  }
}

export default new EnrollmentController();
