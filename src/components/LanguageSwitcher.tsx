
import { useLanguage } from "@/contexts/LanguageContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getText } from "@/utils/translations";

export function LanguageSwitcher() {
  const { language, toggleLanguage, isEnglish } = useLanguage();
  
  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="language-mode" 
        checked={!isEnglish}
        onCheckedChange={toggleLanguage}
      />
      <Label htmlFor="language-mode" className="text-sm font-medium">
        {getText("language", language)}
      </Label>
    </div>
  );
}
