import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import axios from "axios";

interface PlayerData {
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
  country: string | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  photo: string | null;
  profession: string | null;
  subProfession: string | null;
  sport: string | null;
  language: string[] | null;
  skills: string[];
  interests: string[];
  socialLinks: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
  } | null;
  stripeCustomerId: string | null;
  birthYear: number | null;
  skinColor: string | null;
}

const EditPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [player, setPlayer] = useState<PlayerData | null>(null);
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
    instagram: "",
    twitter: "",
    facebook: "",
    linkedin: "",
  });

  const fetchPlayer = async () => {
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
        setPlayer(data);
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
          instagram: data.socialLinks?.instagram || "",
          twitter: data.socialLinks?.twitter || "",
          facebook: data.socialLinks?.facebook || "",
          linkedin: data.socialLinks?.linkedin || "",
        });
      }
    } catch (err: any) {
      console.error("Error fetching player:", err);
      setError(err.response?.data?.message || "Failed to fetch player data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPlayer();
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
        country: formData.country || null,
        gender: formData.gender || null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        profession: formData.profession || null,
        subProfession: formData.subProfession || null,
        sport: formData.sport || null,
        birthYear: formData.birthYear ? parseInt(formData.birthYear) : null,
        skinColor: formData.skinColor || null,
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

      setSuccess("Player profile updated successfully!");
      setTimeout(() => navigate("/admin/player"), 1500);
    } catch (err: any) {
      console.error("Error updating player:", err);
      setError(err.response?.data?.message || "Failed to update player profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading player data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/player")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-2xl font-semibold">Edit Player Profile</h2>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
            <Input name="age" type="number" value={formData.age} onChange={handleChange} placeholder="Age" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Birth Year</label>
            <Input name="birthYear" type="number" value={formData.birthYear} onChange={handleChange} placeholder="Birth Year" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Physical Attributes */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Physical Attributes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (cm)</label>
            <Input name="height" type="number" value={formData.height} onChange={handleChange} placeholder="Height in cm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
            <Input name="weight" type="number" value={formData.weight} onChange={handleChange} placeholder="Weight in kg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skin Color</label>
            <Input name="skinColor" value={formData.skinColor} onChange={handleChange} placeholder="Skin Color" />
          </div>
        </div>

        {/* Location */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
            <Input name="city" value={formData.city} onChange={handleChange} placeholder="City" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
            <Input name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club</label>
            <Input name="club" value={formData.club} onChange={handleChange} placeholder="Club" />
          </div>
        </div>

        {/* Professional Information */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Professional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sport</label>
            <Input name="sport" value={formData.sport} onChange={handleChange} placeholder="Sport" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profession</label>
            <Input name="profession" value={formData.profession} onChange={handleChange} placeholder="Profession" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position/Sub-Profession</label>
            <Input name="subProfession" value={formData.subProfession} onChange={handleChange} placeholder="Position" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
            <Input name="company" value={formData.company} onChange={handleChange} placeholder="Company" />
          </div>
        </div>

        {/* Bio */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Bio</h3>
        <div className="mb-6">
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Player bio..."
            rows={4}
            className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Skills & Interests */}
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Skills & Interests</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Languages (comma separated)</label>
            <Input name="language" value={formData.language} onChange={handleChange} placeholder="English, Spanish, ..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills (comma separated)</label>
            <Input name="skills" value={formData.skills} onChange={handleChange} placeholder="Dribbling, Passing, ..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interests (comma separated)</label>
            <Input name="interests" value={formData.interests} onChange={handleChange} placeholder="Football, Training, ..." />
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
          <Button type="button" variant="outline" onClick={() => navigate("/admin/player")}>
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

export default EditPlayer;
