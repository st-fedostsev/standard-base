export type RegisterRequest = {
  first_name: string;
  last_name: string;
  patronymic?: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  codeId: string;
};

export type CheckCodeRequest = {
  code_id: string;
  code_otp: string;
};

export type CheckCodeResponse = {
  accessToken: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  codeId: string;
};
