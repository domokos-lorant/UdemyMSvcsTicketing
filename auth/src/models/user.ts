import mongoose, { Document, Schema, Model, CallbackError } from "mongoose";
import { Password } from "../services/password";

export interface UserAttributes {
  email: string;
  password: string;
}

export interface UserDocument extends UserAttributes, Document {}

interface UserModel extends Model<UserDocument> {
  build(attributes: UserAttributes): UserDocument;
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },
  {
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      }
    }
  }
);

userSchema.pre(
  "save",
  async function (done: (err?: CallbackError) => void): Promise<void> {
    if (this.isModified("password")) {
      const hashedPassword = await Password.toHash(this.get("password"));
      this.set("password", hashedPassword);
    }
    done();
  }
);

userSchema.statics.build = (attributes: UserAttributes): UserDocument => {
  return new User(attributes);
};

const User = mongoose.model<UserDocument, UserModel>("User", userSchema);

export default User;
