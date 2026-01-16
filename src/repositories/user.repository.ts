import { UserType } from "../types/user.types";
import { UserDocument, User } from "../models/auth.model";

export interface IUserRepository {
  createUser(userData: Partial<UserType>): Promise<UserDocument>;
  getUserByEmail(email: string): Promise<UserDocument | null>;
  getUserByUsername(username: string): Promise<UserDocument | null>;
}

export class UserRepository implements IUserRepository {

  async createUser(userData: Partial<UserType>): Promise<UserDocument> {

    return User.create(userData);
  }

  async getUserByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({ email });
  }

  async getUserById(id: string): Promise<UserDocument | null> {
    return User.findOne({ _id: id });
  }

  async getUserWithPasswordByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({ email }).select("+password");
  }

  async getUserByUsername(username: string): Promise<UserDocument | null> {
    return User.findOne({ username });
  }
}

