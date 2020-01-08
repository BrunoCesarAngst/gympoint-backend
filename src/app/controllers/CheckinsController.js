import * as Yup from 'yup';
import {
  isWithinInterval,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  isToday
} from 'date-fns';
import { Op } from 'sequelize';
import Checkins from '../models/Checkins';
import Student from '../models/Student';
import Enrollment from '../models/Enrollment';

class CheckinsController {
  async store(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .required()
        .min(1)
    });
    const { id } = req.params;

    try {
      await schema.validate({ id }, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ errors: err.errors });
    }
    const [idInformed] = Object.values(req.body);

    const student = await Student.findOne({
      where: { id }
    });

    if (student === null || student === undefined) {
      return res.status(400).json({ error: 'Student do not exists!' });
    }

    const idStudent = student.id;

    if (idInformed !== idStudent) {
      res
        .status(401)
        .json({ error: `Id entered for check in invalid, your id is ${id}` });
    }

    const registered = await Enrollment.findAll({
      where: { student_id: id }
    });

    if (!registered) {
      res.status(400).json({
        error: 'This student is not enrolled!'
      });
    }

    const dateNow = new Date();

    const alreadyCheckedIn = await registered.map(enrolled => {
      return isWithinInterval(dateNow, {
        start: startOfDay(enrolled.start_date),
        end: endOfDay(enrolled.end_date)
      });
    });
    if (alreadyCheckedIn.includes(false)) {
      return res.status(400).json({ error: 'Incompatible date to check in' });
    }

    const checkInAmount = await Checkins.findAll({
      where: {
        student_id: idInformed,
        created_at: {
          [Op.between]: [startOfWeek(dateNow), endOfWeek(dateNow)]
        }
      }
    });
    if (checkInAmount.map(check => isToday(check.dataValue.created_at))) {
      return res.status(400).json({ error: 'Student checked in today' });
    }

    const amountOfCheckInsAllowed = 5;

    if (checkInAmount.length >= amountOfCheckInsAllowed) {
      return res
        .status(400)
        .json({ error: 'Student already checked in 5 times this week' });
    }

    const checkins = await Checkins.create({ student_id: idInformed });

    return res.json(checkins);
  }

  async index(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .required()
        .min(1)
    });
    const { id } = req.params;

    try {
      await schema.validate({ id }, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ errors: err.errors });
    }

    const [idInformed] = Object.values(req.body);

    const checkins = await Checkins.findAll({
      where: {
        student_id: idInformed
      },
      order: [['created_at', 'DESC']]
    });

    return res.json(checkins);
  }
}

export default new CheckinsController();
