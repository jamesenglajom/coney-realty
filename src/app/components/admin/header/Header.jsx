"use client"
import React from "react";

import { 
  Users, FileText, ShoppingBag, Settings, 
  Menu, X, Search, Bell, ChevronRight 
} from 'lucide-react';

function Header({ isOpen, setOpen }) {
  return (
    <header className="h-16 bg-white dark:bg-[#1a1a1a] border-b border-[#f4f2eb] dark:border-[#333] flex items-center justify-between px-4 lg:px-8">
      <button
        onClick={() => setOpen(!isOpen)}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        className="lg:hidden p-2 text-txt-primary dark:text-txt-primary-dark"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <div className="relative max-w-md w-full hidden md:block">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted"
          size={18}
        />
        <input
          type="text"
          placeholder="Search records (Cmd + K)"
          className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-black border-none rounded-full text-sm focus:ring-2 focus:ring-theme-gold transition-all"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-txt-secondary dark:text-txt-secondary-dark hover:bg-gray-100 dark:hover:bg-white/5 rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-theme-gold rounded-full border-2 border-white dark:border-[#1a1a1a]"></span>
        </button>
      </div>
    </header>
  );
}

export default Header;
