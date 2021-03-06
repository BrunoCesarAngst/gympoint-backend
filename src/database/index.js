import Sequelize from 'sequelize';
import mongoose from 'mongoose';

import Student from '../app/models/Student';
import User from '../app/models/User';
import Files from '../app/models/Files';
import Plans from '../app/models/Plans';
import Enrollment from '../app/models/Enrollment';
import Checkins from '../app/models/Checkins';

import databaseConfig from '../config/database';

const models = [User, Files, Student, Plans, Enrollment, Checkins];

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models.map(model => model.init(this.connection));
    models.map(
      model => model.associate && model.associate(this.connection.models)
    );
  }

  mongo() {
    this.mongoConnection = mongoose.connect(
      'mongodb://localhost:27017/gympoint',
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: true
      }
    )
  }
}

export default new Database();
