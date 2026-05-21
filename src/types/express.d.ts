import { Express } from "express";
import { User } from "./user.types";
import { MembershipType } from "./membership.types";
import { Pipeline } from "./pipeline.types";
import { PipelineDocument } from "../models/pipeline.model";

declare global {
  namespace Express {
    interface Request {
      user?: Record<string | any> | User;
      membership?: Record<string | any> | MembershipType;
      pipeline?: PipelineDocument | Record<string | any>;
    }
  }
}

export {};
