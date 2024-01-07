import { NotFoundError, UnauthorizedError } from "routing-controllers";

import { TokenTypes } from "@common/constants";
import Tokens from "@models/tokens.model";
import { UserService } from "@services/v1";

export class AuthService {
  private readonly tokenModel = Tokens;
  private readonly userService = new UserService();

  async loginUserWithEmailAndPassword(email: string, password: string) {
    const isUser = await this.userService.getUserByEmail(email);

    if (
      !isUser ||
      !(await this.userService.comparePassword(password, isUser.password))
    ) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const user = await this.userService.updateUserLogin(isUser._id);

    return user;
  }

  async logout(refreshToken: string) {
    const token = await this.tokenModel.findOne({
      token: refreshToken,
      type: TokenTypes.REFRESH,
      blacklisted: false,
    });

    if (!token) {
      throw new NotFoundError("Not Found");
    }

    await token.remove();
  }
}
