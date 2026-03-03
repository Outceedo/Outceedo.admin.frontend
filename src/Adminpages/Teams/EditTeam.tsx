import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  ArrowLeft,
  Save,
  Upload,
  Trash2,
  Plus,
  X,
  Camera,
} from "lucide-react";
import axios from "axios";
import defaultAvatar from "@/assets/images/avatar.png";

interface Document {
  id: string;
  title: string;
  issuedBy: string;
  issuedDate: string;
  type: "certificate" | "award";
  description?: string;
  imageUrl: string;
}

const EditTeam: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile Photo State
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Documents State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [documentUploading, setDocumentUploading] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: "",
    issuedBy: "",
    issuedDate: "",
    type: "certificate" as "certificate" | "award",
    description: "",
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    age: "",
    bio: "",
    city: "",
    club: "",
    company: "",
    country: "",
    gender: "",
    height: "",
    weight: "",
    profession: "",
    subProfession: "",
    sport: "",
    birthYear: "",
    skinColor: "",
    language: "",
    skills: "",
    interests: "",
    responseTime: "",
    travelLimit: "",
    certificationLevel: "",
    teamType: "",
    teamCategory: "",
    address: "",
    companyLink: "",
    sponsorType: "",
    budgetRange: "",
    sponsorshipType: "",
    sponsorshipCountryPreferred: "",
    currency: "",
    teamName: "",
    referralCode: "",
    referredBy: "",
    instagram: "",
    twitter: "",
    facebook: "",
    linkedin: "",
  });

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const response = await axios.get(
        `${import.meta.env.VITE_PORT}/profile/${id}`,
        {
          headers: {
            "Api-Key": token,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 && response.data) {
        const data = response.data;
        setCurrentPhoto(data.photo || defaultAvatar);
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          username: data.username || "",
          age: data.age?.toString() || "",
          bio: data.bio || "",
          city: data.city || "",
          club: data.club || "",
          company: data.company || "",
          country: data.country || "",
          gender: data.gender || "",
          height: data.height?.toString() || "",
          weight: data.weight?.toString() || "",
          profession: data.profession || "",
          subProfession: data.subProfession || "",
          sport: data.sport || "",
          birthYear: data.birthYear?.toString() || "",
          skinColor: data.skinColor || "",
          language: data.language?.join(", ") || "",
          skills: data.skills?.join(", ") || "",
          interests: data.interests?.join(", ") || "",
          responseTime: data.responseTime || "",
          travelLimit: data.travelLimit || "",
          certificationLevel: data.certificationLevel || "",
          teamType: data.teamType || "",
          teamCategory: data.teamCategory || "",
          address: data.address || "",
          companyLink: data.companyLink || "",
          sponsorType: data.sponsorType || "",
          budgetRange: data.budgetRange || "",
          sponsorshipType: data.sponsorshipType || "",
          sponsorshipCountryPreferred: data.sponsorshipCountryPreferred || "",
          currency: data.currency || "",
          teamName: data.teamName || "",
          referralCode: data.referralCode || "",
          referredBy: data.referredBy || "",
          instagram: data.socialLinks?.instagram || "",
          twitter: data.socialLinks?.twitter || "",
          facebook: data.socialLinks?.facebook || "",
          linkedin: data.socialLinks?.linkedin || "",
        });
      }
    } catch (err: any) {
      console.error("Error fetching team:", err);
      setError(err.response?.data?.message || "Failed to fetch team data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTeam();
      fetchDocuments();
    }
  }, [id]);

  // Photo handling functions
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;

    setPhotoUploading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const formData = new FormData();
      formData.append("photo", photoFile);

      const response = await axios.patch(
        `${import.meta.env.VITE_PORT}/profile/${id}/photo`,
        formData,
        {
          headers: {
            "Api-Key": token,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data?.photo) {
        setCurrentPhoto(response.data.photo);
      }
      setPhotoFile(null);
      setPhotoPreview(null);
      setSuccess("Profile photo updated successfully!");
    } catch (err: any) {
      console.error("Error uploading photo:", err);
      setError(err.response?.data?.message || "Failed to upload photo");
    } finally {
      setPhotoUploading(false);
    }
  };

  const cancelPhotoUpload = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // Documents handling functions
  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const token = localStorage.getItem("adminToken");

      const response = await axios.get(
        `${import.meta.env.VITE_PORT}/profile/${id}/documents`,
        {
          headers: {
            "Api-Key": token,
          },
        },
      );

      if (response.data) {
        setDocuments(response.data);
      }
    } catch (err: any) {
      console.error("Error fetching documents:", err);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleDocumentFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
    }
  };

  const handleAddDocument = async () => {
    if (
      !documentFile ||
      !newDocument.title ||
      !newDocument.issuedBy ||
      !newDocument.issuedDate
    ) {
      setError("Please fill all required fields and select an image");
      return;
    }

    setDocumentUploading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const formData = new FormData();
      formData.append("title", newDocument.title);
      formData.append("issuedBy", newDocument.issuedBy);
      formData.append("issuedDate", newDocument.issuedDate);
      formData.append("type", newDocument.type);
      if (newDocument.description) {
        formData.append("description", newDocument.description);
      }
      formData.append("image", documentFile);

      await axios.post(
        `${import.meta.env.VITE_PORT}/profile/${id}/documents`,
        formData,
        {
          headers: {
            "Api-Key": token,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setSuccess("Document added successfully!");
      setShowAddDocument(false);
      setNewDocument({
        title: "",
        issuedBy: "",
        issuedDate: "",
        type: "certificate",
        description: "",
      });
      setDocumentFile(null);
      fetchDocuments();
    } catch (err: any) {
      console.error("Error adding document:", err);
      setError(err.response?.data?.message || "Failed to add document");
    } finally {
      setDocumentUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(
        `${import.meta.env.VITE_PORT}/profile/${id}/documents/${documentId}`,
        {
          headers: {
            "Api-Key": token,
          },
        },
      );

      setSuccess("Document deleted successfully!");
      fetchDocuments();
    } catch (err: any) {
      console.error("Error deleting document:", err);
      setError(err.response?.data?.message || "Failed to delete document");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("adminToken");

      const updateData: any = {
        firstName: formData.firstName || null,
        lastName: formData.lastName || null,
        age: formData.age ? parseInt(formData.age) : null,
        bio: formData.bio || null,
        city: formData.city || null,
        club: formData.club || null,
        company: formData.company || null,
        country: formData.country || null,
        gender: formData.gender || null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        profession: formData.profession || null,
        subProfession: formData.subProfession || null,
        sport: formData.sport || null,
        birthYear: formData.birthYear ? parseInt(formData.birthYear) : null,
        skinColor: formData.skinColor || null,
        responseTime: formData.responseTime || null,
        travelLimit: formData.travelLimit || null,
        certificationLevel: formData.certificationLevel || null,
        teamType: formData.teamType || null,
        teamCategory: formData.teamCategory || null,
        address: formData.address || null,
        companyLink: formData.companyLink || null,
        sponsorType: formData.sponsorType || null,
        budgetRange: formData.budgetRange || null,
        sponsorshipType: formData.sponsorshipType || null,
        sponsorshipCountryPreferred:
          formData.sponsorshipCountryPreferred || null,
        currency: formData.currency || null,
        teamName: formData.teamName || null,
        referralCode: formData.referralCode || null,
        referredBy: formData.referredBy || null,
        language: formData.language
          ? formData.language
              .split(",")
              .map((l) => l.trim())
              .filter(Boolean)
          : [],
        skills: formData.skills
          ? formData.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        interests: formData.interests
          ? formData.interests
              .split(",")
              .map((i) => i.trim())
              .filter(Boolean)
          : [],
        socialLinks: {
          instagram: formData.instagram || null,
          twitter: formData.twitter || null,
          facebook: formData.facebook || null,
          linkedin: formData.linkedin || null,
        },
      };

      await axios.patch(
        `${import.meta.env.VITE_PORT}/profile/${id}`,
        updateData,
        {
          headers: {
            "Api-Key": token,
            "Content-Type": "application/json",
          },
        },
      );

      setSuccess("Team profile updated successfully!");
      setTimeout(() => navigate("/admin/team"), 1500);
    } catch (err: any) {
      console.error("Error updating team:", err);
      setError(err.response?.data?.message || "Failed to update team profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading team data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/admin/team")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-2xl font-semibold">Edit Team Profile</h2>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <AlertDescription className="text-red-800 dark:text-red-400">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <AlertDescription className="text-green-800 dark:text-green-400">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Photo Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Team Logo / Photo
        </h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt="Current Photo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-4xl">
                  {formData.teamName?.[0]?.toUpperCase() ||
                    formData.firstName?.[0]?.toUpperCase() ||
                    "?"}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1">
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            {!photoFile ? (
              <label
                htmlFor="photo-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                <Upload className="w-4 h-4" />
                Choose Photo
              </label>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handlePhotoUpload}
                  disabled={photoUploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {photoUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelPhotoUpload}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Recommended: Square image, at least 200x200 pixels
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6"
      >
        {/* Basic Information */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name
            </label>
            <Input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name
            </label>
            <Input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              disabled
              className="bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Age
            </label>
            <Input
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              placeholder="Age"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Birth Year
            </label>
            <Input
              name="birthYear"
              type="number"
              value={formData.birthYear}
              onChange={handleChange}
              placeholder="Birth Year"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Physical Attributes */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          Physical Attributes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Height (cm)
            </label>
            <Input
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              placeholder="Height in cm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Weight (kg)
            </label>
            <Input
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              placeholder="Weight in kg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Skin Color
            </label>
            <Input
              name="skinColor"
              value={formData.skinColor}
              onChange={handleChange}
              placeholder="Skin Color"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Currency
            </label>
            <Input
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              placeholder="e.g., GBP, USD"
            />
          </div>
        </div>

        {/* Location */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          Location
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address
            </label>
            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              City
            </label>
            <Input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Country
            </label>
            <Input
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Country"
            />
          </div>
        </div>

        {/* Team/Organization Information */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          Team/Organization Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Team Name
            </label>
            <Input
              name="teamName"
              value={formData.teamName}
              onChange={handleChange}
              placeholder="Team Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Team Type
            </label>
            <Input
              name="teamType"
              value={formData.teamType}
              onChange={handleChange}
              placeholder="Team Type"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Team Category
            </label>
            <Input
              name="teamCategory"
              value={formData.teamCategory}
              onChange={handleChange}
              placeholder="Team Category"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Company Name
            </label>
            <Input
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Company Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Club Name
            </label>
            <Input
              name="club"
              value={formData.club}
              onChange={handleChange}
              placeholder="Club Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Website
            </label>
            <Input
              name="companyLink"
              value={formData.companyLink}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sport
            </label>
            <Input
              name="sport"
              value={formData.sport}
              onChange={handleChange}
              placeholder="Sport"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Certification Level
            </label>
            <Input
              name="certificationLevel"
              value={formData.certificationLevel}
              onChange={handleChange}
              placeholder="Certification Level"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Response Time
            </label>
            <Input
              name="responseTime"
              value={formData.responseTime}
              onChange={handleChange}
              placeholder="e.g., Within 24 hours"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Travel Limit
            </label>
            <Input
              name="travelLimit"
              value={formData.travelLimit}
              onChange={handleChange}
              placeholder="Travel Limit"
            />
          </div>
        </div>

        {/* Services */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          Services Offered
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Profession/Service Type
            </label>
            <Input
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              placeholder="e.g., Training Academy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Specialization
            </label>
            <Input
              name="subProfession"
              value={formData.subProfession}
              onChange={handleChange}
              placeholder="e.g., Youth Development"
            />
          </div>
        </div>

        {/* Sponsorship Details */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          Sponsorship Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sponsor Type
            </label>
            <Input
              name="sponsorType"
              value={formData.sponsorType}
              onChange={handleChange}
              placeholder="Sponsor Type"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sponsorship Type
            </label>
            <Input
              name="sponsorshipType"
              value={formData.sponsorshipType}
              onChange={handleChange}
              placeholder="Sponsorship Type"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Budget Range
            </label>
            <Input
              name="budgetRange"
              value={formData.budgetRange}
              onChange={handleChange}
              placeholder="Budget Range"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Preferred Sponsorship Country
            </label>
            <Input
              name="sponsorshipCountryPreferred"
              value={formData.sponsorshipCountryPreferred}
              onChange={handleChange}
              placeholder="Preferred Country"
            />
          </div>
        </div>

        {/* Bio */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          About
        </h3>
        <div className="mb-6">
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Team/Organization description..."
            rows={4}
            className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Skills & Languages */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          Additional Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Languages (comma separated)
            </label>
            <Input
              name="language"
              value={formData.language}
              onChange={handleChange}
              placeholder="English, Spanish, ..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Skills (comma separated)
            </label>
            <Input
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="Training, Coaching, ..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Interests (comma separated)
            </label>
            <Input
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="Youth Development, ..."
            />
          </div>
        </div>

        {/* Referral */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          Referral Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Referral Code
            </label>
            <Input
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              placeholder="Referral Code"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Referred By
            </label>
            <Input
              name="referredBy"
              value={formData.referredBy}
              onChange={handleChange}
              placeholder="Referred By"
            />
          </div>
        </div>

        {/* Social Links */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          Social Links
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Instagram
            </label>
            <Input
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              placeholder="Instagram URL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Twitter
            </label>
            <Input
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              placeholder="Twitter URL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Facebook
            </label>
            <Input
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              placeholder="Facebook URL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              LinkedIn
            </label>
            <Input
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="LinkedIn URL"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/team")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Documents Section (Certificates & Awards) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Certificates & Awards
          </h3>
          <Button
            type="button"
            onClick={() => setShowAddDocument(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Document
          </Button>
        </div>

        {/* Add Document Form */}
        {showAddDocument && (
          <div className="border rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-700">
            <h4 className="font-medium mb-3 text-gray-900 dark:text-white">
              Add New Document
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <Input
                  value={newDocument.title}
                  onChange={(e) =>
                    setNewDocument({ ...newDocument, title: e.target.value })
                  }
                  placeholder="Document title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Issued By *
                </label>
                <Input
                  value={newDocument.issuedBy}
                  onChange={(e) =>
                    setNewDocument({ ...newDocument, issuedBy: e.target.value })
                  }
                  placeholder="Issuing organization"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Issue Date *
                </label>
                <Input
                  type="date"
                  value={newDocument.issuedDate}
                  onChange={(e) =>
                    setNewDocument({
                      ...newDocument,
                      issuedDate: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type *
                </label>
                <select
                  value={newDocument.type}
                  onChange={(e) =>
                    setNewDocument({
                      ...newDocument,
                      type: e.target.value as "certificate" | "award",
                    })
                  }
                  className="w-full p-2 border rounded-md dark:bg-gray-600 dark:text-white"
                >
                  <option value="certificate">Certificate</option>
                  <option value="award">Award</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newDocument.description}
                  onChange={(e) =>
                    setNewDocument({
                      ...newDocument,
                      description: e.target.value,
                    })
                  }
                  placeholder="Optional description"
                  rows={2}
                  className="w-full p-2 border rounded-md dark:bg-gray-600 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDocumentFileSelect}
                  className="w-full p-2 border rounded-md dark:bg-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDocument(false);
                  setNewDocument({
                    title: "",
                    issuedBy: "",
                    issuedDate: "",
                    type: "certificate",
                    description: "",
                  });
                  setDocumentFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddDocument}
                disabled={documentUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {documentUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Document
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Documents List */}
        {documentsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading documents...</span>
          </div>
        ) : documents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No certificates or awards added yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700"
              >
                <div className="h-40 bg-gray-200 dark:bg-gray-600">
                  <img
                    src={doc.imageUrl}
                    alt={doc.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded ${
                          doc.type === "certificate"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {doc.type === "certificate" ? "Certificate" : "Award"}
                      </span>
                      <h4 className="font-medium mt-2 text-gray-900 dark:text-white">
                        {doc.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {doc.issuedBy}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.issuedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditTeam;
