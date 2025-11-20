export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  };

  constructor(
    accessToken: string,
    refreshToken: string,
    user: {
      id: string;
      email: string;
      name: string;
      roles: string[];
    },
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
  }
}
