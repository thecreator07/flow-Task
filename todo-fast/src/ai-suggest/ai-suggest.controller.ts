import { Body, Controller, Post } from "@nestjs/common";
import { AiSuggestService } from "./ai-suggest.service";

@Controller("ai-suggest")
export class AiSuggestController {
  constructor(private readonly aiSuggestService: AiSuggestService) {}

  @Post("improvement")
  async suggestImprovements(
    @Body("description") description: string,
  ): Promise<string> {
    return this.aiSuggestService.suggestTaskDescriptionImprovements(
      description,
    );
  }
}
