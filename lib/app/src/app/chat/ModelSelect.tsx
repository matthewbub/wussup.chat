import { Lock } from "lucide-react";
import {
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/select";

interface ModelSelectProps {
  model: string;
  onModelChange: (value: string) => void;
  isSubscribed: boolean;
}

// Define model types for better organization
interface Model {
  id: string;
  name: string;
  provider: "openai" | "anthropic"; // Add more providers as needed
}

const AVAILABLE_MODELS: Model[] = [
  { id: "chatgpt-4o-latest", name: "ChatGPT 4o Latest", provider: "openai" },
  { id: "gpt-4o", name: "GPT 4o", provider: "openai" },
  { id: "gpt-4o-mini", name: "GPT 4o Mini", provider: "openai" },
  { id: "o1", name: "O1", provider: "openai" },
  { id: "o1-mini", name: "O1 Mini", provider: "openai" },
];

export const ModelSelect: React.FC<ModelSelectProps> = ({
  model,
  onModelChange,
  isSubscribed,
}) => {
  // Group models by provider
  const groupedModels = AVAILABLE_MODELS.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, Model[]>);

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="model" className="text-sm text-neutral-content text-bold">
        Model
      </label>
      <Select value={model} onValueChange={onModelChange}>
        <SelectTrigger className="select select-bordered select-sm text-neutral-content w-fit">
          <SelectValue placeholder="Select Model" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800">
          {isSubscribed ? (
            // Subscribed users see models grouped by provider
            Object.entries(groupedModels).map(([provider, models]) => (
              <SelectGroup key={provider}>
                <SelectLabel>
                  <span className="text-slate-400 text-xs mt-2 capitalize">
                    {provider}
                  </span>
                </SelectLabel>
                {models.map((model) => (
                  <SelectItem
                    key={model.id}
                    value={model.id}
                    className="text-slate-200"
                  >
                    <span className="text-slate-200">{model.name}</span>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))
          ) : (
            // Non-subscribed users see free/premium separation
            <SelectGroup>
              <SelectLabel>
                <span className="text-slate-400 text-xs mt-2">Free Models</span>
              </SelectLabel>
              <SelectItem value="chatgpt-4o-latest" className="text-slate-200">
                ChatGPT 4o Latest
              </SelectItem>
              <SelectLabel className="text-slate-400 text-xs mt-2">
                Premium Models
              </SelectLabel>
              {AVAILABLE_MODELS.filter((m) => m.id !== "chatgpt-4o-latest").map(
                (model) => (
                  <SelectItem
                    key={model.id}
                    value={model.id}
                    disabled={!isSubscribed}
                  >
                    <div className="flex items-center gap-2">
                      <Lock className="h-3 w-3 text-orange-500" />
                      <span className="text-slate-200 disabled:opacity-50">
                        {model.name}
                      </span>
                    </div>
                  </SelectItem>
                )
              )}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
