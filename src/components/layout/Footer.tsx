"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  const f = useTranslations("Footer");
  return (
    <footer className="w-full bg-white border-t border-gray-100 mt-12 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-[#01589B]">protech</span>
            </Link>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-sm font-medium mb-4">PRODUCT</h3>
            <ul className="space-y-2">
              <li><Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</Link></li>
              <li><Link href="/overview" className="text-sm text-gray-600 hover:text-gray-900">Overview</Link></li>
              <li><Link href="/browse" className="text-sm text-gray-600 hover:text-gray-900">Browse</Link></li>
              <li><Link href="/accessibility" className="text-sm text-gray-600 hover:text-gray-900">Accessibility</Link></li>
              <li><Link href="/five" className="text-sm text-gray-600 hover:text-gray-900">Five</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-sm font-medium mb-4">SOLUTIONS</h3>
            <ul className="space-y-2">
              <li><Link href="/brainstorming" className="text-sm text-gray-600 hover:text-gray-900">Brainstorming</Link></li>
              <li><Link href="/ideation" className="text-sm text-gray-600 hover:text-gray-900">Ideation</Link></li>
              <li><Link href="/wireframing" className="text-sm text-gray-600 hover:text-gray-900">Wireframing</Link></li>
              <li><Link href="/research" className="text-sm text-gray-600 hover:text-gray-900">Research</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-sm font-medium mb-4">RESOURCES</h3>
            <ul className="space-y-2">
              <li><Link href="/help-center" className="text-sm text-gray-600 hover:text-gray-900">Help Center</Link></li>
              <li><Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900">Blog</Link></li>
              <li><Link href="/tutorials" className="text-sm text-gray-600 hover:text-gray-900">Tutorials</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-sm font-medium mb-4">COMPANY</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">About</Link></li>
              <li><Link href="/press" className="text-sm text-gray-600 hover:text-gray-900">Press</Link></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {f("copyright")}
        </p>
        <nav className="flex gap-4 sm:gap-6">
          <Link
            className="text-xs hover:underline underline-offset-4 hover:text-primary transition-colors duration-200"
            href="https://github.com/S0vers/i18n-Nextjs-BoilerPlate"
            target="_blank"
            rel="noopener noreferrer"
          >
            {f("githubLink")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}