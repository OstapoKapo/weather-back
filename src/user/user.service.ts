import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByIdentifier(identifier: string): Promise<User | null> {
    return this.userModel.findOne({ identifier }).exec();
  }

  async createUser(identifier: string): Promise<User> {
    const user = new this.userModel({ identifier:identifier, bookmarks: [] });
    return user.save();
  }

  async addCity(identifier: string, city: string) {
   return await this.userModel.updateOne(
      { identifier },
      { $addToSet: { bookmarks: city } }
    );

  }

  async deleteCity(identifier: string, city: string) {
    return await this.userModel.updateOne(
      { identifier },
      { $pull: { bookmarks: city } }
    );
  }
  
  
  async getCity(identifier: string) {
    const user = await this.userModel.findOne({ identifier });
    return user ? user.bookmarks : [];
  }
}
