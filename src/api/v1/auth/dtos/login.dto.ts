import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export default class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}

export const LoginResponseSchema = {
  "200": {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                firstName: {
                  type: "string",
                },
                lastName: {
                  type: "string",
                },
                email: {
                  type: "string",
                },
                lastLogin: {
                  type: "string",
                },
              },
            },
            tokens: {
              type: "object",
              properties: {
                accessToken: {
                  type: "object",
                  properties: {
                    token: {
                      type: "string",
                    },
                    expires: {
                      type: "integer",
                    },
                  },
                },
                refreshToken: {
                  type: "object",
                  properties: {
                    token: {
                      type: "string",
                    },
                    expires: {
                      type: "integer",
                    },
                  },
                },
              },
            },
          },
          required: ["user", "tokens"],
        },
      },
    },
    description: "Successful response",
  },
};
