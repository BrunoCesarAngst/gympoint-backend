import Student from '../models/Student';
import Notification from '../schemas/Notification';

class NotificationController {
  async index(req, res) {
    const { id } = req.params;

    const student = await Student.findByPk(id);

    const notifications = await Notification.find({
      student
    });

    return res.json(notifications);
  }
}

export default new NotificationController();
