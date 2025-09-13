import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import axios from "axios";

import {
  Trash2,
  Eye,
  MoreHorizontal,
  Pencil,
  Loader2,
  Play,
  FileText,
  Award,
  Image,
  X,
  Download,
  ExternalLink,
} from "lucide-react";

// Update MediaFile interface based on your API response
interface MediaDocument {
  id: string;
  userId: string;
  title?: string;
  imageUrl?: string; // Changed from documentUrl to imageUrl
  issuedBy?: string;
  issuedDate?: string;
  description?: string;
  type: "certificate" | "award"; // Updated to match API response
  createdAt: string;
  updatedAt: string;
}

interface MediaFile {
  id: string;
  userId: string;
  title?: string;
  url: string; // Changed from mediaUrl to url
  type: "video" | "photo"; // Updated to match API response
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

interface PlayerMediaData {
  playerId: string;
  documents: MediaDocument[];
  media: MediaFile[];
  totalDocuments: number;
  totalMedia: number;
}

interface ModalData {
  isOpen: boolean;
  type: "videos" | "photos" | "awards" | "certificates";
  playerId: string;
  items: (MediaFile | MediaDocument)[];
  title: string;
}

const Media = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [mediaData, setMediaData] = useState<PlayerMediaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [modal, setModal] = useState<ModalData>({
    isOpen: false,
    type: "videos",
    playerId: "",
    items: [],
    title: "",
  });

  const pageSize = 10;
  const totalPages = Math.ceil(totalItems / pageSize);

