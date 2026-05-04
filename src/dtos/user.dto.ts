import z from "zod"
import { UserSchema } from "../types/user.types"

export const UpdateUserDTO = UserSchema.pick(
  {
    name: true,
    profilePicture: true,
  })

export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>
