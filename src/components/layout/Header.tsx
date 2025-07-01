"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronDown, Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LanguageSwitcher from "../LanguageSwitcher";
import Logo from "@/public/assets/images/logo1.png";
import Image from "next/image";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const commonClasses = {
    transition: "transition-all duration-300",
    hover: "hover:text-blue-200",
    font: "font-['Roboto']",
    button: "bg-transparent text-white hover:bg-blue-200 hover:border-blue-200 hover:text-[#003366] transform hover:scale-105 text-base"
  };
  
  const navLinkClasses = `${commonClasses.hover} transition-colors duration-200 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-200 after:transition-all after:duration-300 hover:after:w-full`;
  const mobileNavLinkClasses = `${commonClasses.hover} hover:translate-x-2 ${commonClasses.transition} py-2`;
  const buttonClasses = `${commonClasses.button} ${commonClasses.transition} ${commonClasses.font}`;
  
  return (
    <header className={`w-full bg-[#01589B] text-white ${commonClasses.font} text-base sticky top-0 z-50 transition-shadow duration-300 ${hasScrolled ? 'shadow-lg' : ''}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex-shrink-0">
            <Image src={Logo} alt="Logo" width={200} height={200} className="transform transition-transform duration-300" />
        </div>

        <nav className="hidden md:flex items-center space-x-8 ${commonClasses.font} text-lg tracking-wide">
          <Link href="/" className={navLinkClasses}>Homepage</Link>
          <Link href="/mentor" className={navLinkClasses}>Mentor</Link>
          <Link href="/mentees" className={navLinkClasses}>Mentees</Link>
          <Link href="/courses" className={navLinkClasses}>Course</Link>
          <Link href="/blog" className={navLinkClasses}>Blog</Link>
          <Link href="/contact" className={navLinkClasses}>Contact</Link>
        </nav>
        
        <div className="md:hidden">
          <Button variant="ghost" size="sm" className="text-white hover:bg-blue-800 transition-all duration-300" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6 animate-spin-once" /> : <Menu className="h-6 w-6 hover:rotate-12 transition-transform duration-300" />}
          </Button>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <div className="flex gap-2 sm:gap-4 items-center">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-[#01589B] border-t border-blue-800 animate-in slide-in-from-top duration-300">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link href="/" className={mobileNavLinkClasses} onClick={toggleMenu}>Homepage</Link>
            <Link href="/mentor" className={mobileNavLinkClasses} onClick={toggleMenu}>Mentor</Link>
            <Link href="/mentees" className={mobileNavLinkClasses} onClick={toggleMenu}>Mentees</Link>
            <div className="py-2">
              <div className={`flex items-center justify-between ${commonClasses.hover} hover:translate-x-2 ${commonClasses.transition}`} onClick={() => document.getElementById('mobile-courses')?.classList.toggle('hidden')}>
                Course <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-300" />
              </div>
              <div id="mobile-courses" className="hidden pl-4 mt-2 space-y-2">
                <Link href="/courses/beginner" className={`block ${commonClasses.hover} hover:translate-x-2 ${commonClasses.transition} py-1`} onClick={toggleMenu}>Beginner Courses</Link>
                <Link href="/courses/intermediate" className={`block ${commonClasses.hover} hover:translate-x-2 ${commonClasses.transition} py-1`} onClick={toggleMenu}>Intermediate Courses</Link>
                <Link href="/courses/advanced" className={`block ${commonClasses.hover} hover:translate-x-2 ${commonClasses.transition} py-1`} onClick={toggleMenu}>Advanced Courses</Link>
              </div>
            </div>
            <Link href="/blog" className={mobileNavLinkClasses} onClick={toggleMenu}>Blog</Link>
            <Link href="/contact" className={mobileNavLinkClasses} onClick={toggleMenu}>Contact</Link>
            <div className="flex justify-center gap-4 pt-2">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
