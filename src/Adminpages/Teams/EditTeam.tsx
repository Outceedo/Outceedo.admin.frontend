import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import axios from "axios";

interface TeamData {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string;
  createdAt: string;
  updatedAt: string;
  role: string;
  age: number | null;
  bio: string | null;
  city: string | null;
  club: string | null;
  company: string | null;
  companyLink: string | null;
  country: string | null;
  gender: string | null;
  photo: string | null;
  profession: string | null;
  subProfession: string | null;
  sport: string | null;
  language: string[] | null;
  skills: string[];
  interests: string[];
  certificationLevel: string | null;
  address: string | null;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
  } | null;
  stripeCustomerId: string | null;
}

const EditTeam: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    age: "",
    bio: "",
    city: "",
    club: "",
    company: "",
    companyLink: "",
    country: "",
    gender: "",
    profession: "",
    subProfession: "",
    sport: "",
    certificationLevel: "",
    address: "",
    language: "",
    skills: "",
    interests: "",
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
        `${import.meta.env.VITE_PORT}/user/profile/${id}/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-internal-key": import.meta.env.VITE_INTERNAL_KEY || "internal-secret",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data) {
        const data = response.data;
        setTeam(data);
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          username: data.username || "",
          age: data.age?.toString() || "",
          bio: data.bio || "",
          city: data.city || "",
          club: data.club || "",
          company: data.company || "",
          companyLink: data.companyLink || "",
          country: data.country || "",
          gender: data.gender || "",
          profession: data.profession || "",
          subProfession: data.subProfession || "",
          sport: data.sport || "",
          certificationLevel: data.certificationLevel || "",
          address: data.address || "",
          language: data.language?.join(", ") || "",
          skills: data.skills?.join(", ") || "",
          interests: data.interests?.join(", ") || "",
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
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        companyLink: formData.companyLink || null,
        country: formData.country || null,
        gender: formData.gender || null,
        profession: formData.profession || null,
        subProfession: formData.subProfession || null,
        sport: formData.sport || null,
        certificationLevel: formData.certificationLevel || null,
        address: formData.address || null,
        language: formData.language ? formData.language.split(",").map((l) => l.trim()).filter(Boolean) : [],
        skills: formData.skills ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
        interests: formData.interests ? formData.interests.split(",").map((i) => i.trim()).filter(Boolean) : [],
        socialLinks: {
          instagram: formData.instagram || null,
          twitter: formData.twitter || null,
          facebook: formData.facebook || null,
          linkedin: formData.linkedin || null,
        },
      };

      await axios.patch(
        `${import.meta.env.VITE_PORT}/user/profile`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: { userId: id },
        }
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
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/team")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-2xl font-semibold">Edit Team Profile</h2>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <AlertDescription className="text-red-800 dark:text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <AlertDescription className="text-green-800 dark:text-green-400">{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
        {/* Basic Information */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
            <Input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
            <Input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
            <Input name="username" value={formData.username} onChange={handleChange} placeholder="Username" disabled className="bg-gray-100" />
          </div>
        </div>

        {/* Organization Information */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Organization Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team/Company Name</label>
            <Input name="company" value={formData.company} onChange={handleChange} placeholder="Team/Company Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club Name</label>
            <Input name="club" value={formData.club} onChange={handleChange} placeholder="Club Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
            <Input name="companyLink" value={formData.companyLink} onChange={handleChange} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sport</label>
            <Input name="sport" value={formData.sport} onChange={handleChange} placeholder="Sport" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certification Level</label>
            <Input name="certificationLevel" value={formData.certificationLevel} onChange={handleChange} placeholder="Certification Level" />
          </div>
        </div>

        {/* Location */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <Input name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
            <Input name="city" value={formData.city} onChange={handleChange} placeholder="City" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
            <Input name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
          </div>
        </div>

        {/* Services */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Services Offered</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profession/Service Type</label>
            <Input name="profession" value={formData.profession} onChange={handleChange} placeholder="e.g., Training Academy" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialization</label>
            <Input name="subProfession" value={formData.subProfession} onChange={handleChange} placeholder="e.g., Youth Development" />
          </div>
        </div>

        {/* Bio */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">About</h3>
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
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Languages (comma separated)</label>
            <Input name="language" value={formData.language} onChange={handleChange} placeholder="English, Spanish, ..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills (comma separated)</label>
            <Input name="skills" value={formData.skills} onChange={handleChange} placeholder="Training, Coaching, ..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interests (comma separated)</label>
            <Input name="interests" value={formData.interests} onChange={handleChange} placeholder="Youth Development, ..." />
          </div>
        </div>

        {/* Social Links */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram</label>
            <Input name="instagram" value={formData.instagram} onChange={handleChange} placeholder="Instagram URL" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter</label>
            <Input name="twitter" value={formData.twitter} onChange={handleChange} placeholder="Twitter URL" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook</label>
            <Input name="facebook" value={formData.facebook} onChange={handleChange} placeholder="Facebook URL" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn</label>
            <Input name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="LinkedIn URL" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/team")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
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
    </div>
  );
};

export default EditTeam;
