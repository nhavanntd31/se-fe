"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Github, Copy, Check, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import OmitRTL from "../OmmitRlt";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Dashboard from "../layout/Dashboard/dashboard";

function CopyableCode({ children }: { children: string }) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    });
  };

  return (
    <div className="relative">
      <pre className="bg-gray-100 p-4 rounded overflow-x-auto hover:bg-gray-200 transition-colors duration-200">
        <code>{children}</code>
      </pre>
      <Button
        variant="outline"
        size="icon"
        className="absolute top-2 right-2"
        onClick={copyToClipboard}
      >
        <p className="sr-only">Cope code button</p>
        {isCopied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

export default function DashboardIndex() {
  const t = useTranslations("Index");
  const f = useTranslations("Footer");
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    setIsRTL(document.documentElement.dir === "rtl");
  }, []);
  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* <Header /> */}
      <Dashboard />
      <Footer />
    </div>
  );
}
