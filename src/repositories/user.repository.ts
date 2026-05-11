import { Types } from "mongoose";

import { UserType } from "../types/user.types";
import { System_Roles } from "../constants/roles";
import { UserDocument, User } from "../models/user.model";

export interface IUserRepository {
  getAllUsers({
    skip,
    limit,
  }: {
    skip: number;
    limit: number;
  }): Promise<UserDocument[]>;
  getUserByEmail(email: string): Promise<UserDocument | null>;
  createUser(userData: Partial<UserType>): Promise<UserDocument>;
  findByIdAndUpdateUser(
    id: string,
    userData: UserType,
  ): Promise<UserDocument | null>;
  getUserWithPasswordByEmail(email: string): Promise<UserDocument | null>;
  getUserById(id: string): Promise<UserDocument | null>;
  updateUserLastLoginAt(id: Types.ObjectId): Promise<UserDocument | null>;
  countUsers(): Promise<number>;
  softDeleteUserById(userId: string): Promise<UserDocument | null>;
  deleteUserById(userId: string): Promise<UserDocument | null>;
}

export class UserRepository implements IUserRepository {
  async createUser(userData: Partial<UserType>): Promise<UserDocument> {
    return User.create(userData);
  }

  async findByIdAndUpdateUser(
    id: string,
    userData: Partial<UserType>,
  ): Promise<UserDocument | null> {
    return User.findByIdAndUpdate(id, userData, { new: true });
  }

  async getUserByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({ email });
  }

  async getUserById(id: string): Promise<UserDocument | null> {
    return User.findOne({ _id: id });
  }

  async getUserWithPasswordByEmail(
    email: string,
  ): Promise<UserDocument | null> {
    return User.findOne({ email }).select("+password");
  }

  async getAllUsers({
    skip,
    limit,
  }: {
    skip: number;
    limit: number;
  }): Promise<UserDocument[]> {
    return User.find({ role: { $ne: System_Roles.ADMIN } })
      .sort({ createdAt: "desc" })
      .skip(skip)
      .limit(limit);
  }

  async updateUserLastLoginAt(
    id: Types.ObjectId,
  ): Promise<UserDocument | null> {
    return User.findByIdAndUpdate(
      id,
      { lastLoginAt: new Date() },
      { new: true },
    );
  }

  async countUsers(): Promise<number> {
    return User.estimatedDocumentCount() ?? 0;
  }

  async softDeleteUserById(userId: string): Promise<UserDocument | null> {
    return User.findOneAndUpdate(
      { _id: userId },
      { isDeleted: true },
      { new: true },
    );
  }

  async deleteUserById(userId: string): Promise<UserDocument | null> {
    return User.findOneAndDelete({ _id: userId }, { new: true });
  }
}
