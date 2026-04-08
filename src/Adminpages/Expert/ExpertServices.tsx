import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Search,
  Briefcase,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

interface PlatformService {
  id: string;
  name: string;
  description: string;
}

interface ExpertService {
  id: string;
  serviceId: string;
  price: number;
  additionalDetails?: Record<string, any>;
  service?: PlatformService;
}

interface Expert {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  status?: string;
}

interface ExpertWithServices extends Expert {
  services: ExpertService[];
  servicesCount: number;
}

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const ExpertServices: React.FC = () => {
  const [experts, setExperts] = useState<ExpertWithServices[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Modal state
  const [selectedExpert, setSelectedExpert] = useState<ExpertWithServices | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  // Platform services for add service dropdown
  const [platformServices, setPlatformServices] = useState<PlatformService[]>([]);

  // Add service state
  const [showAddService, setShowAddService] = useState(false);
  const [serviceAdding, setServiceAdding] = useState(false);
  const [newService, setNewService] = useState({
    serviceId: "",
    price: "",
    description: "",
  });

  // Edit service state
  const [editingService, setEditingService] = useState<ExpertService | null>(null);
  const [editServiceData, setEditServiceData] = useState({
    price: "",
    description: "",
  });
  const [serviceUpdating, setServiceUpdating] = useState(false);

  const pageSize = 10;
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Fetch all experts
  const fetchExperts = async (page: number = 1) => {
    try {
      setLoading(true);
      setError("");

      const adminToken = localStorage.getItem("adminToken");

      if (!adminToken) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_PORT}/expert/`, {
        params: {
          page: page,
          limit: pageSize,
        },
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "api-key": adminToken,
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.data) {
        // Fetch services count for each expert
        const expertsWithServices = await Promise.all(
          response.data.data.map(async (expert: Expert) => {
            try {
              const servicesResponse = await axios.get(
                `${import.meta.env.VITE_PORT}/profile/${expert.id}/services`,
                {
                  headers: {
                    "Api-Key": adminToken,
                  },
                }
              );
              return {
                ...expert,
                services: servicesResponse.data || [],
                servicesCount: servicesResponse.data?.length || 0,
              };
            } catch {
              return {
                ...expert,
                services: [],
                servicesCount: 0,
              };
            }
          })
        );

        setExperts(expertsWithServices);
        setTotalPages(
          response.data.totalPages ||
            Math.ceil((response.data.total || response.data.data.length) / pageSize)
        );
        setTotalCount(response.data.total || response.data.data.length);
      } else {
        setExperts([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (err: any) {
      console.error("Error fetching experts:", err);
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (err.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else {
        setError(err.response?.data?.message || "Failed to fetch experts data");
      }
    } finally {
      setLoading(false);
    }
  };

  // Search experts
  const searchExperts = async (query: string, page: number) => {
    try {
      setIsSearching(true);
      setError("");

      const adminToken = localStorage.getItem("adminToken");

      if (!adminToken) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_PORT || "http://localhost:3000"}/profile/search`,
        {
          params: {
            q: query,
            page: page,
            limit: pageSize,
            role: "expert",
          },
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "api-key": adminToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        const searchResults = response.data.users || response.data.data || [];

        // Fetch services count for each expert
        const expertsWithServices = await Promise.all(
          searchResults.map(async (expert: Expert) => {
            try {
              const servicesResponse = await axios.get(
                `${import.meta.env.VITE_PORT}/profile/${expert.id}/services`,
                {
                  headers: {
                    "Api-Key": adminToken,
                  },
                }
              );
              return {
                ...expert,
                services: servicesResponse.data || [],
                servicesCount: servicesResponse.data?.length || 0,
              };
            } catch {
              return {
                ...expert,
                services: [],
                servicesCount: 0,
              };
            }
          })
        );

        setExperts(expertsWithServices);
        setTotalPages(response.data.totalPages || 1);
        setTotalCount(searchResults.length);
      }
    } catch (err: any) {
      console.error("Error searching experts:", err);
      setError(err.response?.data?.message || "Failed to search experts");
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  // Fetch platform services
  const fetchPlatformServices = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        `${import.meta.env.VITE_PORT}/profile/services/all`,
        {
          headers: {
            "Api-Key": token,
          },
        }
      );

      if (response.data) {
        setPlatformServices(response.data);
      }
    } catch (err: any) {
      console.error("Error fetching platform services:", err);
    }
  };

  // Fetch services for a specific expert
  const fetchExpertServices = async (expertId: string) => {
    try {
      setLoadingServices(true);
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        `${import.meta.env.VITE_PORT}/profile/${expertId}/services`,
        {
          headers: {
            "Api-Key": token,
          },
        }
      );

      if (response.data && selectedExpert) {
        setSelectedExpert({
          ...selectedExpert,
          services: response.data,
          servicesCount: response.data.length,
        });
        // Also update the experts list
        setExperts((prev) =>
          prev.map((expert) =>
            expert.id === expertId
              ? {
                  ...expert,
                  services: response.data,
                  servicesCount: response.data.length,
                }
              : expert
          )
        );
      }
    } catch (err: any) {
      console.error("Error fetching expert services:", err);
    } finally {
      setLoadingServices(false);
    }
  };

  // Handle row click to open modal
  const handleRowClick = (expert: ExpertWithServices) => {
    setSelectedExpert(expert);
    setShowModal(true);
    setShowAddService(false);
    setEditingService(null);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedExpert(null);
    setShowAddService(false);
    setEditingService(null);
  };

  // Add service handler
  const handleAddService = async () => {
    if (!selectedExpert || !newService.serviceId || !newService.price) {
      setError("Please select a service and enter a price");
      return;
    }

    setServiceAdding(true);
    try {
      const token = localStorage.getItem("adminToken");

      await axios.post(
        `${import.meta.env.VITE_PORT}/profile/${selectedExpert.id}/services/${newService.serviceId}`,
        {
          price: parseFloat(newService.price),
          additionalDetails: newService.description
            ? { description: newService.description }
            : undefined,
        },
        {
          headers: {
            "Api-Key": token,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess("Service added successfully!");
      setShowAddService(false);
      setNewService({ serviceId: "", price: "", description: "" });
      fetchExpertServices(selectedExpert.id);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error adding service:", err);
      setError(err.response?.data?.message || "Failed to add service");
    } finally {
      setServiceAdding(false);
    }
  };

  // Delete service handler
  const handleDeleteService = async (serviceId: string) => {
    if (!selectedExpert) return;
    if (!confirm("Are you sure you want to remove this service?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(
        `${import.meta.env.VITE_PORT}/profile/${selectedExpert.id}/services/${serviceId}`,
        {
          headers: {
            "Api-Key": token,
          },
        }
      );

      setSuccess("Service removed successfully!");
      fetchExpertServices(selectedExpert.id);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error removing service:", err);
      setError(err.response?.data?.message || "Failed to remove service");
    }
  };

  // Start editing a service
  const handleStartEditService = (service: ExpertService) => {
    setEditingService(service);
    setEditServiceData({
      price: service.price.toString(),
      description: service.additionalDetails?.description || "",
    });
    setShowAddService(false);
  };

  // Update service handler
  const handleUpdateService = async () => {
    if (!selectedExpert || !editingService || !editServiceData.price) {
      setError("Please enter a price");
      return;
    }

    setServiceUpdating(true);
    try {
      const token = localStorage.getItem("adminToken");

      // Delete and re-add with new price (since API might not have PATCH for service)
      await axios.delete(
        `${import.meta.env.VITE_PORT}/profile/${selectedExpert.id}/services/${editingService.id}`,
        {
          headers: {
            "Api-Key": token,
          },
        }
      );

      await axios.post(
        `${import.meta.env.VITE_PORT}/profile/${selectedExpert.id}/services/${editingService.serviceId}`,
        {
          price: parseFloat(editServiceData.price),
          additionalDetails: editServiceData.description
            ? { description: editServiceData.description }
            : undefined,
        },
        {
          headers: {
            "Api-Key": token,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess("Service updated successfully!");
      setEditingService(null);
      fetchExpertServices(selectedExpert.id);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error updating service:", err);
      setError(err.response?.data?.message || "Failed to update service");
    } finally {
      setServiceUpdating(false);
    }
  };

  // Get full name
  const getFullName = (expert: Expert) => {
    return `${expert.firstName || ""} ${expert.lastName || ""}`.trim() || "N/A";
  };

  // Initial load
  useEffect(() => {
    fetchExperts(1);
    fetchPlatformServices();
  }, []);

  // Handle debounced search
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      searchExperts(debouncedSearchTerm, 1);
      setCurrentPage(1);
    } else {
      fetchExperts(currentPage);
    }
  }, [debouncedSearchTerm]);

  // Handle page changes (only when not searching)
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      fetchExperts(currentPage);
    }
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (debouncedSearchTerm.trim()) {
      searchExperts(debouncedSearchTerm, page);
    }
  };

  if (loading && experts.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading experts...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <AlertDescription className="text-red-800 dark:text-red-400">
            {error}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => setError("")}
            >
              <X className="w-4 h-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <AlertDescription className="text-green-800 dark:text-green-400">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
        <h2 className="text-xl md:text-2xl font-semibold">
          Expert Services Management
        </h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64 dark:bg-slate-600 dark:text-white rounded-lg">
            {isSearching ? (
              <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400 animate-spin" />
            ) : (
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
            <Input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full dark:bg-slate-700 text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700">
        <Table className="min-w-[600px]">
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
            <TableRow>
              <TableHead>Expert Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Services Offered</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {experts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  No experts found
                </TableCell>
              </TableRow>
            ) : (
              experts.map((expert) => (
                <TableRow
                  key={expert.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleRowClick(expert)}
                >
                  <TableCell className="font-medium">{getFullName(expert)}</TableCell>
                  <TableCell>{expert.email}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        expert.servicesCount > 0
                          ? "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }
                    >
                      {expert.servicesCount} {expert.servicesCount === 1 ? "Service" : "Services"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 text-sm text-gray-500 dark:text-white">
        <div>
          Showing {Math.min((currentPage - 1) * pageSize + 1, experts.length)}–
          {Math.min(currentPage * pageSize, experts.length)} out of {experts.length}
          {totalCount !== experts.length && ` (${totalCount} total)`}
        </div>
        <div className="flex gap-1">
          <button
            className="border px-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
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
                className={`border px-2 rounded ${
                  currentPage === pageNum ? "bg-gray-300 dark:bg-gray-600" : ""
                }`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            className="border px-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
          >
            ⟩
          </button>
        </div>
      </div>

      {/* Services Modal */}
      {showModal && selectedExpert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold dark:text-white">
                    {getFullName(selectedExpert)}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedExpert.email}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Services Offered ({selectedExpert.servicesCount})
                </h3>
                <Button
                  size="sm"
                  onClick={() => {
                    setShowAddService(true);
                    setEditingService(null);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Service
                </Button>
              </div>

              {/* Add Service Form */}
              {showAddService && (
                <div className="border rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-700">
                  <h4 className="font-medium mb-3 text-gray-900 dark:text-white">
                    Add New Service
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Service *
                      </label>
                      <select
                        value={newService.serviceId}
                        onChange={(e) =>
                          setNewService({ ...newService, serviceId: e.target.value })
                        }
                        className="w-full p-2 border rounded-md dark:bg-gray-600 dark:text-white"
                      >
                        <option value="">Select a service</option>
                        {platformServices
                          .filter(
                            (ps) =>
                              !selectedExpert.services.some((es) => es.serviceId === ps.id)
                          )
                          .map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price *
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newService.price}
                        onChange={(e) =>
                          setNewService({ ...newService, price: e.target.value })
                        }
                        placeholder="Enter price"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <Input
                        value={newService.description}
                        onChange={(e) =>
                          setNewService({ ...newService, description: e.target.value })
                        }
                        placeholder="Optional description"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAddService(false);
                        setNewService({ serviceId: "", price: "", description: "" });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddService}
                      disabled={serviceAdding}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {serviceAdding ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Services List */}
              {loadingServices ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    Loading services...
                  </span>
                </div>
              ) : selectedExpert.services.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No services added yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedExpert.services.map((es) => {
                    const serviceDetails = platformServices.find(
                      (ps) => ps.id === es.serviceId
                    );
                    const isEditing = editingService?.id === es.id;

                    return (
                      <div
                        key={es.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-700"
                      >
                        {isEditing ? (
                          // Edit mode
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Service
                              </label>
                              <Input
                                value={
                                  serviceDetails?.name ||
                                  es.service?.name ||
                                  "Unknown Service"
                                }
                                disabled
                                className="bg-gray-100 dark:bg-gray-600"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Price *
                              </label>
                              <Input
                                type="number"
                                step="0.01"
                                value={editServiceData.price}
                                onChange={(e) =>
                                  setEditServiceData({
                                    ...editServiceData,
                                    price: e.target.value,
                                  })
                                }
                                placeholder="Enter price"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                              </label>
                              <Input
                                value={editServiceData.description}
                                onChange={(e) =>
                                  setEditServiceData({
                                    ...editServiceData,
                                    description: e.target.value,
                                  })
                                }
                                placeholder="Optional description"
                              />
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingService(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={handleUpdateService}
                                disabled={serviceUpdating}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {serviceUpdating ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  "Save Changes"
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 dark:text-white">
                                {serviceDetails?.name ||
                                  es.service?.name ||
                                  "Unknown Service"}
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {serviceDetails?.description || es.service?.description}
                              </p>
                              <p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-1">
                                £{es.price.toFixed(2)}
                              </p>
                              {es.additionalDetails?.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  <span className="font-medium">Note:</span>{" "}
                                  {es.additionalDetails.description}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleStartEditService(es)}
                                title="Edit Service"
                              >
                                <Pencil className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteService(es.id)}
                                title="Remove Service"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertServices;
