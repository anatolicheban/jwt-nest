import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";
import { Tokens } from "./types";
import { AuthGuard } from "@nestjs/passport";
import { RtGuard } from "src/guards/rt.gard";
import { AtGuard } from "src/guards/at.gard";
import { CurrUser } from "src/decorators/curr.user.dec";
import { Public } from "src/decorators/public";

type PayloadReq = Request & { user: { sub: string; refreshToken: string } };

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/local/signup")
  @HttpCode(HttpStatus.CREATED)
  async signupLocal(@Body() body: AuthDto): Promise<Tokens> {
    return await this.authService.signupLocal(body);
  }

  @Public()
  @Post("/local/signin")
  @HttpCode(HttpStatus.OK)
  async signinLocal(@Body() body: AuthDto): Promise<Tokens> {
    return await this.authService.signinLocal(body);
  }

  @Post("/logout")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  async logout(@CurrUser("sub") user: string) {
    return await this.authService.logout(user);
  }

  @Public()
  @Post("/refresh")
  @HttpCode(HttpStatus.OK)
  @UseGuards(RtGuard)
  async refresh(@CurrUser("refreshToken") token: string, @CurrUser("sub") id: string) {
    return await this.authService.refresh(id, token);
  }
}
