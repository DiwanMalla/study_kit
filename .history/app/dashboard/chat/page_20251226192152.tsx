import { EnhancedAskAI } from "@/components/ask-ai";
import { getUserSettings } from "@/app/actions/settings";

export default async function ChatPage() {
  const settings = await getUserSettings();

  return (
    <div className="h-full w-full overflow-hidden">
      <EnhancedAskAI enabledModels={settings.enabledModels} />
    </div>
  );
}
