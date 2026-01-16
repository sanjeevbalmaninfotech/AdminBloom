"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// Import the libraries for export functionality
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import axios from "axios";
import {
  ApiResponse,
  ContactUsEntry,
  FilterPayload,
  Pagination,
} from "../api/constant/contactUs";

// --- Icons ---
const SearchIcon = () => (
  <svg
    className="w-5 h-5 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);
const RefreshIcon = ({ spin }: { spin?: boolean }) => (
  <svg
    className={`w-4 h-4 ${spin ? "animate-spin" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);
const ChevronDownIcon = () => (
  <svg
    className="w-4 h-4 text-gray-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);
const FilterIcon = () => (
  <svg
    className="w-4 h-4 mr-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);
const CalendarIcon = () => (
  <svg
    className="w-4 h-4 text-gray-400 absolute left-3 top-3"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);
const FilePdfIcon = () => (
  <svg
    className="w-4 h-4 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);
const FileExcelIcon = () => (
  <svg
    className="w-4 h-4 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

export default function ContactUsPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<ContactUsEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(true);

  // Filter states
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [service, setService] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!loggedIn) {
      router.push("/login");
    }
  }, [router]);

  const fetchData = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const payload: FilterPayload = {};

      // Add filters if they exist
      if (startDate) payload.startDate = new Date(startDate).toISOString();
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        payload.endDate = endDateObj.toISOString();
      }
      if (firstName.trim()) payload.firstName = firstName.trim();
      if (email.trim()) payload.email = email.trim();
      if (service.trim()) payload.service = service.trim();

      // Always send Sort and Pagination parameters
      // This ensures that even if text filters are empty, sorting still works
      if (sortBy) payload.sortBy = sortBy;
      if (sortOrder) payload.sortOrder = sortOrder;

      payload.page = page;
      payload.limit = pagination.limit;

      const apiUrl = "http://localhost:8088/admin/getContactUsData";

      // DIRECTLY send payload. Removed the "hasFilters" check.
      const response = await axios.post<ApiResponse>(apiUrl, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data;

      if (data.success) {
        setEntries(data.responseObject.data);
        setPagination(data.responseObject.pagination);
      } else {
        setError(data.message || "Failed to fetch data");
      }
    } catch (err: unknown) {
      console.error("Fetch error", err);

      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message ||
          err.response?.statusText ||
          "An error occurred while fetching data";
        setError(message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while fetching data");
      }
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (loggedIn) fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => fetchData(1);

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setFirstName("");
    setEmail("");
    setService("");
    setSortBy("createdAt");
    setSortOrder("desc");
    // We call fetchData immediately after clearing states.
    // Since state updates are async, we use a small timeout or useEffect,
    // but the timeout below handles it well enough for this case.
    setTimeout(() => fetchData(1), 0);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchData(newPage);
  };

  const getInitials = (f: string, l: string) => {
    return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase();
  };

  // --- Export Functions ---

  // Helper to format data for export
  const getExportData = () => {
    return entries.map((entry) => ({
      Name: `${entry.firstName} ${entry.lastName}`,
      Email: entry.email,
      Service: entry.service,
      Message: entry.message,
      ContactInfo: entry.phone,
      Date:
        new Date(entry.createdAt).toLocaleDateString() +
        " " +
        new Date(entry.createdAt).toLocaleTimeString(),
    }));
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Contact Inquiries Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Table
    const tableColumn = [
      "Name",
      "Email",
      "Service",
      "Message",
      "Contact Info",
      "Date",
    ];
    const tableRows = entries.map((entry) => [
      `${entry.firstName} ${entry.lastName}`,
      entry.email,
      entry.service,
      entry.message,
      entry.phone || "-",
      new Date(entry.createdAt).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }, // Blue header matching your theme
    });

    doc.save("contact_inquiries.pdf");
  };

  const downloadExcel = () => {
    const data = getExportData();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inquiries");

    // Auto-width for columns
    const max_width = data.reduce((w, r) => Math.max(w, r.Email.length), 10);
    worksheet["!cols"] = [
      { wch: 20 },
      { wch: max_width },
      { wch: 15 },
      { wch: 40 },
      { wch: 15 },
      { wch: 20 },
    ];

    XLSX.writeFile(workbook, "contact_inquiries.xlsx");
  };

  return (
    <div
      className="min-h-screen bg-slate-50 font-sans text-slate-900"
      style={{ fontFamily: "Axiforma, Inter, sans-serif" }}
    >
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Admin Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">Bloom Hospitals</div>
      </nav>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with Action Buttons */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-1">
              Inquiries
            </h2>
            <p className="text-slate-500">
              Manage incoming contact requests and leads.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Export Buttons */}
            <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm mr-2">
              <button
                onClick={downloadPDF}
                disabled={entries.length === 0}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                title="Download PDF"
              >
                <FilePdfIcon /> PDF
              </button>
              <div className="w-px bg-slate-200 my-1 mx-1"></div>
              <button
                onClick={downloadExcel}
                disabled={entries.length === 0}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                title="Download Excel"
              >
                <FileExcelIcon /> Excel
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${
                showFilters
                  ? "bg-slate-100 text-slate-700 border-slate-300"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <FilterIcon /> Filters
            </button>
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              {loading ? <RefreshIcon spin /> : "Refresh Data"}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            showFilters
              ? "max-h-[500px] opacity-100 mb-8"
              : "max-h-0 opacity-0 mb-0"
          }`}
        >
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Filter by Name"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 sm:text-sm transition-all"
                />
              </div>

              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Filter by Email"
                className="block w-full px-4 py-2.5 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 sm:text-sm transition-all"
              />

              <input
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="Filter by Service"
                className="block w-full px-4 py-2.5 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 sm:text-sm transition-all"
              />

              <div className="flex gap-2">
                <div className="relative w-full">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none block w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 sm:text-sm cursor-pointer"
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="firstName">Name</option>
                    <option value="email">Email</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <ChevronDownIcon />
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                  className="px-3 border border-slate-200 bg-slate-50 rounded-lg hover:bg-slate-100 text-slate-600"
                  title="Toggle Sort Order"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-100 pt-4 mt-4">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none sm:w-40">
                  <CalendarIcon />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <span className="text-slate-400 self-center hidden sm:block">
                  -
                </span>

                <div className="relative flex-1 sm:flex-none sm:w-40">
                  <CalendarIcon />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="flex gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-70 shadow-md shadow-blue-100"
                >
                  {loading ? "Updating..." : "Apply Filters"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-500 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-red-800">
              <p className="font-semibold">Error loading data</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Main Table Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          <div className="overflow-x-auto flex-grow">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="bg-slate-50/50">
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    User / Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    Service
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    Message
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    Contact Info
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-24 bg-slate-200 rounded"></div>
                            <div className="h-3 w-32 bg-slate-100 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-48 bg-slate-100 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-24 bg-slate-100 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-20 bg-slate-100 rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center">
                      <div className="mx-auto h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <svg
                          className="h-10 w-10 text-slate-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-slate-900">
                        No records found
                      </h3>
                      <p className="text-slate-500 mt-1">
                        Try adjusting your filters or search terms.
                      </p>
                      <button
                        onClick={handleReset}
                        className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Clear all filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="group hover:bg-slate-50/80 transition-colors duration-150"
                    >
                      {/* User / Email - Minimized width */}
                      <td className="px-6 py-4 whitespace-nowrap w-px">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-tr from-blue-100 to-cyan-100 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-50">
                            {getInitials(entry.firstName, entry.lastName)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                              {entry.firstName} {entry.lastName}
                            </div>
                            <div className="text-sm text-slate-500">
                              {entry.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Service - Minimized width */}
                      <td className="px-6 py-4 whitespace-nowrap w-px">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {entry.service || "General"}
                        </span>
                      </td>

                      {/* Message - EXPANDED (Removed max-w-xs and truncate, added min-w) */}
                      <td className="px-6 py-4">
                        <div
                          className="text-sm text-slate-600 min-w-[300px] break-words line-clamp-2"
                          title={entry.message}
                        >
                          {entry.message}
                        </div>
                      </td>

                      {/* Contact Info - Minimized width */}
                      <td className="px-6 py-4 whitespace-nowrap w-px text-4xl text-slate-600">
                        {entry.phone ? (
                          <span className="font-mono text-base text-slate-600 bg-slate-100 px-3 py-1.5 rounded">
                            {entry.phone}
                          </span>
                        ) : (
                          <span className="text-base text-slate-300">-</span>
                        )}
                      </td>

                      {/* Date - Minimized width */}
                      <td className="px-6 py-4 whitespace-nowrap w-px text-right">
                        <div className="text-sm font-medium text-slate-900">
                          {new Date(entry.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(entry.createdAt).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-900">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {pagination.total}
              </span>{" "}
              entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
                className="px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="hidden sm:flex gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          pagination.page === p
                            ? "bg-slate-900 text-white"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }
                )}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || loading}
                className="px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