  const fetchMedia = async (page: number) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const response = await axios.get(
        `${import.meta.env.VITE_PORT || "http://localhost:3000"}/player/media`,
        {
          params: {
            page: page,
            limit: pageSize,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "API-Key": token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const mediaResponse: MediaResponse = response.data;

        // Process the data to group by user/player
        const playerMediaMap = new Map<string, PlayerMediaData>();

        // Process documents
        if (
          mediaResponse.documents &&
          mediaResponse.documents.data &&
          mediaResponse.documents.data.length > 0
        ) {
          mediaResponse.documents.data.forEach((doc) => {
            if (!playerMediaMap.has(doc.userId)) {
              playerMediaMap.set(doc.userId, {
                playerId: doc.userId,
                documents: [],
                media: [],
                totalDocuments: 0,
                totalMedia: 0,
              });
            }
            const playerData = playerMediaMap.get(doc.userId)!;
            playerData.documents.push(doc);
            playerData.totalDocuments++;
          });
        }

        // Process media files
        if (
          mediaResponse.media &&
          mediaResponse.media.data &&
          mediaResponse.media.data.length > 0
        ) {
          mediaResponse.media.data.forEach((media) => {
            if (!playerMediaMap.has(media.userId)) {
              playerMediaMap.set(media.userId, {
                playerId: media.userId,
                documents: [],
                media: [],
                totalDocuments: 0,
                totalMedia: 0,
              });
            }
            const playerData = playerMediaMap.get(media.userId)!;
            playerData.media.push(media);
            playerData.totalMedia++;
          });
        }

        const processedData = Array.from(playerMediaMap.values());
        setMediaData(processedData);

        const totalUniquePlayers = playerMediaMap.size;
        setTotalItems(totalUniquePlayers);
      }
    } catch (error: any) {
      console.error("Error fetching media:", error);

      if (error.response?.status === 401) {
        setError("Unauthorized. Please login again.");
      } else if (error.response?.status === 400) {
        setError("Invalid request parameters.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to fetch media. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Updated to only count videos and photos
  const getMediaCount = (media: MediaFile[], type: "video" | "photo") => {
    return media.filter((item) => item.type === type).length;
  };

  // Updated to match API response types
  const getDocumentCount = (
    documents: MediaDocument[],
    type: "certificate" | "award"
  ) => {
    return documents.filter((doc) => doc.type === type).length;
  };

  const getPlayerStatus = (playerData: PlayerMediaData) => {
    const hasMedia = playerData.totalMedia > 0;
    const hasDocuments = playerData.totalDocuments > 0;

    if (hasMedia && hasDocuments) {
      return { status: "Completed", class: "bg-green-100 text-green-700" };
    } else if (hasMedia || hasDocuments) {
      return { status: "Partial", class: "bg-yellow-100 text-yellow-700" };
    } else {
      return { status: "Pending", class: "bg-red-100 text-red-700" };
    }
  };

  const openModal = (
    type: "videos" | "photos" | "awards" | "certificates",
    playerId: string,
    playerData: PlayerMediaData
  ) => {
    let items: (MediaFile | MediaDocument)[] = [];
    let title = "";

    switch (type) {
      case "videos":
        items = playerData.media.filter((item) => item.type === "video");
        title = "Videos";
        break;
      case "photos":
        items = playerData.media.filter((item) => item.type === "photo");
        title = "Photos";
        break;
      case "awards":
        items = playerData.documents.filter((doc) => doc.type === "award");
        title = "Awards";
        break;
      case "certificates":
        items = playerData.documents.filter(
          (doc) => doc.type === "certificate"
        );
        title = "Certificates";
        break;
    }

    setModal({
      isOpen: true,
      type,
      playerId,
      items,
      title,
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      type: "videos",
      playerId: "",
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

  const openInNewTab = (url: string) => {
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-semibold">Player's Media</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading media...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold">Player's Media</h2>
        <Button
          onClick={() => fetchMedia(currentPage)}
          variant="outline"
          size="sm"
        >
          Refresh
        </Button>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <AlertDescription className="text-red-800 dark:text-red-400">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-xl border bg-white overflow-x-auto shadow-sm dark:bg-gray-800">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>Player ID</TableHead>
              <TableHead>Videos</TableHead>
              <TableHead>Photos</TableHead>
              <TableHead>Awards</TableHead>
              <TableHead>Certificates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {mediaData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  No media data found
                </TableCell>
              </TableRow>
            ) : (
              mediaData.map((playerData, idx) => {
                const statusInfo = getPlayerStatus(playerData);
                const videoCount = getMediaCount(playerData.media, "video");
                const photoCount = getMediaCount(playerData.media, "photo");
                const awardCount = getDocumentCount(
                  playerData.documents,
                  "award"
                );
                const certificateCount = getDocumentCount(
                  playerData.documents,
                  "certificate"
                );

                return (
                  <TableRow key={idx} className="border-b last:border-b-0">
                    <TableCell className="px-3 py-2 align-middle">
                      <Checkbox />
                    </TableCell>

                    <TableCell className="px-3 py-2 align-middle">
                      <Link
                        to={`/player-profile/${playerData.playerId}`}
                        className="text-blue-600 underline hover:text-blue-800 font-medium"
                      >
                        Player
                      </Link>
                      <div className="text-xs text-gray-500 font-mono mt-1">
                        {playerData.playerId.substring(0, 8)}...
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{videoCount}</span>
                      </div>
                      {videoCount > 0 && (
                        <button
                          onClick={() =>
                            openModal("videos", playerData.playerId, playerData)
                          }
                          className="text-blue-600 underline hover:text-blue-800 text-xs block mt-1"
                        >
                          View All
                        </button>
                      )}
                    </TableCell>

                    <TableCell className="px-3 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">{photoCount}</span>
                      </div>
                      {photoCount > 0 && (
                        <button
                          onClick={() =>
                            openModal("photos", playerData.playerId, playerData)
                          }
                          className="text-blue-600 underline hover:text-blue-800 text-xs block mt-1"
                        >
                          View All
                        </button>
                      )}
                    </TableCell>

                    <TableCell className="px-3 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium">{awardCount}</span>
                      </div>
                      {awardCount > 0 && (
                        <button
                          onClick={() =>
                            openModal("awards", playerData.playerId, playerData)
                          }
                          className="text-blue-600 underline hover:text-blue-800 text-xs block mt-1"
                        >
                          View All
                        </button>
                      )}
                    </TableCell>

                    <TableCell className="px-3 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span className="font-medium">{certificateCount}</span>
                      </div>
                      {certificateCount > 0 && (
                        <button
                          onClick={() =>
                            openModal(
                              "certificates",
                              playerData.playerId,
                              playerData
                            )
                          }
                          className="text-blue-600 underline hover:text-blue-800 text-xs block mt-1"
                        >
                          View All
                        </button>
                      )}
                    </TableCell>

                    <TableCell className="px-3 py-2 align-middle">
                      <span
                        className={`rounded-lg px-3 py-1 text-xs font-semibold ${statusInfo.class}`}
                      >
                        {statusInfo.status}
                      </span>
                    </TableCell>

                    <TableCell className="px-3 py-2 align-middle">
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Delete media"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Edit media">
                          <Pencil className="w-4 h-4 text-gray-600 dark:text-white" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-gray-600 dark:text-white" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="More options"
                        >
                          <MoreHorizontal className="w-4 h-4" />
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
      {mediaData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 text-sm text-gray-500 dark:text-white">
          <div className="text-center sm:text-left w-full sm:w-auto">
            Showing{" "}
            {Math.min((currentPage - 1) * pageSize + 1, mediaData.length)}–
            {Math.min(currentPage * pageSize, mediaData.length)} of {totalItems}
          </div>

          <div className="flex flex-wrap justify-center gap-1">
            <button
              className="border px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              ⟨
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
                  className={`border px-3 py-1 rounded hover:bg-gray-100 ${
                    currentPage === pageNum
                      ? "bg-blue-100 font-semibold border-blue-300"
                      : ""
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              className="border px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              ⟩
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-xs drop-shadow-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-[80vw] max-w-6xl h-[90vh] flex flex-col px-16">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {modal.title} - Player {modal.playerId.substring(0, 8)}...
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
                          {item.title || `Untitled ${modal.type.slice(0, -1)}`}
                        </h3>

                        {/* Additional info for documents */}
                        {(modal.type === "awards" ||
                          modal.type === "certificates") && (
                          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            {(item as MediaDocument).issuedBy && (
                              <p>
                                <span className="font-medium">Issued by:</span>{" "}
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
  );
};

export default Media;
