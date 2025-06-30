import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import HomeIndex from "@/components/pages/HomeIndex";
import MentorIndex from "@/components/pages/MentorIndex";

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  // Enable static rendering
  setRequestLocale(locale);

  return <MentorIndex />;
}
