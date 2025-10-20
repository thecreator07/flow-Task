import { Module } from "@nestjs/common";
import { AiSuggestController } from "./ai-suggest.controller";
import { AiSuggestService } from "./ai-suggest.service";

@Module({
  controllers: [AiSuggestController],
  providers: [AiSuggestService],
})
export class AiSuggestModule {}
