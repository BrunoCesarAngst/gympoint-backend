import * as Yup from 'yup';
import { startOfDay, parseISO, isBefore, format, addMonths } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';
import Enrollment from '../models/Enrollment';
import Plans from '../models/Plans';
import Student from '../models/Student';

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
    const dateFormated = format(startDate, 'MMMM dd');
    if (isBefore(startDate, new Date())) {
      return res
        .status(400)
        .json({ error: `Dates prior to ${dateFormated} are not allowed` });
    }

    const titleOfPlan = planExists.title;

    const totalTime = addMonths(startDate, planExists.duration);

    const totalPrice = planExists.price * planExists.duration;

    const enrollment = await Enrollment.create({
      ...req.body,
      end_date: totalTime,
      price: totalPrice
    });

    return res.json(enrollment);
  }
}

export default new EnrollmentController();
