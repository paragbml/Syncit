import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[var(--notes-bg)]">
      <h1 className="text-4xl font-bold mb-4 text-[var(--text-primary)]">404 - Page Not Found</h1>
      <p className="text-[var(--text-secondary)] mb-8">The page you are looking for doesn't exist.</p>
      <Link 
        to={createPageUrl("Notes")} 
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--accent)] text-white"
      >
        <Home size={18} />
        Go to Home
      </Link>
    </div>
  );
}