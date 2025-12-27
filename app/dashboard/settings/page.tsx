import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserSettings } from "@/app/actions/settings";
import { ModelList } from "./model-list";
import { AI_MODELS } from "@/lib/ai-models";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const settings = await getUserSettings();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">AI Model Management</h2>
          <p className="text-muted-foreground mb-6">
            Select which AI models should be available in the platform. Disabled models will be hidden from the model selector.
          </p>
          
          <div className="bg-card rounded-xl border p-6">
            <ModelList 
              initialEnabledModels={settings.enabledModels || []} 
              allModels={AI_MODELS} 
            />
          </div>
        </section>
      </div>
    </div>
  );
}
