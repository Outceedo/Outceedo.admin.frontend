import React, { ChangeEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getProfile,
  updateProfile,
  updateProfilePhoto,
} from "../store/profile-slice";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faTwitter,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

interface Country {
  name: string;
  iso2: string;
  flag: string;
  dialCode: string;
}

interface City {
  name: string;
  country: string;
}

interface Certificate {
  id: number;
  name?: string;
  organization?: string;
  file?: File;
  uploadedDocId?: string;
  imageUrl?: string;
}

interface Award {
  id: number;
  name?: string;
  organization?: string;
  file?: File;
  uploadedDocId?: string;
  imageUrl?: string;
}

interface Media {
  id: string;
  title: string;
  url: string;
  type: string;
}

type GenderType = "male" | "female" | "other" | "prefer_not_to_say";

const Detailsform: React.FC = () => {
  const profileData = useAppSelector((state) => state.profile.viewedProfile);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isExpert, setIsExpert] = useState(false);

  const [existingProfilePhoto, setExistingProfilePhoto] = useState<
    string | null
  >(null);
  const [profilePhotoChanged, setProfilePhotoChanged] = useState(false);

  const [formData, setFormData] = useState({
    photo: "",
    phone: "",
    firstName: "",
    lastName: "",
    profession: "",
    subProfession: "",
    age: "",
    birthYear: "",
    gender: "" as GenderType,
    languages: "",
    height: "",
    weight: "",
    country: "",
    city: "",
    footballClub: "",
    sport: "",
    club: "",
    countryCode: "",
    phoneNumber: "",
    bio: "",
    linkedin: "",
    facebook: "",
    instagram: "",
    twitter: "",
    responseTime: "",
    travelLimit: "",
    certificationLevel: "",
    skills: [] as string[],
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [professionalPhoto, setProfessionalPhoto] = useState<File | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([{ id: 1 }]);
  const [awards, setAwards] = useState<Award[]>([{ id: 1 }]);
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);
  const [skillInput, setSkillInput] = useState<string>("");

  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [citySearchTerm, setCitySearchTerm] = useState<string>("");
  const [showCountryDropdown, setShowCountryDropdown] =
    useState<boolean>(false);
  const [showCityDropdown, setShowCityDropdown] = useState<boolean>(false);

  const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1`;

  const getAuthToken = (): string | null => {
    return localStorage.getItem("token");
  };
  const username = localStorage.getItem("username");

  useEffect(() => {
    const role = localStorage.getItem("role");
    setIsExpert(role === "expert");
  }, []);

  useEffect(() => {
    if (username) {
      dispatch(getProfile(username));
    } else {
      console.error("No username found in localStorage");
    }
  }, [dispatch, username]);

  useEffect(() => {
    if (profileData) {
      console.log("Prefilling form with profile data:", profileData);

      if (profileData.photo) {
        setExistingProfilePhoto(profileData.photo);
      }

      setFormData((prevData) => ({
        ...prevData,
        photo: profileData.photo || "",
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        profession: profileData.profession || "",
        subProfession: profileData.subProfession || "",
        sport: profileData.sport || "",
        club: profileData.club || "",
        age: profileData.age?.toString() || "",
        birthYear: profileData.birthYear?.toString() || "",
        gender: (profileData.gender as GenderType) || ("" as GenderType),
        languages: Array.isArray(profileData.language)
          ? profileData.language.join(", ")
          : "",
        height: profileData.height?.toString() || "",
        weight: profileData.weight?.toString() || "",
        country: profileData.country || "",
        city: profileData.city || "",
        footballClub: profileData.company || "",
        bio: profileData.bio || "",

        responseTime: isExpert ? profileData.responseTime || "" : "",
        travelLimit: isExpert ? profileData.travelLimit?.toString() || "" : "",
        certificationLevel: isExpert
          ? profileData.certificationLevel || ""
          : "",

        skills: isExpert
          ? Array.isArray(profileData.skills)
            ? profileData.skills.map((skill: any) =>
                typeof skill === "string"
                  ? skill
                  : skill.name || skill.skill || skill
              )
            : []
          : [],

        linkedin: profileData.socialLinks?.linkedin || "",
        facebook: profileData.socialLinks?.facebook || "",
        instagram: profileData.socialLinks?.instagram || "",
        twitter: profileData.socialLinks?.twitter || "",
      }));

      if (profileData.country) {
        setSearchTerm(profileData.country);
        const country = countries.find(
          (c) => c.name.toLowerCase() === profileData.country?.toLowerCase()
        );
        if (country) {
          setSelectedCountry(country);
        }
      }

      if (profileData.city) {
        setCitySearchTerm(profileData.city);
      }

      if (profileData.documents && Array.isArray(profileData.documents)) {
        const existingCertificates = profileData.documents
          .filter((doc: any) => doc.type === "certificate")
          .map((cert: any, index: number) => ({
            id: index + 1,
            name: cert.title || "",
            organization: cert.issuedBy || "",
            uploadedDocId: cert.id || "",
            imageUrl: cert.imageUrl || "",
          }));

        if (existingCertificates.length > 0) {
          setCertificates(existingCertificates);
        }

        const existingAwards = profileData.documents
          .filter((doc: any) => doc.type === "award")
          .map((award: any, index: number) => ({
            id: index + 1,
            name: award.title || "",
            organization: award.issuedBy || "",
            uploadedDocId: award.id || "",
            imageUrl: award.imageUrl || "",
          }));

        if (existingAwards.length > 0) {
          setAwards(existingAwards);
        }
      }
    }
  }, [profileData, isExpert, countries]);

  const createAuthAxios = () => {
    const token = getAuthToken();
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const validateCurrentStep = (): boolean => {
    setError(null);
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) {
        errors.firstName = "First name is required";
      }
      if (!formData.lastName.trim()) {
        errors.lastName = "Last name is required";
      }
      if (!formData.profession) {
        errors.profession = "Please select a profession";
      }
      if (!formData.gender) {
        errors.gender = "Please select a gender";
      }
    } else if (step === 2) {
      if (!formData.country) {
        errors.country = "Country is required";
      }
      if (!formData.city) {
        errors.city = "City is required";
      }

      if (isExpert) {
        if (!formData.responseTime) {
          errors.responseTime = "Response time is required for experts";
        }
        if (!formData.travelLimit) {
          errors.travelLimit = "Travel limit is required for experts";
        }
      }
    } else if (step === 3) {
      for (let i = 0; i < certificates.length; i++) {
        const cert = certificates[i];
        if (cert.file && !cert.name) {
          errors[`certificate_${i}_name`] = "Certificate title is required";
        }
      }

      for (let i = 0; i < awards.length; i++) {
        const award = awards[i];
        if (award.file && !award.name) {
          errors[`award_${i}_name`] = "Award title is required";
        }
      }
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError("Please correct the highlighted fields");
      return false;
    }
    return true;
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const uploadMediaFile = async (
    file: File,
    type: string
  ): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", `${type}_photo_${Date.now()}`);
      formData.append("type", type);

      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/user/media`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(`${type} photo uploaded:`, response.data);

      if (response.data && response.data.id) {
        setUploadedMedia((prev) => [
          ...prev,
          {
            id: response.data.id,
            title: response.data.title,
            url: response.data.url,
            type: type,
          },
        ]);

        return response.data.id;
      }

      return null;
    } catch (error) {
      console.error(`Error uploading ${type} photo:`, error);
      throw error;
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "professional" | "certificate" | "award",
    id?: number
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("File size should not exceed 2MB.");
      return;
    }

    try {
      if (type === "profile") {
        setProfilePhoto(file);
        setProfilePhotoChanged(true);
      } else if (type === "professional") {
        setProfessionalPhoto(file);
        await uploadMediaFile(file, "professional");
      } else if (type === "certificate" && id !== undefined) {
        const imageUrl = URL.createObjectURL(file);

        setCertificates((prev) =>
          prev.map((cert) =>
            cert.id === id ? { ...cert, file, imageUrl } : cert
          )
        );
      } else if (type === "award" && id !== undefined) {
        const imageUrl = URL.createObjectURL(file);

        setAwards((prev) =>
          prev.map((award) =>
            award.id === id ? { ...award, file, imageUrl } : award
          )
        );
      }

      setError(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file. Please try again.");
    }
  };

  const uploadDocument = async (
    file: File,
    title: string,
    issuedBy: string = "",
    type: "certificate" | "award",
    description: string = ""
  ): Promise<string | null> => {
    try {
      if (!file) {
        throw new Error(`File is required for ${type} upload`);
      }

      if (!title || title.trim() === "") {
        throw new Error(`Title is required for ${type} upload`);
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", title.trim());
      formData.append("type", type);
      formData.append("issuedBy", issuedBy.trim());

      const today = new Date().toISOString().split("T")[0];
      formData.append("issuedDate", today);

      formData.append("description", description || "");

      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/user/document`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(`${type} document uploaded:`, response.data);
      return response.data.id || null;
    } catch (error) {
      console.error(`Error uploading ${type} document:`, error);
      setError(
        `Failed to upload ${type}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    }
  };

  const uploadAllDocuments = async (): Promise<boolean> => {
    try {
      for (const cert of certificates) {
        if (cert.file && cert.name && !cert.uploadedDocId) {
          const docId = await uploadDocument(
            cert.file,
            cert.name,
            cert.organization || "",
            "certificate"
          );

          if (docId) {
            setCertificates((prev) =>
              prev.map((c) =>
                c.id === cert.id ? { ...c, uploadedDocId: docId } : c
              )
            );
          }
        }
      }

      for (const award of awards) {
        if (award.file && award.name && !award.uploadedDocId) {
          const docId = await uploadDocument(
            award.file,
            award.name,
            award.organization || "",
            "award"
          );

          if (docId) {
            setAwards((prev) =>
              prev.map((a) =>
                a.id === award.id ? { ...a, uploadedDocId: docId } : a
              )
            );
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Error uploading documents:", error);
      return false;
    }
  };

  const addSkill = () => {
    if (skillInput.trim() === "") return;

    if (!formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
    }
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const addCertificate = () => {
    setCertificates([...certificates, { id: Date.now() }]);
  };

  const removeCertificate = async (id: number) => {
    if (certificates.length <= 1) {
      return;
    }

    const cert = certificates.find((c) => c.id === id);
    if (!cert) return;

    if (cert.uploadedDocId) {
      try {
        const token = getAuthToken();
        await axios.delete(
          `${API_BASE_URL}/user/document/${cert.uploadedDocId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(`Deleted certificate ${id} from server`);
      } catch (error) {
        console.error(`Error deleting certificate ${id}:`, error);
        setError("Failed to delete certificate. Please try again.");
        return;
      }
    }

    setCertificates(certificates.filter((cert) => cert.id !== id));
  };

  const handleCertificateChange = (
    id: number,
    field: "name" | "organization",
    value: string
  ) => {
    const cert = certificates.find((c) => c.id === id);

    if (cert && cert.uploadedDocId) {
      return;
    }

    setCertificates(
      certificates.map((cert) =>
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    );

    if (field === "name" && validationErrors[`certificate_${id}_name`]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[`certificate_${id}_name`];
        return updated;
      });
    }
  };

  const addAward = () => {
    setAwards([...awards, { id: Date.now() }]);
  };

  const removeAward = async (id: number) => {
    if (awards.length <= 1) {
      return;
    }

    const award = awards.find((a) => a.id === id);
    if (!award) return;

    if (award.uploadedDocId) {
      try {
        const token = getAuthToken();
        await axios.delete(
          `${API_BASE_URL}/user/document/${award.uploadedDocId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(`Deleted award ${id} from server`);
      } catch (error) {
        console.error(`Error deleting award ${id}:`, error);
        setError("Failed to delete award. Please try again.");
        return;
      }
    }

    setAwards(awards.filter((award) => award.id !== id));
  };

  const handleAwardChange = (
    id: number,
    field: "name" | "organization",
    value: string
  ) => {
    const award = awards.find((a) => a.id === id);

    if (award && award.uploadedDocId) {
      return;
    }

    setAwards(
      awards.map((award) =>
        award.id === id ? { ...award, [field]: value } : award
      )
    );

    if (field === "name" && validationErrors[`award_${id}_name`]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[`award_${id}_name`];
        return updated;
      });
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setFormData((prev) => ({
      ...prev,
      country: country.name,
      countryCode: country.dialCode,
    }));
    setSearchTerm(country.name);
    setShowCountryDropdown(false);
  };

  const handleCitySelect = (city: string) => {
    setFormData((prev) => ({ ...prev, city }));
    setCitySearchTerm(city);
    setShowCityDropdown(false);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const documentsUploaded = await uploadAllDocuments();

      if (!documentsUploaded) {
        throw new Error("Failed to upload some documents");
      }

      const professionalPhotoMedia = uploadedMedia.find(
        (m) => m.type === "professional"
      );

      let languageArray: string[] = [];
      if (formData.languages && formData.languages.trim()) {
        languageArray = formData.languages
          .split(",")
          .map((lang) => lang.charAt(0).toUpperCase() + lang.slice(1));
      }

      const profileUpdateData = {
        firstName:
          formData.firstName.charAt(0).toUpperCase() +
          formData.firstName.slice(1),
        lastName:
          formData.lastName.charAt(0).toUpperCase() +
          formData.lastName.slice(1),
        photo: professionalPhotoMedia?.id || formData.photo || null,
        gender: formData.gender.charAt(0) + formData.gender.slice(1),
        age: formData.age ? parseInt(formData.age) : null,
        birthYear: formData.birthYear ? parseInt(formData.birthYear) : null,
        language: languageArray,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        skinColor: null,
        city: formData.city || null,
        country: formData.country || null,
        bio: formData.bio || null,
        socialLinks: {
          linkedin: formData.linkedin || "",
          facebook: formData.facebook || "",
          instagram: formData.instagram || "",
          twitter: formData.twitter || "",
        },
        interests: [],
        profession:
          formData.profession.charAt(0).toUpperCase() +
            formData.profession.slice(1) || null,
        subProfession:
          formData.subProfession.charAt(0).toUpperCase() +
            formData.subProfession.slice(1) || null,
        sport: formData.sport.charAt(0).toUpperCase() + formData.sport.slice(1),
        club: formData.club || null,
        company: formData.footballClub || null,

        ...(isExpert && {
          certificationLevel:
            formData.certificationLevel.charAt(0).toUpperCase() +
              formData.certificationLevel.slice(1) || null,
          skills: Array.isArray(formData.skills)
            ? formData.skills.map((skill: any) =>
                typeof skill === "string"
                  ? skill
                  : skill.name || skill.skill || skill
              )
            : [],
          responseTime: formData.responseTime || null,
          travelLimit: formData.travelLimit ? formData.travelLimit : null,
        }),
      };

      console.log("Submitting profile data:", profileUpdateData);

      const resultAction = await dispatch(updateProfile(profileUpdateData));

      if (updateProfile.fulfilled.match(resultAction)) {
        console.log("Profile updated successfully:", resultAction.payload);

        if (profilePhoto && profilePhotoChanged) {
          try {
            const photoResultAction = await dispatch(
              updateProfilePhoto(profilePhoto)
            );

            if (updateProfilePhoto.fulfilled.match(photoResultAction)) {
              console.log("Profile photo uploaded successfully");
            } else if (updateProfilePhoto.rejected.match(photoResultAction)) {
              console.error(
                "Failed to upload profile photo:",
                photoResultAction.error
              );
            }
          } catch (photoError) {
            console.error("Error uploading profile photo:", photoError);
          }
        }

        setSuccess("Profile updated successfully!");

        setTimeout(() => {
          const userRole = localStorage.getItem("role");
          if (userRole === "player") {
            navigate("/player/profile");
          } else if (userRole === "expert") {
            navigate("/expert/profile");
          } else {
            navigate("/");
          }
        }, 1500);
      } else if (updateProfile.rejected.match(resultAction)) {
        console.error("Failed to update profile:", resultAction.error);
        setError(
          resultAction.error?.message ||
            "Failed to update profile. Please try again."
        );

        if (resultAction.payload && typeof resultAction.payload === "object") {
          setValidationErrors(resultAction.payload as Record<string, string>);
        }
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(
        error.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      localStorage.setItem("Profilecomplete", "true");
    }
  };

  useEffect(() => {
    const fetchCountries = async (): Promise<void> => {
      try {
        const response = await fetch(
          "https://countriesnow.space/api/v0.1/countries/flag/images"
        );
        if (!response.ok) throw new Error("Failed to fetch countries");

        const data = await response.json();
        if (data.error === false && data.data) {
          const formattedCountries = data.data.map((country: any) => ({
            name: country.name,
            iso2: country.iso2 || "",
            flag: country.flag,
            dialCode: "+1",
          }));
          setCountries(formattedCountries);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);

        const fallbackCountries = [
          { name: "United States", iso2: "US", flag: "🇺🇸", dialCode: "+1" },
          { name: "United Kingdom", iso2: "GB", flag: "🇬🇧", dialCode: "+44" },
          { name: "Canada", iso2: "CA", flag: "🇨🇦", dialCode: "+1" },
          { name: "Australia", iso2: "AU", flag: "🇦🇺", dialCode: "+61" },
          { name: "Germany", iso2: "DE", flag: "🇩🇪", dialCode: "+49" },
          { name: "France", iso2: "FR", flag: "🇫🇷", dialCode: "+33" },
          { name: "India", iso2: "IN", flag: "🇮🇳", dialCode: "+91" },
          { name: "Japan", iso2: "JP", flag: "🇯🇵", dialCode: "+81" },
          { name: "China", iso2: "CN", flag: "🇨🇳", dialCode: "+86" },
          { name: "Brazil", iso2: "BR", flag: "🇧🇷", dialCode: "+55" },
        ];
        setCountries(fallbackCountries);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!selectedCountry) return;

    const fetchCities = async () => {
      try {
        const response = await fetch(
          `https://countriesnow.space/api/v0.1/countries/cities`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              country: selectedCountry.name,
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to fetch cities");

        const cityData = await response.json();
        if (cityData.error === false && cityData.data) {
          const cityList = cityData.data.map((city: string) => ({
            name: city,
            country: selectedCountry.name,
          }));
          setCities(cityList);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);

        const fallbackCities = [
          { name: "New York", country: selectedCountry.name },
          { name: "Los Angeles", country: selectedCountry.name },
          { name: "Chicago", country: selectedCountry.name },
          { name: "Houston", country: selectedCountry.name },
          { name: "Phoenix", country: selectedCountry.name },
        ];
        setCities(fallbackCities);
      }
    };

    fetchCities();
  }, [selectedCountry]);

  const [userData, setUserData] = useState({
    email: "",
    id: "",
    mobileNumber: "",
    username: "",
  });
  const [countryCode, setCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getAuthToken();

        const response = await axios.get(
          `${API_BASE_URL}/auth/user/${localStorage.getItem("username")}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const data = response.data;
        setUserData(data);
        if (data.mobileNumber) {
          const parts = data.mobileNumber.split(" ");
          if (parts.length === 2) {
            setCountryCode(parts[0]);
            setPhoneNumber(parts[1]);
          } else {
            setPhoneNumber(data.mobileNumber);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-md rounded-lg">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
          {Object.keys(validationErrors).length > 0 && (
            <ul className="mt-2 list-disc pl-5">
              {Object.entries(validationErrors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          <p className="font-semibold">Success</p>
          <p>{success}</p>
        </div>
      )}

      <div className="flex flex-col items-center mb-12">
  {/* Responsive Stepper */}
  <div className="flex w-full max-w-xs sm:max-w-md md:max-w-lg items-center relative">
    {[1, 2, 3, 4].map((stepNum) => (
      <React.Fragment key={stepNum}>
        <div className="relative flex flex-col items-center w-1/4">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 ${
              step >= stepNum ? "bg-red-500" : "bg-gray-300"
            } rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm md:text-base`}
          >
            {stepNum}
          </div>
        </div>
        {stepNum < 4 && (
          <div
            className={
              `flex-1 h-1 bg-gray-300 rounded-full relative ` +
              (step === 2
                ? "-mx-3 sm:-mx-5 md:-mx-7 lg:-mx-12"
                : "lg:-mx-12 md:-mx-7 sm:-mx-5 -mx-3")
            }
          >
            <div
              className={`absolute top-0 left-0 h-1 rounded-full ${
                step > stepNum ? "bg-red-500 w-full" : "w-0"
              } transition-all duration-500`}
            ></div>
          </div>
        )}
      </React.Fragment>
    ))}
  </div>

  {/* Responsive Labels */}
  <div className="flex w-full max-w-xs sm:max-w-md md:max-w-lg justify-between mt-2 min-w-0">
    <div className="w-1/4 text-center text-[9px] xs:text-xs sm:text-sm md:text-base font-medium break-words whitespace-normal px-1">
      Personal Details
    </div>
    <div className="w-1/4 text-center text-[9px] xs:text-xs sm:text-sm md:text-base font-medium break-words whitespace-normal px-1">
      More Details
    </div>
    <div className="w-1/4 text-center text-[9px] xs:text-xs sm:text-sm md:text-base font-medium break-words whitespace-normal px-1">
      Certification/Awards
    </div>
    <div className="w-1/4 text-center text-[9px] xs:text-xs sm:text-sm md:text-base font-medium break-words whitespace-normal px-1">
      Links
    </div>
  </div>
</div>

      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Profile Details</h2>

          <label className="block text-grey mb-1">Profile Picture</label>
          <div className="relative border-4 border-dotted border-gray-400 p-2 w-full mb-2 rounded-md flex items-center justify-start lg:justify-center md:justify-center">
            {existingProfilePhoto && !profilePhoto && (
              <div className="flex items-center">
                <img
                  src={existingProfilePhoto}
                  alt="Current profile"
                  className="h-10 w-10 object-cover rounded-full mr-2"
                />
                <span className="text-gray-500">Current profile photo</span>
              </div>
            )}
            <span
              className={`text-gray-500 text-[11px] sm:text-[11px] md:text-[15px] ${
                existingProfilePhoto && !profilePhoto ? "hidden" : ""
              }`}
            >
              {profilePhoto
                ? profilePhoto.name
                : "Upload a photo here, max size 2MB"}
            </span>
            <input
              type="file"
              id="profilePhotoUpload"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "profile")}
            />
            <button
              className="absolute right-2 bg-lightYellow text-black-500 px-3 py-1 rounded text-sm font-semibold bg-yellow-300"
              onClick={() =>
                document.getElementById("profilePhotoUpload")?.click()
              }
            >
              Browse
            </button>
          </div>

          <div className="flex space-x-4 mb-2 md:text-xxl text-sm">
            <div className="w-1/3">
              <label className="block text-black mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`border p-2 w-full rounded ${
                  validationErrors.firstName ? "border-red-500" : ""
                }`}
                required
              />
              {validationErrors.firstName && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.firstName}
                </p>
              )}
            </div>
            <div className="w-1/3">
              <label className="block text-black mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`border p-2 w-full rounded ${
                  validationErrors.lastName ? "border-red-500" : ""
                }`}
                required
              />
              {validationErrors.lastName && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.lastName}
                </p>
              )}
            </div>
            <div className="w-1/3">
              <label className="block text-black mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                className="border p-2 w-full rounded bg-gray-100"
                readOnly
              />
            </div>
          </div>

          <div className="flex space-x-4 mb-2 md:text-xxl text-sm">
            <div className="w-1/3">
              <label className="block text-black mb-1">Profession *</label>
              <select
                name="profession"
                value={formData.profession}
                onChange={handleInputChange}
                className={`border p-2 w-full rounded ${
                  validationErrors.profession ? "border-red-500" : ""
                }`}
                required
              >
                <option value="">Select</option>
                <option value="coach">Coach</option>
                <option value="manager">Manager</option>
                <option value="player">Player</option>
                <option value="scout">Scout</option>
                <option value="exmanager">Ex-Manager</option>
                <option value="explayer">Ex-Player</option>
                <option value="excoach">Ex-Coach</option>
                <option value="exscout">Ex-Scout</option>
              </select>
              {validationErrors.profession && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.profession}
                </p>
              )}
            </div>
            <div className="w-1/3">
              <label className="block text-black mb-1">Sub Profession</label>
              <select
                name="subProfession"
                value={formData.subProfession}
                onChange={handleInputChange}
                className="border p-2 w-full rounded"
              >
                <option value="">Select</option>
                <option value="blank">Blank</option>
                <option value="defender">Defender</option>
                <option value="striker">Striker</option>
                <option value="goalkeeper">GoalKeeper</option>
                <option value="coach">Coach</option>
                <option value="midfielder">Midfielder</option>
              </select>
            </div>
            <div className="w-1/3">
              <label className="block text-black mb-1">Phone</label>
              <input
                type="text"
                value={userData.mobileNumber}
                className="border p-2 w-full rounded bg-gray-100"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1"></p>
            </div>
          </div>

          <div className="flex space-x-4 mb-2 md:text-xxl text-sm">
            <div className="w-1/3">
              <label className="block text-black mb-1">Age</label>
              <input
                list="ageOptions"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="border p-2 w-full rounded"
                placeholder="Select or Type Age"
              />
              <datalist id="ageOptions">
                {Array.from({ length: 100 }, (_, i) => (
                  <option key={i + 1} value={i + 1} />
                ))}
              </datalist>
            </div>
            <div className="w-1/3">
              <label className="block text-black mb-1">Birth Year</label>
              <input
                list="yearOptions"
                name="birthYear"
                value={formData.birthYear}
                onChange={handleInputChange}
                className="border p-2 w-full rounded"
                placeholder="Select or Type Year"
              />
              <datalist id="yearOptions">
                {Array.from({ length: 100 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year} />;
                })}
              </datalist>
            </div>
            <div className="w-1/3">
              <label className="block text-black mb-1">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className={`border p-2 w-full rounded ${
                  validationErrors.gender ? "border-red-500" : ""
                }`}
                required
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
              {validationErrors.gender && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.gender}
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-4 mb-2 md:text-xxl text-sm">
            <div className="w-1/3">
              <label className="block text-black mb-1">Languages</label>
              <input
                type="text"
                name="languages"
                placeholder="Language (comma separated)"
                value={formData.languages}
                onChange={handleInputChange}
                className="border p-2 w-full rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter multiple languages separated by commas (e.g., English,
                Spanish, French)
              </p>
            </div>
            <div className="w-1/3">
              <label className="block text-black mb-1">Height (cm)</label>
              <input
                type="number"
                name="height"
                placeholder="Height"
                value={formData.height}
                onChange={handleInputChange}
                className="border p-2 w-full rounded"
              />
            </div>
            <div className="w-1/3">
              <label className="block text-black mb-1">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                placeholder="Weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="border p-2 w-full rounded"
              />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-full w-full md:w-5xl mx-auto px-2 md:text-xxl text-sm">
          <h2 className="text-xl font-semibold mb-2">More Details</h2>
          <label className="block text-grey mb-1">Professional Picture</label>
          <div className="relative border-4 border-dotted border-gray-400 p-3 w-full mb-2 rounded-md flex items-center justify-start text-sm">
            <span className="text-gray-500 truncate md:text-[16px] text-[8px] ">
              {professionalPhoto
                ? professionalPhoto.name
                : "Upload a photo here, max size 2MB"}
            </span>
            <input
              type="file"
              id="professionalPhotoUpload"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "professional")}
            />
            <button
              className="absolute right-2 bg-lightYellow text-black-500 px-3 py-1 rounded text-sm font-semibold bg-yellow-300"
              onClick={() =>
                document.getElementById("professionalPhotoUpload")?.click()
              }
            >
              Browse
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:space-x-4 mb-2 space-y-2 md:space-y-0">
            <div className="w-full md:w-1/2">
              <label className="block text-black mb-1">Sport</label>
              <select
                name="sport"
                value={formData.sport}
                onChange={handleInputChange}
                className="border p-2 w-full rounded"
              >
                <option value="">Select Sport</option>
                <option value="football">Football</option>
              </select>
            </div>

            <div className="w-full md:w-1/2">
              <label className="block text-black mb-1">Club</label>
              <input
                type="text"
                name="club"
                placeholder="Enter your club"
                value={formData.club}
                onChange={handleInputChange}
                className="border p-2 w-full rounded"
              />
            </div>
          </div>

          {isExpert && (
            <div className="w-full mb-4">
              <label className="block text-black mb-1">
                Certification Level
              </label>
              <input
                name="certificationLevel"
                value={formData.certificationLevel}
                onChange={handleInputChange}
                className="border p-2 w-full rounded"
              />
            </div>
          )}

          {isExpert && (
            <div className="w-full mb-4">
              <label className="block text-black mb-1">Skills</label>
              <div className="flex flex-col sm:flex-row">
                <input
                  type="text"
                  placeholder="Add a skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="border p-2 flex-grow rounded-t sm:rounded-l sm:rounded-t-none"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-lightYellow text-white px-4 py-2 rounded-b sm:rounded-r sm:rounded-b-none bg-red-500"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 px-3 py-1 rounded-full flex items-center"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      className="ml-2 text-red-500"
                      onClick={() => removeSkill(skill)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:space-x-4 mb-2 space-y-2 md:space-y-0">
            <div className="w-full md:w-1/2 relative">
              <label className="block text-black mb-1">City *</label>
              <input
                type="text"
                placeholder="Search City"
                className={`border p-2 w-full rounded ${
                  validationErrors.city ? "border-red-500" : ""
                }`}
                value={citySearchTerm}
                onChange={(e) => {
                  setCitySearchTerm(e.target.value);
                  setShowCityDropdown(true);
                }}
                onFocus={() => setShowCityDropdown(true)}
                required
              />
              {validationErrors.city && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.city}
                </p>
              )}
              {showCityDropdown && selectedCountry && (
                <ul className="absolute w-full bg-white border border-gray-300 rounded-lg shadow-md mt-1 max-h-40 overflow-y-auto z-10">
                  {cities
                    .filter((city) =>
                      city.name
                        .toLowerCase()
                        .includes(citySearchTerm.toLowerCase())
                    )
                    .map((city, index) => (
                      <li
                        key={index}
                        onClick={() => handleCitySelect(city.name)}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                      >
                        {city.name}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <div className="w-full md:w-1/2 relative">
              <label className="block text-black mb-1">Country *</label>
              <input
                type="text"
                placeholder="Search Country"
                className={`border p-2 w-full rounded ${
                  validationErrors.country ? "border-red-500" : ""
                }`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowCountryDropdown(true);
                }}
                onFocus={() => setShowCountryDropdown(true)}
                required
              />
              {validationErrors.country && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.country}
                </p>
              )}
              {showCountryDropdown && (
                <ul className="absolute w-full bg-white border border-gray-300 rounded-lg shadow-md mt-1 max-h-40 overflow-y-auto z-10">
                  {countries
                    .filter((country) =>
                      country.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((country, index) => (
                      <li
                        key={index}
                        onClick={() => handleCountrySelect(country)}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-200 flex items-center"
                      >
                        {country.name}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>

          {isExpert && (
            <div className="flex flex-col md:flex-row md:space-x-4 mb-4 space-y-2 md:space-y-0">
              <div className="w-full md:w-1/2">
                <label className="block text-black mb-1">
                  Response Time (mins) *
                </label>
                <input
                  type="number"
                  name="responseTime"
                  placeholder="e.g., 30 mins"
                  value={formData.responseTime}
                  onChange={handleInputChange}
                  className={`border p-2 w-full rounded ${
                    validationErrors.responseTime ? "border-red-500" : ""
                  }`}
                  required={isExpert}
                />
                {validationErrors.responseTime && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.responseTime}
                  </p>
                )}
              </div>
              <div className="w-full md:w-1/2">
                <label className="block text-black mb-1">
                  Travel Limit (kms) *
                </label>
                <input
                  type="number"
                  name="travelLimit"
                  placeholder="e.g., 30"
                  value={formData.travelLimit}
                  onChange={handleInputChange}
                  className={`border p-2 w-full rounded ${
                    validationErrors.travelLimit ? "border-red-500" : ""
                  }`}
                  required={isExpert}
                />
                {validationErrors.travelLimit && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.travelLimit}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="relative w-full">
            <label className="block text-black mb-1">Bio Data</label>
            <textarea
              name="bio"
              placeholder="Enter your Bio Data"
              className="border p-2 w-full rounded resize-none"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
            />
            <span className="absolute right-4 bottom-2 text-gray-500 text-sm">
              {formData.bio.trim()
                ? formData.bio.trim().split(/\s+/).length
                : 0}
              /250
            </span>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-full w-full md:w-5xl mx-auto px-2 sm:px-6">
          <h2 className="text-xl font-semibold mb-4">Certification</h2>
          {certificates.map((cert, index) => (
            <div
              key={cert.id}
              className="relative mb-4 border p-4 rounded shadow bg-white"
            >
              {certificates.length > 1 && (
                <button
                  className="absolute -top-2 right-2 text-red-500 text-lg"
                  onClick={() => removeCertificate(cert.id)}
                  type="button"
                >
                  ×
                </button>
              )}

              {(cert.uploadedDocId || cert.imageUrl) && (
                <div className="mb-4 flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3 border-2 border-gray-200">
                    <img
                      src={cert.imageUrl}
                      alt={cert.name || "Certificate"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-semibold">
                    {cert.name || "Certificate"}
                  </span>
                </div>
              )}

              {!cert.uploadedDocId && (
                <div className="relative border-4 border-dotted border-gray-400 p-2 w-full mb-2 rounded-md flex items-center justify-start  md:text-xxl text-sm lg:justify-center">
                  <span className="text-gray-500 mb-2 sm:mb-0 md:text-[16px] text-[9px]">
                    {cert.file ? cert.file.name : "Upload certificate here"}
                  </span>
                  <input
                    type="file"
                    id={`fileUpload-${cert.id}`}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileUpload(e, "certificate", cert.id)
                    }
                  />
                  <button
                    className="absolute right-2 bg-lightYellow text-black px-3 py-1 rounded text-sm font-semibold bg-yellow-300"
                    onClick={() =>
                      document.getElementById(`fileUpload-${cert.id}`)?.click()
                    }
                    type="button"
                  >
                    Browse
                  </button>
                </div>
              )}

              <label className="block text-black mb-1">
                Certificate Title*
              </label>
              <input
                type="text"
                placeholder="Certificate Title"
                value={cert.name || ""}
                onChange={(e) =>
                  handleCertificateChange(cert.id, "name", e.target.value)
                }
                className={`border p-2 w-full rounded mb-2 ${
                  validationErrors[`certificate_${cert.id}_name`]
                    ? "border-red-500"
                    : ""
                } ${cert.uploadedDocId ? "bg-gray-100" : ""}`}
                disabled={!!cert.uploadedDocId}
                readOnly={!!cert.uploadedDocId}
              />
              {validationErrors[`certificate_${cert.id}_name`] && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors[`certificate_${cert.id}_name`]}
                </p>
              )}
              <label className="block text-black mb-1">Issued By</label>
              <input
                type="text"
                placeholder="Organization Name"
                value={cert.organization || ""}
                onChange={(e) =>
                  handleCertificateChange(
                    cert.id,
                    "organization",
                    e.target.value
                  )
                }
                className={`border p-2 w-full rounded mb-2 ${
                  cert.uploadedDocId ? "bg-gray-100" : ""
                }`}
                disabled={!!cert.uploadedDocId}
                readOnly={!!cert.uploadedDocId}
              />
              {cert.uploadedDocId && (
                <div className="text-green-600 text-sm mt-2">
                  ✓ Certificate uploaded successfully
                </div>
              )}
            </div>
          ))}
          <div className="flex justify-end">
            <button
              onClick={addCertificate}
              className="bg-lightYellow text-black px-3 py-1 rounded font-semibold bg-yellow-300"
              type="button"
            >
              + Add Certificate
            </button>
          </div>

          <h2 className="text-xl font-semibold mb-4 mt-4">Awards</h2>
          {awards.map((award) => (
            <div
              key={award.id}
              className="relative mb-4 border p-4 rounded shadow bg-white"
            >
              {awards.length > 1 && (
                <button
                  className="absolute -top-2 right-2 text-red-500 text-lg"
                  onClick={() => removeAward(award.id)}
                  type="button"
                >
                  ×
                </button>
              )}

              {(award.uploadedDocId || award.imageUrl) && (
                <div className="mb-4 flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3 border-2 border-gray-200">
                    <img
                      src={
                        award.imageUrl ||
                        (award.uploadedDocId && profileData?.documents
                          ? profileData.documents.find(
                              (doc) => doc.id === award.uploadedDocId
                            )?.url || ""
                          : "")
                      }
                      alt={award.name || "Award"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-semibold">{award.name || "Award"}</span>
                </div>
              )}

              {!award.uploadedDocId && (
                <div className=" relative border-4 border-dotted border-gray-400 p-2 w-full mb-2 rounded-md flex items-center justify-start  md:text-xxl text-sm lg:justify-center">
                  <span className="text-gray-500 mb-2 sm:mb-0 md:text-[16px] text-[9px]">
                    {award.file ? award.file.name : "Upload award image here"}
                  </span>
                  <input
                    type="file"
                    id={`awardFileUpload-${award.id}`}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "award", award.id)}
                  />
                  <button
                    className="absolute right-2 bg-lightYellow text-black px-3 py-1 rounded text-sm font-semibold bg-yellow-300"
                    onClick={() =>
                      document
                        .getElementById(`awardFileUpload-${award.id}`)
                        ?.click()
                    }
                    type="button"
                  >
                    Browse
                  </button>
                </div>
              )}

              <label className="block text-black mb-1">Award Title*</label>
              <input
                type="text"
                placeholder="Award Title"
                value={award.name || ""}
                onChange={(e) =>
                  handleAwardChange(award.id, "name", e.target.value)
                }
                className={`border p-2 w-full rounded mb-2 ${
                  validationErrors[`award_${award.id}_name`]
                    ? "border-red-500"
                    : ""
                } ${award.uploadedDocId ? "bg-gray-100" : ""}`}
                disabled={!!award.uploadedDocId}
                readOnly={!!award.uploadedDocId}
              />
              {validationErrors[`award_${award.id}_name`] && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors[`award_${award.id}_name`]}
                </p>
              )}
              <label className="block text-black mb-1">Issued By</label>
              <input
                type="text"
                placeholder="Organization Name"
                value={award.organization || ""}
                onChange={(e) =>
                  handleAwardChange(award.id, "organization", e.target.value)
                }
                className={`border p-2 w-full rounded mb-2 ${
                  award.uploadedDocId ? "bg-gray-100" : ""
                }`}
                disabled={!!award.uploadedDocId}
                readOnly={!!award.uploadedDocId}
              />
              {award.uploadedDocId && (
                <div className="text-green-600 text-sm mt-2">
                  ✓ Award uploaded successfully
                </div>
              )}
            </div>
          ))}
          <div className="flex justify-end">
            <button
              onClick={addAward}
              className="bg-lightYellow text-black px-3 py-1 rounded font-semibold bg-yellow-300"
              type="button"
            >
              + Add Award
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Social Media Links */}
      {step === 4 && (
        <div className="max-w-full w-full md:w-5xl mx-auto px-2 sm:px-6">
          <h2 className="text-xl font-semibold mb-4">Social Media Links</h2>

          <div className="flex flex-col sm:flex-row items-center w-full sm:w-1/2 mb-2">
            <FontAwesomeIcon
              icon={faLinkedin}
              className="text-blue-600 text-3xl mb-2 sm:mb-0 sm:me-3 mr-0 cursor-pointer"
            />
            <input
              type="text"
              name="linkedin"
              placeholder="LinkedIn"
              value={formData.linkedin}
              onChange={handleInputChange}
              className="border p-2 w-full rounded outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center w-full sm:w-1/2 mb-2">
            <FontAwesomeIcon
              icon={faFacebook}
              className="text-blue-800 text-3xl mb-2 sm:mb-0 sm:mr-3 mr-0 cursor-pointer"
            />
            <input
              type="text"
              name="facebook"
              placeholder="Facebook"
              value={formData.facebook}
              onChange={handleInputChange}
              className="border p-2 w-full rounded outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center w-full sm:w-1/2 mb-2">
            <FontAwesomeIcon
              icon={faInstagram}
              className="text-pink-600 text-3xl mb-2 sm:mb-0 sm:mr-3 mr-0 cursor-pointer"
            />
            <input
              type="text"
              name="instagram"
              placeholder="Instagram"
              value={formData.instagram}
              onChange={handleInputChange}
              className="border p-2 w-full rounded outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center w-full sm:w-1/2 mb-2">
            <FontAwesomeIcon
              icon={faXTwitter}
              className="text-blue-600 text-3xl mb-2 sm:mb-0 sm:mr-3 mr-0 cursor-pointer"
            />
            <input
              type="text"
              name="twitter"
              placeholder="Twitter"
              value={formData.twitter}
              onChange={handleInputChange}
              className="border p-2 w-full rounded outline-none"
            />
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-end mt-6 space-x-4">
        {step > 1 && (
          <button
            onClick={prevStep}
            className="border border-customGrey text-black px-4 py-2 rounded"
            disabled={isSubmitting}
            type="button"
          >
            Back
          </button>
        )}

        {step < 4 ? (
          <button
            onClick={nextStep}
            className="bg-yellow-300 text-black px-4 py-2 rounded"
            disabled={isSubmitting}
            type="button"
          >
            Save & Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className={`bg-red-500 text-white px-4 py-2 rounded ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </div>
            ) : (
              "Submit"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Detailsform;
