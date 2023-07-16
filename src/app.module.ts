import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { AtGuard } from "./guards/at.gard";

@Module({
  imports: [DatabaseModule, ConfigModule.forRoot({ isGlobal: true }), AuthModule],
  providers: [
    {
      provide: "APP_GUARD",
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
