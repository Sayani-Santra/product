"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between pt-4 text-sm text-slate-300">
      <div>
        Page <strong className="text-white">{currentPage}</strong> of{" "}
        <strong className="text-white">{totalPages}</strong>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition"
        >
          {"<<"}
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition"
        >
          Previous
        </button>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition"
        >
          Next
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition"
        >
          {">>"}
        </button>
      </div>
    </div>
  );
}