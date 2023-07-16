import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UsersDoc } from "./schemas/user.schema";
import { Model } from "mongoose";
import { AuthDto } from "./dto";
import * as bcrypt from "bcrypt";
import { Tokens } from "./types";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UsersDoc>,
    private jwtService: JwtService
  ) {}

  async signupLocal({ email, password }: AuthDto): Promise<Tokens> {
    try {
      const user = await this.usersModel.create({ email, password: await this.hashData(password) });

      const tokens = await this.getTokens(user._id.toString(), user.email);
      await this.updateRtHash(user._id.toString(), tokens.refresh_token);

      return tokens;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async signinLocal(body: AuthDto) {
    try {
      const user = await this.usersModel.findOne({ email: body.email });

      if (!user) throw new ForbiddenException("Access denied");

      const match = await bcrypt.compare(body.password, user.password);

      if (!match) throw new ForbiddenException("Wrong credentials");

      const tokens = await this.getTokens(user._id.toString(), user.email);
      await this.updateRtHash(user._id.toString(), tokens.refresh_token);

      return tokens;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async logout(id: string) {
    try {
      return await this.usersModel.findByIdAndUpdate(id, { hashedRt: "" });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async refresh(userId: string, rt: string) {
    try {
      const user = await this.usersModel.findById(userId);
      if (!user || !user.hashedRt) throw new ForbiddenException("Access denied");

      const match = await bcrypt.compare(rt, user.hashedRt);
      if (!match) throw new ForbiddenException("Access denied");

      const tokens = await this.getTokens(user._id.toString(), user.email);
      await this.updateRtHash(user._id.toString(), tokens.refresh_token);

      return tokens;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async updateRtHash(userId: string, rt: string) {
    const hash = await this.hashData(rt);

    try {
      return await this.usersModel.findByIdAndUpdate(userId, { hashedRt: hash });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async hashData(data: string) {
    return await bcrypt.hash(data, 10);
  }

  async getTokens(userId: string, email: string) {
    const [access_token, refresh_token] = await Promise.all([
      await this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        { expiresIn: 60 * 15, secret: "at-secret" }
      ),

      await this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        { expiresIn: 60 * 60 * 24 * 7, secret: "rt-secret" }
      ),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }
}
