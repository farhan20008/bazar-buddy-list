
import { useLanguage } from "@/contexts/LanguageContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getText } from "@/utils/translations";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, toggleLanguage, isEnglish } = useLanguage();
  
  return (
    <div className="flex items-center space-x-2">
      <Globe size={16} className="text-muted-foreground" />
      <Switch 
        id="language-mode" 
        checked={!isEnglish}
        onCheckedChange={toggleLanguage}
        aria-label="Toggle language"
      />
      <Label htmlFor="language-mode" className="text-sm font-medium cursor-pointer">
        {getText("language", language)}
      </Label>
    </div>
  );
}
