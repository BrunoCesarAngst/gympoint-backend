import File from '../models/Files';

class FileController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;

    const file = await File.create({
      name,
      path
    });

    return res.json(file);
  }

  async index(req, res) {
    // const { id } = req.body;

    const avatars = await File.findAll();

    return res.json(avatars);
  }
}

export default new FileController();
