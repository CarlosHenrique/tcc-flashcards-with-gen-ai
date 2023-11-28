import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import 'dotenv/config';

export class MongooseAsyncConfig implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: process.env.MONGODB_URI,
      dbName: process.env.DB_NAME,
    };
  }
}
