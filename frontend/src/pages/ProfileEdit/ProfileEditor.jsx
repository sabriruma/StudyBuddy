import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import floridaCities from "../../data/cities.json";
import subjects from "../../data/courses.json";
import majors from "../../data/majors.json";
import { FiEdit2, FiSave, FiPlus, FiX, FiUpload, FiUser } from "react-icons/fi";

const studyEnvironmentOptions = ["Quiet", "Moderate", "Collaborative"];
const studyMethodOptions = ["Solo", "One-on-One", "Group"];
const studyTimeOptions = ["Morning", "Afternoon", "Night"];
const academicLevelOptions = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Graduate",
];
const importanceOptions = Array.from({ length: 10 }, (_, i) => String(i + 1));
const defaultAvatars = [
  "/SBmascot.png",
  "/SBmascotG.png",
  "/SBmascotR.png",
  "/sb_boba.png",
  "/sb_fishing.png",
  "/sb_gamer.png",
  "/studybuddy-mad-gamer.png",
  "/sb-study.png",
  "/SBMascotTeach.png",
];

const AutocompleteDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  className,
  useCode = false,
}) => {
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!value) {
      setFilteredOptions(options);
      return;
    }

    const filtered = options.filter((option) => {
      // Handle different data types - search by name but can store code
      const optionText =
        typeof option === "string"
          ? option
          : typeof option === "object" && option.name
          ? option.name
          : typeof option === "object" && option.code
          ? option.code
          : String(option);

      // Also search by code if it exists
      const optionCode =
        typeof option === "object" && option.code ? option.code : "";

      return (
        optionText.toLowerCase().includes(value.toLowerCase()) ||
        optionCode.toLowerCase().includes(value.toLowerCase())
      );
    });
    setFilteredOptions(filtered);
  }, [value, options]);

  const handleSelect = (selectedOption) => {
    // Return code if useCode is true and code exists, otherwise return name/string
    let selectedValue;
    let finalSubmit = selectedOption?.code;
    if (useCode && typeof selectedOption === "object" && selectedOption.code) {
      selectedValue = selectedOption.code;
    } else if (typeof selectedOption === "string") {
      selectedValue = selectedOption;
    } else if (typeof selectedOption === "object" && selectedOption.name) {
      selectedValue = selectedOption.name;
    } else {
      selectedValue = String(selectedOption);
    }

    onChange(finalSubmit === undefined ? selectedValue : finalSubmit);
    setShowDropdown(false);
  };
  // displaying of the name and course id of subject
  const getDisplayText = (option) => {
    if (typeof option === "string") {
      return option;
    } else if (typeof option === "object" && option.name && option.code) {
      return `${option.name} (${option.code})`;
    } else if (typeof option === "object" && option.name) {
      return option.name;
    } else if (typeof option === "object" && option.code) {
      return option.code;
    } else {
      return String(option);
    }
  };

  // Helper function to get the current display value
  const getCurrentDisplayValue = () => {
    if (!value) return "";

    // Find the matching option to display its name instead of code
    const matchingOption = options.find((option) => {
      if (typeof option === "string") return option === value;
      if (useCode && option.code) return option.code === value;
      if (option.name) return option.name === value;
      return String(option) === value;
    });

    if (
      matchingOption &&
      typeof matchingOption === "object" &&
      matchingOption.name &&
      useCode
    ) {
      // If we're using codes but want to display the name in the input
      return matchingOption.name;
    }

    return value;
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={getCurrentDisplayValue()}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:!bg-gray-700"
      />
      {showDropdown && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200">
          {filteredOptions.map((option, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer"
              onMouseDown={() => handleSelect(option)}
            >
              {getDisplayText(option)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
const ProfileEditor = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          setFormData({
            ...data,
            courses: data.courses || [""],
          });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCourseChange = (index, value) => {
    console.log("VALUE:", value);
    const updatedCourses = [...formData.courses];
    updatedCourses[index] = value;
    setFormData((prev) => ({ ...prev, courses: updatedCourses }));
  };

  const addCourse = () => {
    setFormData((prev) => ({ ...prev, courses: [...prev.courses, ""] }));
  };

  const removeCourse = (index) => {
    const updatedCourses = formData.courses.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, courses: updatedCourses }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setFormData((prev) => ({ ...prev, avatar: downloadURL }));
      setAvatarFile(downloadURL);
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, formData, { merge: true });
      setProfile(formData);
      setEditMode(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  if (!profile) {
    return (
      <div className="flex min-h-screen from-indigo-50 to-blue-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-blue-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen from-slate-50 to-slate-slate-800">
      <div className="flex-1 overflow-y-auto">
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-700/50 rounded-3xl shadow-xl overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-cyan-500 to-primary-500 p-8 text-white">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      {formData.avatar ? (
                        <img
                          src={formData.avatar}
                          alt="Profile"
                          className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full border-4 border-white bg-primary-100 flex items-center justify-center shadow-md">
                          <FiUser className="text-primary-500 text-4xl" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">
                        {editMode ? (
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName || ""}
                            onChange={handleChange}
                            className="!bg-white !text-black border-b border-white/50 focus:border-white focus:outline-none"
                            placeholder="First Name"
                          />
                        ) : (
                          profile.firstName
                        )}{" "}
                        {editMode ? (
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName || ""}
                            onChange={handleChange}
                            className="!bg-white !text-black border-b border-white/50 focus:border-white focus:outline-none"
                            placeholder="Last Name"
                          />
                        ) : (
                          profile.lastName
                        )}
                      </h1>
                      <p className="text-cyan-100">
                        {editMode ? (
                          <input
                            type="text"
                            name="school"
                            value={formData.school || ""}
                            onChange={handleChange}
                            className="!bg-white !text-black border-b border-white/50 focus:border-white focus:outline-none w-full"
                            placeholder="School"
                          />
                        ) : (
                          profile.school
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={editMode ? handleSave : () => setEditMode(true)}
                    className={`ml-4 mt-4 sm:mt-0 inline-flex items-center px-4 py-2 rounded-full shadow-md transition whitespace-nowrap
    ${
      editMode
        ? "bg-white text-primary-500 hover:bg-gray-100"
        : "bg-white text-primary-500 hover:bg-gray-100"
    }`}
                  >
                    {editMode ? (
                      <>
                        <FiSave className="mr-2" />
                        <span>Save Profile</span>
                      </>
                    ) : (
                      <>
                        <FiEdit2 className="mr-2" />
                        <span>Edit Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Profile Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="bg-slate-100 dark:bg-gray-900 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-primary-500 mb-4">
                      Academic Information
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1 dark:text-white">
                          Major
                        </label>
                        {editMode ? (
                          <AutocompleteDropdown
                            options={majors}
                            value={formData.major || ""}
                            onChange={(value) =>
                              handleInputChange("major", value)
                            }
                            placeholder="Enter your major"
                            useCode={true}
                          />
                        ) : (
                          <p className="px-4 py-2 bg-white dark:bg-gray-700/50 rounded-lg">
                            {profile.major || "Not specified"}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1 dark:text-white">
                          Academic Level
                        </label>
                        {editMode ? (
                          <select
                            name="academicLevel"
                            value={formData.academicLevel || ""}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-primary-500 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="">Select level</option>
                            {academicLevelOptions.map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="px-4 py-2 bg-white dark:bg-gray-700/50 rounded-lg">
                            {profile.academicLevel || "Not specified"}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1 dark:text-white">
                          Location
                        </label>
                        {editMode ? (
                          <AutocompleteDropdown
                            options={floridaCities}
                            value={formData.location || ""}
                            onChange={(value) =>
                              handleInputChange("location", value)
                            }
                            placeholder="Enter your city"
                          />
                        ) : (
                          <p className="px-4 py-2 bg-white dark:bg-gray-700/50 rounded-lg">
                            {profile.location || "Not specified"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* background for study pref */}
                  <div className="bg-slate-100 dark:bg-gray-900 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-primary-500 mb-4">
                      Study Preferences
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1 dark:text-white">
                          Preferred Study Environment
                        </label>
                        {editMode ? (
                          <div>
                            <select
                              name="studyEnvironment"
                              value={formData.studyEnvironment || ""}
                              onChange={handleChange}
                              className="w-full px-4 py-2 rounded-lg border border-primary-500 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-2"
                            >
                              <option value="">Select environment</option>
                              {studyEnvironmentOptions.map((env) => (
                                <option key={env} value={env}>
                                  {env}
                                </option>
                              ))}
                            </select>
                            <div className="flex items-center">
                              <span className="text-sm text-gray-900 mr-2 dark:text-white">
                                Importance:
                              </span>
                              <select
                                name="importanceStudyEnvironment"
                                value={
                                  formData.importanceStudyEnvironment || "5"
                                }
                                onChange={handleChange}
                                className="px-3 py-1 rounded-lg border border-primary-200 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              >
                                {importanceOptions.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ) : (
                          <p className="px-4 py-2 bg-white dark:bg-gray-700/50 rounded-lg">
                            {profile.studyEnvironment.charAt(0).toUpperCase() +
                              profile.studyEnvironment.slice(1) ||
                              "Not specified"}
                            {profile.importanceStudyEnvironment && (
                              <span className="ml-2 text-sm text-primary-500">
                                (Importance:{" "}
                                {profile.importanceStudyEnvironment}/10)
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1 dark:text-white">
                          Preferred Study Method
                        </label>
                        {editMode ? (
                          <div>
                            <select
                              name="studyMethod"
                              value={formData.studyMethod || ""}
                              onChange={handleChange}
                              className="w-full px-4 py-2 rounded-lg border border-primary-500 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-2"
                            >
                              <option value="">Select method</option>
                              {studyMethodOptions.map((method) => (
                                <option key={method} value={method}>
                                  {method}
                                </option>
                              ))}
                            </select>
                            <div className="flex items-center">
                              <span className="text-sm text-gray-900 mr-2 dark:text-white">
                                Importance:
                              </span>
                              <select
                                name="importanceStudyMethod"
                                value={formData.importanceStudyMethod || "5"}
                                onChange={handleChange}
                                className="px-3 py-1 rounded-lg border border-primary-200 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              >
                                {importanceOptions.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ) : (
                          <p className="px-4 py-2 bg-white dark:bg-gray-700/50 rounded-lg">
                            {profile.studyMethod.charAt(0).toUpperCase() +
                              profile.studyMethod.slice(1) || "Not specified"}
                            {profile.importanceStudyMethod && (
                              <span className="ml-2 text-sm text-primary-500">
                                (Importance: {profile.importanceStudyMethod}/10)
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="bg-slate-100 dark:bg-gray-900 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-primary-500 mb-4">
                      Study Schedule
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1 dark:text-white">
                          Preferred Study Time
                        </label>
                        {editMode ? (
                          <div>
                            <select
                              name="studyTime"
                              value={formData.studyTime || ""}
                              onChange={handleChange}
                              className="w-full px-4 py-2 rounded-lg border border-primary-500 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-2"
                            >
                              <option value="">Select time</option>
                              {studyTimeOptions.map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                            <div className="flex items-center">
                              <span className="text-sm text-black mr-2 dark:text-white">
                                Importance:
                              </span>
                              <select
                                name="importanceStudyTime"
                                value={formData.importanceStudyTime || "5"}
                                onChange={handleChange}
                                className="px-3 py-1 rounded-lg border border-primary-200 focus:ring-2 dark:bg-gray-700 focus:ring-primary-500 focus:border-primary-500"
                              >
                                {importanceOptions.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ) : (
                          <p className="px-4 py-2 bg-white dark:bg-gray-700/50 rounded-lg">
                            {profile.studyTime.charAt(0).toUpperCase() +
                              profile.studyTime.slice(1) || "Not specified"}
                            {profile.importanceStudyTime && (
                              <span className="ml-2 text-sm text-primary-500">
                                (Importance: {profile.importanceStudyTime}/10)
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-100 dark:bg-gray-900 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-primary-500">
                        Current Courses
                      </h2>
                      {editMode && (
                        <button
                          onClick={addCourse}
                          className="flex items-center text-sm bg-primary-500 text-white px-3 py-1 rounded-lg hover:bg-primary-500 transition"
                        >
                          <FiPlus className="mr-1" />
                          Add Course
                        </button>
                      )}
                    </div>

                    {editMode ? (
                      <div className="space-y-2">
                        {formData.courses?.map((course, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <AutocompleteDropdown
                              options={subjects}
                              value={course}
                              onChange={(value) =>
                                handleCourseChange(index, value)
                              }
                              placeholder="Course name"
                              className="flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => removeCourse(index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                            >
                              <FiX />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {profile.courses?.length > 0 ? (
                          profile.courses.map((course, index) => (
                            <div
                              key={index}
                              className="px-4 py-2 bg-white dark:bg-gray-700/50 rounded-lg"
                            >
                              {course}
                            </div>
                          ))
                        ) : (
                          <p className="px-4 py-2 bg-white dark:bg-gray-700/50 rounded-lg text-gray-500">
                            No courses added
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {editMode && (
                    <div className="bg-slate-100 dark:bg-gray-900 rounded-xl p-6">
                      <h2 className="text-lg font-semibold text-primary-500 mb-4">
                        Choose Avatar
                      </h2>
                      <div className="flex flex-wrap gap-4">
                        {defaultAvatars.map((avatar, index) => (
                          <div
                            key={index}
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, avatar }))
                            }
                            className={`cursor-pointer p-1 rounded-full ${
                              formData.avatar === avatar
                                ? "ring-4 ring-blue-500"
                                : "hover:ring-2 hover:ring-blue-300"
                            }`}
                          >
                            <img
                              src={avatar}
                              alt={`Avatar ${index}`}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
