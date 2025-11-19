'use client';

import { Menu, X, Search, Phone, Mail, Globe } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <>
      {/* Top Utility Bar */}
      <div className="bg-secondary border-b border-border">
        <div className="container">
          <div className="flex justify-between items-center py-2 text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>(408) 123-4567</span>
              </div>
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@example.com</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Language Switcher Placeholder */}
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Globe className="h-4 w-4 mr-1" />
                EN
              </Button>
              {/* Social Icons Placeholder */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Facebook</span>
                  <div className="h-4 w-4 bg-muted rounded"></div>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Instagram</span>
                  <div className="h-4 w-4 bg-muted rounded"></div>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Twitter</span>
                  <div className="h-4 w-4 bg-muted rounded"></div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded"></div>
              <span className="font-bold text-xl">AutoCare Pro</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <div className="relative group">
                <Button variant="ghost" className="text-foreground hover:text-primary">
                  Services
                </Button>
                {/* Mega Menu Dropdown */}
                <div className="absolute top-full left-0 w-screen max-w-md bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-6">
                    <div className="grid grid-cols-1 gap-4">
                      <Link
                        href="/services/ceramic-coating"
                        className="block p-3 rounded-lg hover:bg-accent transition-colors"
                      >
                        <h3 className="font-semibold">Ceramic Coating</h3>
                        <p className="text-sm text-muted-foreground">Premium paint protection</p>
                      </Link>
                      <Link
                        href="/services/ppf"
                        className="block p-3 rounded-lg hover:bg-accent transition-colors"
                      >
                        <h3 className="font-semibold">Paint Protection Film</h3>
                        <p className="text-sm text-muted-foreground">Clear bra installation</p>
                      </Link>
                      <Link
                        href="/services/window-tint"
                        className="block p-3 rounded-lg hover:bg-accent transition-colors"
                      >
                        <h3 className="font-semibold">Window Tinting</h3>
                        <p className="text-sm text-muted-foreground">Professional window films</p>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <Link href="/about" className="text-foreground hover:text-primary transition-colors">
                About
              </Link>

              <Link
                href="/gallery"
                className="text-foreground hover:text-primary transition-colors"
              >
                Gallery
              </Link>

              <Link href="/blog" className="text-foreground hover:text-primary transition-colors">
                Blog
              </Link>

              <Link
                href="/contact"
                className="text-foreground hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={toggleSearch} className="hidden sm:flex">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>

              <Button className="hidden sm:inline-flex">Get Quote</Button>

              {/* Mobile Menu Toggle */}
              <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar (Dropdown) */}
        {isSearchOpen && (
          <div className="border-t border-border bg-background">
            <div className="container py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={toggleMobileMenu} />
          <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-background shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-lg font-semibold">Menu</span>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-4 space-y-2">
              <Link
                href="/services"
                className="block p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <h3 className="font-semibold">Services</h3>
                <p className="text-sm text-muted-foreground">
                  Ceramic Coating, PPF, Window Tinting
                </p>
              </Link>
              <Link
                href="/about"
                className="block p-3 rounded-lg hover:bg-accent transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/gallery"
                className="block p-3 rounded-lg hover:bg-accent transition-colors"
              >
                Gallery
              </Link>
              <Link href="/blog" className="block p-3 rounded-lg hover:bg-accent transition-colors">
                Blog
              </Link>
              <Link
                href="/contact"
                className="block p-3 rounded-lg hover:bg-accent transition-colors"
              >
                Contact
              </Link>
              <div className="pt-4 border-t">
                <Button className="w-full">Get Quote</Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
