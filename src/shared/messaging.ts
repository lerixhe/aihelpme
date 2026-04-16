import type { AskAiRequest, AskAiResponse, ChatMessage } from "~/shared/types"

export async function askAi(messages: ChatMessage[]): Promise<AskAiResponse> {
  const request: AskAiRequest = {
    type: "AI_HELP_ME_ASK",
    payload: {
      messages
    }
  }

  const response = (await chrome.runtime.sendMessage(request)) as AskAiResponse
  return response
}
