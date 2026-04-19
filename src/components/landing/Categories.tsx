"use client";

import { CATEGORIES } from "@/lib/constants";
import Link from "next/link";

export function Categories() {
  return (
    <section id="categories" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Popular <span className="text-gradient-gold">Categories</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Businesses across South Africa need leads in these high-value sectors.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={`/auth/signup?role=hustler&category=${cat.value}`}
              className="card-hover group flex flex-col items-center gap-3 py-8 text-center cursor-pointer"
            >
              <span className="text-4xl">{cat.icon}</span>
              <span className="font-semibold text-white group-hover:text-primary transition-colors text-sm">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
