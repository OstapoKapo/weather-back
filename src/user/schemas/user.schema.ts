import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true, unique: false })
  favourites: [
    {
        city: string
    }
  ];
}

export const UserSchema = SchemaFactory.createForClass(User);