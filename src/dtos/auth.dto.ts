import z from "zod"
import { UserSchema } from "../types/user.types"

export const CreateUserDTO = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(6),
})

export const LoginUserDTO = UserSchema.pick(
  {
    email: true,
    password: true,
  }
)

export type loginUserDTO = z.infer<typeof LoginUserDTO>
export type CreateUserDTO = z.infer<typeof CreateUserDTO>
