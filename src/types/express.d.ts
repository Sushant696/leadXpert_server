import { Express } from "express"
import { User } from "./user.types"
import { MembershipType } from "./membership.types"

declare global {
  namespace Express {
    interface Request {
      user?: Record<string | any> | User
      membership?: Record<string | any> | MembershipType
    }
  }
}

export { }
