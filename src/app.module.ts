import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { PokemonModule } from "./pokemon/pokemon.module";
import { MongooseModule } from "@nestjs/mongoose";
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import * as process from "process";
import { ConfigModule } from "@nestjs/config";
import { EnvConfiguration } from "./config/app.config";
import { JoiValidationSchema } from "./config/joi.validation";

@Module({
  imports: [
    ConfigModule.forRoot({
      load:[EnvConfiguration],
      validationSchema: JoiValidationSchema,
    }),
    // GENERA CONTENIDO ESTATICO
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "public")
    }),


    MongooseModule.forRoot(process.env.MONGODB),

    PokemonModule,

    CommonModule,

    SeedModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {

}
