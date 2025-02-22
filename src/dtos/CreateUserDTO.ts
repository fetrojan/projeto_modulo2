import { UserProfile } from "../entities/User"

export class CreateUserDTO {
  name: string
  profile: UserProfile
  email: string
  password: string
  status: boolean
  full_address: string
  document: string
}