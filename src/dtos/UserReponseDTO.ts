export class UserResponseDTO {
    id: number;
    name: string;
    status: boolean;
    profile: string;
    full_address?: string | null;
  
    constructor(user: any) {
      this.id = user.id;
      this.name = user.name;
      this.status = user.status;
      this.profile = user.profile;
      this.full_address =
        user.driver?.full_address ?? user.branch?.full_address ?? null;
    }
  }
  