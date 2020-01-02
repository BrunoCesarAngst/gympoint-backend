import Sequelize from 'sequelize';

import Student from '../app/models/Student';
import User from '../app/models/User';
import Files from '../app/models/Files';
import Plans from '../app/models/Plans';

import databaseConfig from '../config/database';

const models = [User, Files, Student, Plans];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models.map(model => model.init(this.connection));
    models.map(
      model => model.associate && model.associate(this.connection.models)
    );
  }
}

export default new Database();
