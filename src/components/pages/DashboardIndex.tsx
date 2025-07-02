"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Dashboard from "../layout/Dashboard/dashboard";


export default function DashboardIndex() {
  const t = useTranslations("Index");
  const f = useTranslations("Footer");
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    setIsRTL(document.documentElement.dir === "rtl");
  }, []);
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Dashboard />
    </div>
  );
}
