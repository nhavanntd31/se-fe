"use client";

import { useEffect, useState } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Globe, CheckIcon } from "lucide-react";
import Image from "next/image";
import enFlag from "@/public/assets/svg/en_flag.svg";
import vnFlag from "@/public/assets/svg/vie_flag.svg";

const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLanguage, setCurrentLanguage] = useState("en");

  useEffect(() => {
    const savedLanguage =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("NEXT_LOCALE="))
        ?.split("=")[1] || "en";
    setCurrentLanguage(savedLanguage);

    const urlLanguage = pathname.split("/")[1];
    if (["en", "vie"].includes(urlLanguage)) {
      setCurrentLanguage(urlLanguage);
    }
  }, [pathname]);

  const changeLanguage = (newLanguage: string) => {
    setCurrentLanguage(newLanguage);
    document.cookie = `NEXT_LOCALE=${newLanguage}; path=/;`;

    const segments = pathname.split("/");
    if (["en", "vie"].includes(segments[1])) {
      segments[1] = newLanguage;
    } else {
      segments.splice(1, 0, newLanguage);
    }

    router.push(segments.join("/"));
    router.refresh();
  };

  const languageLabels = {
    en: "English",
    vie: "Tiếng Việt",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="p-0 hover:text-black hover:bg-transparent">
          <Globe className="h-4 w-4 text-white transition-colors duration-200" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem 
          onClick={() => changeLanguage("en")} 
          className={`flex items-center gap-2 py-2 px-3 ${currentLanguage === "en" ? "bg-green-100 rounded-md" : ""}`}
        >
          <Image src={enFlag} alt="English" width={20} height={20} />
          <span>English</span>
          {currentLanguage === "en" && <CheckIcon className="h-5 w-5 ml-auto text-[#01589B]" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage("vie")} 
          className={`flex items-center gap-2 py-2 px-3 ${currentLanguage === "vie" ? "bg-blue-100 rounded-md" : ""}`}
        >
          <Image src={vnFlag} alt="Tiếng Việt" width={20} height={20} />
          <span>Tiếng Việt</span>
          {currentLanguage === "vie" && <CheckIcon className="h-5 w-5 ml-auto text-[#01589B]" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
