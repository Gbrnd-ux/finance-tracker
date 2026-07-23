"use client";

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 w-full animate-pulse">
      {/* Skeleton Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="h-10 bg-gray-200 rounded-lg w-48 mb-3"></div>
          <div className="h-4 bg-gray-100 rounded w-64"></div>
        </div>
        <div className="h-10 bg-gray-100 rounded-lg w-32 hidden md:block"></div>
      </div>

      {/* Skeleton Content Area (Top Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center h-28">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 mr-4"></div>
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center h-28">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 mr-4"></div>
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center h-28">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 mr-4"></div>
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>

      {/* Skeleton Main Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm h-96 w-full p-6 flex flex-col gap-4">
             <div className="h-6 bg-gray-200 rounded w-1/4"></div>
             <div className="flex-1 bg-gray-50 rounded-xl"></div>
          </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm h-48 w-full p-6 flex flex-col gap-4">
             <div className="h-6 bg-gray-200 rounded w-1/2"></div>
             <div className="flex-1 bg-gray-50 rounded-xl"></div>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm h-40 w-full p-6 flex flex-col gap-4">
             <div className="h-6 bg-gray-200 rounded w-1/2"></div>
             <div className="flex-1 bg-gray-50 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
