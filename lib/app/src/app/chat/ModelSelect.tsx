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
import { AVAILABLE_MODELS, AiModel } from "@/constants/models";

interface ModelSelectProps {
  model: string;
  onModelChange: (value: string) => void;
  isSubscribed: boolean;
}

export const ModelSelect: React.FC<ModelSelectProps> = ({
  model,
  onModelChange,
  isSubscribed,
}) => {
  const defaultModel = AVAILABLE_MODELS[0];
  // Group models by provider
  const groupedModels = AVAILABLE_MODELS.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, AiModel[]>);

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="model"
        className="text-sm text-slate-800 dark:text-slate-200 text-bold"
      >
        Model
      </label>
      <Select value={model || defaultModel.id} onValueChange={onModelChange}>
        <SelectTrigger className="w-fit">
          <SelectValue defaultValue={defaultModel.id}>
            {AVAILABLE_MODELS.find((m) => m.id === (model || defaultModel.id))
              ?.name || defaultModel.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {isSubscribed ? (
            // Subscribed users see models grouped by provider
            Object.entries(groupedModels).map(([provider, models]) => (
              <SelectGroup key={provider}>
                <SelectLabel>
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </SelectLabel>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))
          ) : (
            // Non-subscribed users see free/premium separation
            <SelectGroup>
              <SelectLabel>Free Models</SelectLabel>
              <SelectItem value={defaultModel.id}>
                {defaultModel.name}
              </SelectItem>
              <SelectLabel>Premium Models</SelectLabel>
              {AVAILABLE_MODELS.filter((m) => m.id !== defaultModel.id).map(
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
