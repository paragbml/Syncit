import React from "react";
import NotesList from "../components/NotesList";

export default function Archive() {
  return (
    <div className="flex h-full">
      <NotesList isArchive={true} />
      <div className="flex-1 hidden md:flex items-center justify-center bg-gray-100 text-gray-500 border-l">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-gray-300">
            <polyline points="21 8 21 21 3 21 3 8"></polyline>
            <rect x="1" y="3" width="22" height="5"></rect>
            <line x1="10" y1="12" x2="14" y2="12"></line>
          </svg>
          <p className="text-lg">Archived Notes</p>
          <p className="text-sm">Select a note to view</p>
        </div>
      </div>
    </div>
  );
}