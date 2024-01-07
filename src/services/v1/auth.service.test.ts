import { ObjectId } from "mongoose";
import { UnauthorizedError } from "routing-controllers";

import { IUserSchema } from "@models/users.model";
import { AuthService, UserService } from "@services/v1";

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe("loginUserWithEmailAndPassword", () => {
    it("should return user for valid credentials", async () => {
      const email = "test@example.com";
      const password = "correctPassword";

      const mockUser = {
        _id: "123",
        firstName: "mock-firstName",
        lastName: "mock-lastName",
        email,
        password,
        lastLogin: new Date().toISOString(),
      };

      const mockGetUserByEmail = jest.spyOn(
        UserService.prototype,
        "getUserByEmail"
      );
      mockGetUserByEmail.mockResolvedValue(
        mockUser as IUserSchema & { _id: ObjectId }
      );

      const mockComparePassword = jest.spyOn(
        UserService.prototype,
        "comparePassword"
      );
      mockComparePassword.mockResolvedValue(true);

      const mockUpdateUserLoginMock = jest.spyOn(
        UserService.prototype,
        "updateUserLogin"
      );
      mockUpdateUserLoginMock.mockResolvedValue(
        mockUser as IUserSchema & { _id: ObjectId }
      );

      const result = await authService.loginUserWithEmailAndPassword(
        email,
        password
      );

      expect(mockGetUserByEmail).toBeCalledWith("test@example.com");
      expect(mockComparePassword).toBeCalledWith(
        "correctPassword",
        "correctPassword"
      );
      expect(mockUpdateUserLoginMock).toBeCalledWith("123");
      expect(result).toBe(mockUser);
    });

    it("should throw UnauthorizedError for invalid credentials", async () => {
      const email = "test@example.com";
      const password = "wrongPassword";

      const mockGetUserByEmail = jest.spyOn(
        UserService.prototype,
        "getUserByEmail"
      );
      mockGetUserByEmail.mockResolvedValue(null);

      await expect(
        authService.loginUserWithEmailAndPassword(email, password)
      ).rejects.toThrowError(UnauthorizedError);
    });
  });
});
