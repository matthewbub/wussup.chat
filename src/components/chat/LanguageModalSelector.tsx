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
import { AVAILABLE_MODELS, AiModel, providers } from "@/constants/models";
import clsx from "clsx";

const IS_LOCAL_MODE = process.env.NEXT_PUBLIC_LOCAL_MODE === "true";

interface ModelSelectProps {
  model: string;
  onModelChange: (value: string) => void;
  isSubscribed: boolean;
}

export const LanguageModalSelector: React.FC<ModelSelectProps> = ({
  model,
  onModelChange,
  isSubscribed,
}) => {
  const defaultModel = AVAILABLE_MODELS[0];
  // Group models by provider
  const groupedModels = AVAILABLE_MODELS.reduce(
    (acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    },
    {} as Record<string, AiModel[]>
  );

  const hasFullAccess = IS_LOCAL_MODE || isSubscribed;

  return (
    <div className="flex items-center gap-2 bg-[hsl(240,10%,3.9%)] text-white rounded-lg">
      <label
        htmlFor="model"
        className="sr-only text-sm text-slate-300 font-bold flex items-center gap-2"
      >
        Model
      </label>
      <Select value={model || defaultModel.id} onValueChange={onModelChange}>
        <SelectTrigger className="w-fit bg-transparent border-none text-white">
          <SelectValue defaultValue={defaultModel.id}>
            {AVAILABLE_MODELS.find((m) => m.id === (model || defaultModel.id))
              ?.name || defaultModel.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-[hsl(240,10%,5%)] border-[hsl(240,10%,15%)] text-white">
          {providers.map((provider) => (
            <SelectGroup key={provider}>
              <SelectLabel
                className={clsx("text-slate-200 font-bold text-sm border-b", {
                  "border-t": provider !== providers[0],
                })}
              >
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </SelectLabel>
              {groupedModels[provider].map((model) => (
                <SelectItem
                  key={model.id}
                  value={model.id}
                  disabled={!hasFullAccess && !model.free}
                  className="text-slate-200 hover:bg-[hsl(240,10%,10%)] hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    {!hasFullAccess && !model.free && (
                      <Lock className="h-3 w-3 text-orange-500" />
                    )}
                    <span
                      className={
                        !hasFullAccess && !model.free ? "opacity-50" : ""
                      }
                    >
                      {model.name}
                    </span>
                    {model.free && !IS_LOCAL_MODE ? (
                      <span className="text-xs text-green-400 ml-1">
                        (Free)
                      </span>
                    ) : null}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
          {/* <div className={clsx(selectItemClassName, "border-t")}>
            <button onClick={() => alert("hola")}>Request a model</button>
          </div> */}
        </SelectContent>
      </Select>
    </div>
  );
};
