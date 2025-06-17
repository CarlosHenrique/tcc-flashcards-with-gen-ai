import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, CreateUserInput } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  public async getAllUsers(): Promise<User[]> {
    const found = await this.userModel.find();
    const users: User[] = found.map((user) => {
      return user.toObject<User>();
    });
    return users;
  }

  public async findOneByEmail(email: string): Promise<User> {
    const found = await this.userModel.findOne({ email });
    console.log('cheguei aqui com o email: ', email);
    console.log('found: ', found);
    return found;
  }

  public async createUser(data: CreateUserInput): Promise<User> {
    const createdUser = await this.userModel.create(data);

    return createdUser.toObject<User>();
  }

  public async updateUser(id: string, data: Partial<User>): Promise<User> {
    const updated = await this.userModel.findOneAndUpdate({ email: id }, data, {
      new: true,
    });
    return updated.toObject<User>();
  }

  public async findByResetToken(token: string): Promise<User> {
    return await this.userModel.findOne({ resetToken: token });
  }
}
