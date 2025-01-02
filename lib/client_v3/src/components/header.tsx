"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Menu, X } from "lucide-react";
import {
  Button,
  defaultButtonClassNameButNotComplicated,
} from "@/components/ui/button";

// Magic strings
const PHONE_NUMBER = "+1 (234) 567-890";
const EMAIL_ADDRESS = "info@ninembs.com";
const COMPANY_NAME = "NineMbs Studio";
const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/quote", label: "Get a Quote" },
];
const BASE_CLASSES =
  "text-gray-600 hover:text-gray-900 transition-colors duration-200";
const MOBILE_CLASSES = "block py-2";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md">
      {/* Top level - Business contact info */}
      <div className="bg-indigo-600 py-2">
        <div className="container mx-auto px-4 flex flex-wrap justify-end items-center text-sm text-white">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              <a href={`tel:${PHONE_NUMBER}`}>{PHONE_NUMBER}</a>
            </span>
            <span className="flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              <a href={`mailto:${EMAIL_ADDRESS}`}>{EMAIL_ADDRESS}</a>
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            {COMPANY_NAME}
          </Link>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>

          {/* Desktop navigation */}
          <div className="hidden lg:flex space-x-4 lg:items-center">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href} mobile>
                {link.label}
              </NavLink>
            ))}
            <Button className="w-full mt-2">Get a Quote</Button>
          </div>
        )}
      </nav>
    </header>
  );
}

function NavLink({
  href,
  children,
  mobile = false,
}: {
  href: string;
  children: React.ReactNode;
  mobile?: boolean;
}) {
  const classes = `${BASE_CLASSES} ${mobile ? MOBILE_CLASSES : ""}`;

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
