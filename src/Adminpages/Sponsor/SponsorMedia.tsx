import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import axios from "axios";
import {
  Trash2,
  Pencil,
  Eye,
  MoreVertical,
  Loader2,
  Play,
  FileText,
  Award,
  Image,
  X,
  Download,
  Search,
} from "lucide-react";

// Interface definitions based on API response structure
interface MediaDocument {
  id: string;
  userId: string;
  title?: string;
  imageUrl?: string;
  issuedBy?: string;
  issuedDate?: string;
  description?: string;
  type: "certificate" | "award";
  createdAt: string;
  updatedAt: string;
}

interface MediaFile {
  id: string;
  userId: string;
  title?: string;
  url: string;
  type: "video" | "photo";
  createdAt: string;
  updatedAt: string;
}

interface MediaResponse {
  documents: {
    data: MediaDocument[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  media: {
    data: MediaFile[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

interface SponsorMediaData {
  sponsorId: string;
  documents: MediaDocument[];
  media: MediaFile[];
  totalDocuments: number;
  totalMedia: number;
}

interface ModalData {
  isOpen: boolean;
  type: "videos" | "photos" | "awards" | "certificates";
  sponsorId: string;
  items: (MediaFile | MediaDocument)[];
  title: string;
}

const PaginationBar = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex justify-between items-center px-4 py-4 border-t bg-white dark:bg-gray-900">
      <span className="text-xs text-gray-700 dark:text-gray-300">
        Showing {startItem} to {endItem} of {totalItems}
      </span>
      <div className="flex rounded overflow-hidden border border-gray-300 dark:border-gray-700 gap-0.5 bg-white dark:bg-gray-800">
        <button
          className={`w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
            currentPage === 1 ? "opacity-40 cursor-not-allowed" : ""
          }`}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          &#60;
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }

          return (
            <button
              key={pageNum}
              className={`w-8 h-8 text-xs flex items-center justify-center ${
                currentPage === pageNum
                  ? "bg-blue-100 text-blue-700 font-semibold border border-blue-400"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          className={`w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
            currentPage === totalPages ? "opacity-40 cursor-not-allowed" : ""
          }`}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          &#62;
        </button>
      </div>
    </div>
  );
};

const SponsorMedia: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [mediaData, setMediaData] = useState<SponsorMediaData[]>([]);
  const [filteredData, setFilteredData] = useState<SponsorMediaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [months] = useState([
    "All Months",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]);
  const [modal, setModal] = useState<ModalData>({
    isOpen: false,
    type: "videos",
    sponsorId: "",
    items: [],
    title: "",
  });

  const itemsPerPage = 7;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fetch sponsor media data
  const fetchSponsorMedia = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_PORT}/sponsor/media`,
        {
          params: {
            page: 1,
            limit: 10, // Get all data for client-side pagination
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "api-key": token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const mediaResponse: MediaResponse = response.data;

        // Process the data to group by sponsor/user
        const sponsorMediaMap = new Map<string, SponsorMediaData>();

        // Process documents
        if (
          mediaResponse.documents &&
          mediaResponse.documents.data &&
          mediaResponse.documents.data.length > 0
        ) {
          mediaResponse.documents.data.forEach((doc) => {
            if (!sponsorMediaMap.has(doc.userId)) {
              sponsorMediaMap.set(doc.userId, {
                sponsorId: doc.userId,
                documents: [],
                media: [],
                totalDocuments: 0,
                totalMedia: 0,
              });
            }
            const sponsorData = sponsorMediaMap.get(doc.userId)!;
            sponsorData.documents.push(doc);
            sponsorData.totalDocuments++;
          });
        }

        // Process media files
        if (
          mediaResponse.media &&
          mediaResponse.media.data &&
          mediaResponse.media.data.length > 0
        ) {
          mediaResponse.media.data.forEach((media) => {
            if (!sponsorMediaMap.has(media.userId)) {
              sponsorMediaMap.set(media.userId, {
                sponsorId: media.userId,
                documents: [],
                media: [],
                totalDocuments: 0,
                totalMedia: 0,
              });
            }
            const sponsorData = sponsorMediaMap.get(media.userId)!;
            sponsorData.media.push(media);
            sponsorData.totalMedia++;
          });
        }

        const processedData = Array.from(sponsorMediaMap.values());
        setMediaData(processedData);
        setFilteredData(processedData);
        setTotalItems(processedData.length);
      }
    } catch (error: any) {
      console.error("Error fetching sponsor media:", error);

      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (error.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else if (error.response?.status === 404) {
        setError("Sponsor media endpoint not found.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(
          error.response?.data?.message || "Failed to fetch sponsor media data"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search and month
  useEffect(() => {
    let filtered = mediaData;

    // Filter by search term (sponsor ID)
    if (searchTerm) {
      filtered = filtered.filter((sponsor) =>
        sponsor.sponsorId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by month
    if (selectedMonth && selectedMonth !== "All Months") {
      filtered = filtered.filter((sponsor) => {
        // Check if any media/document was created in the selected month
        const hasMatchingMonth = [...sponsor.media, ...sponsor.documents].some(
          (item) => {
            const itemMonth = new Date(item.createdAt).toLocaleDateString(
              "en-US",
              { month: "long" }
            );
            return itemMonth === selectedMonth;
          }
        );
        return hasMatchingMonth;
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [mediaData, searchTerm, selectedMonth]);

  useEffect(() => {
    fetchSponsorMedia();
  }, []);

  // Helper functions
  const getMediaCount = (media: MediaFile[], type: "video" | "photo") => {
    return media.filter((item) => item.type === type).length;
  };

  const getDocumentCount = (
    documents: MediaDocument[],
    type: "certificate" | "award"
  ) => {
    return documents.filter((doc) => doc.type === type).length;
  };

  const getSponsorStatus = (sponsorData: SponsorMediaData) => {
    const hasMedia = sponsorData.totalMedia > 0;
    const hasDocuments = sponsorData.totalDocuments > 0;

    if (hasMedia && hasDocuments) {
      return { status: "Completed", class: "bg-green-200 text-green-800" };
    } else if (hasMedia || hasDocuments) {
      return { status: "Partial", class: "bg-yellow-200 text-yellow-800" };
    } else {
      return { status: "Pending", class: "bg-red-200 text-red-800" };
    }
  };

  const openModal = (
    type: "videos" | "photos" | "awards" | "certificates",
    sponsorId: string,
    sponsorData: SponsorMediaData
  ) => {
    let items: (MediaFile | MediaDocument)[] = [];
    let title = "";

    switch (type) {
      case "videos":
        items = sponsorData.media.filter((item) => item.type === "video");
        title = "Videos";
        break;
      case "photos":
        items = sponsorData.media.filter((item) => item.type === "photo");
        title = "Photos";
        break;
      case "awards":
        items = sponsorData.documents.filter((doc) => doc.type === "award");
        title = "Awards";
        break;
      case "certificates":
        items = sponsorData.documents.filter(
          (doc) => doc.type === "certificate"
        );
        title = "Certificates";
        break;
    }

    setModal({
      isOpen: true,
      type,
      sponsorId,
      items,
      title,
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      type: "videos",
      sponsorId: "",
      items: [],
      title: "",
    });
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-semibold">Sponsor's Media</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading sponsor media...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 sm:p-8">
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <AlertDescription className="text-red-800 dark:text-red-400">
              {error}
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={fetchSponsorMedia}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          <h2 className="text-2xl font-semibold">Sponsor's Media</h2>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64 dark:bg-slate-600 dark:text-white rounded-lg">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Search by Sponsor ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full dark:bg-slate-700 text-sm sm:text-base"
              />
            </div>
            <select
              className="border px-3 py-2 rounded-md bg-white dark:bg-gray-900 w-full sm:w-auto"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map((month, index) => (
                <option key={index} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox />
                </TableHead>
                <TableHead className="min-w-[160px] text-left">
                  Sponsor Name
                </TableHead>
                <TableHead className="min-w-[120px] text-center">
                  Photos
                </TableHead>
                <TableHead className="min-w-[120px] text-center">
                  Videos
                </TableHead>
                <TableHead className="min-w-[120px] text-center">
                  Certificates
                </TableHead>
                <TableHead className="min-w-[120px] text-center">
                  Awards
                </TableHead>
                <TableHead className="min-w-[120px] text-center">
                  Affiliation
                </TableHead>
                <TableHead className="min-w-[120px] text-center">
                  Status
                </TableHead>
                <TableHead className="min-w-[140px] text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-gray-500"
                  >
                    {mediaData.length === 0
                      ? "No sponsor media found"
                      : "No sponsors match your search criteria"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((sponsorData, idx) => {
                  const statusInfo = getSponsorStatus(sponsorData);
                  const videoCount = getMediaCount(sponsorData.media, "video");
                  const photoCount = getMediaCount(sponsorData.media, "photo");
                  const awardCount = getDocumentCount(
                    sponsorData.documents,
                    "award"
                  );
                  const certificateCount = getDocumentCount(
                    sponsorData.documents,
                    "certificate"
                  );

                  return (
                    <TableRow
                      key={idx}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <TableCell className="text-center align-middle py-4">
                        <Checkbox />
                      </TableCell>
                      <TableCell className="align-middle py-4">
                        <Link
                          to={`/admin/sponsor-profile/${sponsorData.sponsorId}`}
                          className="underline text-blue-600 hover:text-blue-800"
                        >
                          Sponsor
                        </Link>
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          {sponsorData.sponsorId.substring(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell className="text-center align-middle py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Image className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">{photoCount}</span>
                        </div>
                        {photoCount > 0 && (
                          <button
                            onClick={() =>
                              openModal(
                                "photos",
                                sponsorData.sponsorId,
                                sponsorData
                              )
                            }
                            className="text-blue-600 underline hover:text-blue-800 text-xs block mt-1"
                          >
                            View
                          </button>
                        )}
                      </TableCell>
                      <TableCell className="text-center align-middle py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Play className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{videoCount}</span>
                        </div>
                        {videoCount > 0 && (
                          <button
                            onClick={() =>
                              openModal(
                                "videos",
                                sponsorData.sponsorId,
                                sponsorData
                              )
                            }
                            className="text-blue-600 underline hover:text-blue-800 text-xs block mt-1"
                          >
                            View
                          </button>
                        )}
                      </TableCell>
                      <TableCell className="text-center align-middle py-4">
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <span className="font-medium">
                            {certificateCount}
                          </span>
                        </div>
                        {certificateCount > 0 && (
                          <button
                            onClick={() =>
                              openModal(
                                "certificates",
                                sponsorData.sponsorId,
                                sponsorData
                              )
                            }
                            className="text-blue-600 underline hover:text-blue-800 text-xs block mt-1"
                          >
                            View
                          </button>
                        )}
                      </TableCell>
                      <TableCell className="text-center align-middle py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Award className="w-4 h-4 text-yellow-600" />
                          <span className="font-medium">{awardCount}</span>
                        </div>
                        {awardCount > 0 && (
                          <button
                            onClick={() =>
                              openModal(
                                "awards",
                                sponsorData.sponsorId,
                                sponsorData
                              )
                            }
                            className="text-blue-600 underline hover:text-blue-800 text-xs block mt-1"
                          >
                            View
                          </button>
                        )}
                      </TableCell>
                      <TableCell className="text-center align-middle py-4">
                        -
                      </TableCell>
                      <TableCell className="text-center align-middle py-4">
                        <Badge
                          className={`${statusInfo.class} px-3 py-1 w-24 text-xs sm:text-sm mx-auto rounded`}
                        >
                          {statusInfo.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center align-middle py-4">
                        <div className="flex gap-2 justify-center">
                          <Button size="icon" variant="ghost">
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Pencil className="w-5 h-5 text-gray-600 dark:text-white" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Eye className="w-5 h-5 text-gray-600 dark:text-white" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-white" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Modal */}
        {modal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-xs">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-[80vw] max-w-6xl h-[90vh] flex flex-col px-16">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {modal.title} - Sponsor {modal.sponsorId.substring(0, 8)}...
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {modal.items.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No {modal.title.toLowerCase()} found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modal.items.map((item, index) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700"
                      >
                        {/* Media Display */}
                        <div className="aspect-video bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                          {modal.type === "videos" && (
                            <video
                              controls
                              className="w-full h-full object-cover"
                              poster=""
                            >
                              <source
                                src={(item as MediaFile).url}
                                type="video/mp4"
                              />
                              Your browser does not support the video tag.
                            </video>
                          )}
                          {modal.type === "photos" && (
                            <img
                              src={(item as MediaFile).url}
                              alt={item.title || `Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src =
                                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDEzVjE5QzIxIDIwLjEgMjAuMSAyMSAxOSAyMUg1QzMuOSAyMSAzIDIwLjEgMyAxOVYxM0gxVjE5QzEgMjEuMSAyLjkgMjMgNSAyM0gxOUMyMS4xIDIzIDIzIDIxLjEgMjMgMTlWMTNIMjFaIiBmaWxsPSIjOTk5OTk5Ii8+CjxwYXRoIGQ9Ik0xMSAyVjE3TDcgMTNMMTEgMTdMMTUgMTNMMTEgMTdWMlYyWiIgZmlsbD0iIzk5OTk5OSIvPgo8L3N2Zz4=";
                              }}
                            />
                          )}
                          {(modal.type === "awards" ||
                            modal.type === "certificates") && (
                            <img
                              src={(item as MediaDocument).imageUrl || ""}
                              alt={
                                item.title ||
                                `${modal.type.slice(0, -1)} ${index + 1}`
                              }
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src =
                                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDEzVjE5QzIxIDIwLjEgMjAuMSAyMSAxOSAyMUg1QzMuOSAyMSAzIDIwLjEgMyAxOVYxM0gxVjE5QzEgMjEuMSAyLjkgMjMgNSAyM0gxOUMyMS4xIDIzIDIzIDIxLjEgMjMgMTlWMTNIMjFaIiBmaWxsPSIjOTk5OTk5Ii8+CjxwYXRoIGQ9Ik0xMSAyVjE3TDcgMTNMMTEgMTdMMTUgMTNMMTEgMTdWMlYyWiIgZmlsbD0iIzk5OTk5OSIvPgo8L3N2Zz4=";
                              }}
                            />
                          )}
                        </div>

                        {/* Item Info */}
                        <div className="p-3">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                            {item.title ||
                              `Untitled ${modal.type.slice(0, -1)}`}
                          </h3>

                          {/* Additional info for documents */}
                          {(modal.type === "awards" ||
                            modal.type === "certificates") && (
                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                              {(item as MediaDocument).issuedBy && (
                                <p>
                                  <span className="font-medium">
                                    Issued by:
                                  </span>{" "}
                                  {(item as MediaDocument).issuedBy}
                                </p>
                              )}
                              {(item as MediaDocument).issuedDate && (
                                <p>
                                  <span className="font-medium">Date:</span>{" "}
                                  {new Date(
                                    (item as MediaDocument).issuedDate!
                                  ).toLocaleDateString()}
                                </p>
                              )}
                              {(item as MediaDocument).description && (
                                <p>
                                  <span className="font-medium">
                                    Description:
                                  </span>{" "}
                                  {(item as MediaDocument).description}
                                </p>
                              )}
                            </div>
                          )}

                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>

                          {/* Action buttons */}
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => {
                                const url =
                                  modal.type === "videos" ||
                                  modal.type === "photos"
                                    ? (item as MediaFile).url
                                    : (item as MediaDocument).imageUrl;
                                if (url)
                                  downloadFile(
                                    url,
                                    item.title ||
                                      `${modal.type.slice(0, -1)}_${index + 1}`
                                  );
                              }}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorMedia;
