"use client";
import React from "react";
import { BASE_URL, navigation } from "@/app/data/Navigation";
import { usePathname } from "next/navigation";

function PageHeader1() {
  const pathname = usePathname();
  const nav = navigation.find(({ href }) => href === `${BASE_URL}${pathname}`);
  const title = nav?.title;
  const sub = nav?.sub;
  console.log("pathname", pathname)
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-bold text-theme-blue dark:text-white">
        {title}
      </h1>
      <p className="text-txt-secondary dark:text-txt-secondary-dark">{sub}</p>
    </header>
  );
}

export default PageHeader1;
