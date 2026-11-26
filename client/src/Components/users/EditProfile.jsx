import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function EditProfile({
  currentUser,
  setCurrentUser,
  //   setFlash,
  setIsProfileEditing,
  error,
  setError,
  passwordError,
  setPasswordError,
}) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [newPasswordStrenghtStatus, setNewPasswordStrenghtStatus] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [expertise, setExpertise] = useState([]);
  const [expertiseLoading, setExpertiseLoading] = useState(false);
  const [expertiseSaving, setExpertiseSaving] = useState(false);
  const [expertiseError, setExpertiseError] = useState("");
  const [expertiseMessage, setExpertiseMessage] = useState("");
  const [isEditingExpertise, setIsEditingExpertise] = useState(false);
  const [isDeletingSubject, setIsDeletingSubject] = useState(false);
  const [deletingSubjectId, setDeletingSubjectId] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/users/profile", {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load profile");
          return;
        }
        setUsername(data.user.username);
      } catch (err) {
        setError("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);
  useEffect(() => {
    checkPassword(newPassword);
  }, [newPassword]);
  // We check if the password is strong or not, both in Back-End and Front-End:
  const isStrongPassword = (password) => {
    if (password.length < 8) return false;
    let hasUpper = false;
    let hasLower = false;
    let hasNumber = false;
    for (let char of password) {
      if (char >= "A" && char <= "Z") hasUpper = true;
      else if (char >= "a" && char <= "z") hasLower = true;
      else if (char >= "0" && char <= "9") hasNumber = true;
    }
    return hasUpper && hasLower && hasNumber;
  };
  // Checking if each character of the password has one of the
  // conditions of a strong password:
  const checkPassword = (password) => {
    setNewPasswordStrenghtStatus({
      length: false,
      upper: false,
      lower: false,
      number: false,
    });
    for (let char of password) {
      if (char >= "A" && char <= "Z")
        setNewPasswordStrenghtStatus((currNewPasswordStrenghtStatus) => ({
          ...currNewPasswordStrenghtStatus,
          upper: true,
        }));
      else if (char >= "a" && char <= "z")
        setNewPasswordStrenghtStatus((currNewPasswordStrenghtStatus) => ({
          ...currNewPasswordStrenghtStatus,
          lower: true,
        }));
      else if (char >= "0" && char <= "9")
        setNewPasswordStrenghtStatus((currNewPasswordStrenghtStatus) => ({
          ...currNewPasswordStrenghtStatus,
          number: true,
        }));
    }
    if (password.length >= 8)
      setNewPasswordStrenghtStatus((currNewPasswordStrenghtStatus) => ({
        ...currNewPasswordStrenghtStatus,
        length: true,
      }));
  };
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    // If there's already an error, we don't need it now because it's been already handled
    setError(null);
    setPasswordError(null);
    // Validate password fields:
    if (currentPassword || newPassword || confirmNewPassword) {
      //   // Either all the <input /> tags should be filled or empty:
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        setPasswordError(
          "Please either fill all password fields or leave all empty",
        );
        return;
      }
      if (!isStrongPassword(newPassword)) {
        setError("Your new password should be strong!");
        return;
      }
      // Confirming the new password:
      if (newPassword !== confirmNewPassword) {
        setPasswordError("New passwords do not match");
        return;
      }
    }
    // Updating the profile:
    const response = await fetch("/users/edit-profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username }),
    });
    const updatedUser = await response.json();
    // Handling all sorts of error:
    if (!response.ok) {
      if (updatedUser.errors) {
        const firstError = Object.values(updatedUser.errors)[0];
        setError(firstError);
      } else {
        setError(updatedUser.message || "Profile update failed");
      }
      return;
    }
    // Changing password:
    if (currentPassword) {
      const passwordResponse = await fetch("/users/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const passwordData = await passwordResponse.json();
      //   // Error-Handling of changing password:
      if (!passwordResponse.ok) {
        setPasswordError(passwordData.message);
        return;
      }
    }
    setCurrentUser(updatedUser.user); // After assigning the flash message as
    // a separate key-value pair to the "user" object (in controller),
    // "updatedUser" becomes an object with 2 key-value pairs. For updating
    // the "currentUser" we don't need the first pair (whose key is "message")
    // we just have to fetch the value of the second key("user")
    // setFlash(updatedUser.message);
    setIsProfileEditing(false);
    navigate("/profile");
  };
  const checkPasswordMatch = (password, confirmPassword) => {
    if (!password && !confirmPassword) {
      setPasswordMatch(null);
      return;
    }
    if (password === confirmPassword) {
      setPasswordMatch(true);
    } else {
      setPasswordMatch(false);
    }
  };
  useEffect(() => {
    if (currentUser?.role !== "Teacher") return;
    const fetchExpertise = async () => {
      setExpertiseLoading(true);
      setExpertiseError("");
      try {
        const response = await fetch("/teachers/my-expertise", {
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch expertise.");
        }
        setExpertise(data.expertise || []);
      } catch (err) {
        setExpertiseError(err.message);
      } finally {
        setExpertiseLoading(false);
      }
    };
    fetchExpertise();
  }, [currentUser?.role]);
  useEffect(() => {
    if (currentUser?.role !== "Teacher") return;
    const fetchCategories = async () => {
      try {
        const response = await fetch("/subject-categories", {
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch categories.");
        }
        setCategories(data.categories || []);
      } catch (err) {
        setExpertiseError(err.message);
      }
    };
    fetchCategories();
  }, [currentUser?.role]);
  useEffect(() => {
    if (!selectedCategory) {
      setAvailableSubjects([]);
      return;
    }
    const fetchSubjects = async () => {
      setExpertiseError("");
      try {
        const response = await fetch(
          `/subject-categories/${selectedCategory}/subjects`,
          { credentials: "include" },
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch subjects.");
        }
        setAvailableSubjects(data.subjects || []);
      } catch (err) {
        setExpertiseError(err.message);
        setAvailableSubjects([]);
      }
    };
    fetchSubjects();
  }, [selectedCategory]);
  const handleAddExpertise = () => {
    if (!selectedSubjectId) {
      setExpertiseError("Please choose a subject.");
      return;
    }
    const subject = availableSubjects.find(
      (s) => s.subject_id === Number(selectedSubjectId),
    );
    if (!subject) return;
    const newExpertise = {
      subject_id: subject.subject_id,
      subject_name: subject.subject_name,
      category_id: Number(selectedCategory),
      category_name: categories.find(
        (category) => category.category_id === Number(selectedCategory),
      )?.category_name,
    };
    setExpertise((prev) => {
      if (
        prev.some((subject) => subject.subject_id === newExpertise.subject_id)
      ) {
        return prev;
      }
      return [...prev, newExpertise];
    });
    const alreadyExists = expertise.some(
      (s) => s.subject_id === subject.subject_id,
    );
    if (alreadyExists) {
      setExpertiseError("This subject is already in your expertise.");
      return;
    }
    // setExpertise((prev) => [...prev, subject]);
    setSelectedSubjectId("");
    setSelectedCategory("");
    setAvailableSubjects([]);
    setExpertiseError("");
    setExpertiseMessage("");
  };
  const handleRemoveExpertise = (id) => {
    setDeletingSubjectId(id);
    setIsDeletingSubject(true);
  };
  const handleRemoveExpertiseYes = (subjectId) => {
    setExpertise((prev) =>
      prev.filter((subject) => subject.subject_id !== subjectId),
    );
    setExpertiseError("");
    setExpertiseMessage("");
    setDeletingSubjectId(null);
    setIsDeletingSubject(false);
  };
  const handleRemoveExpertiseNo = () => {
    setDeletingSubjectId(null);
    setIsDeletingSubject(false);
  };
  const handleSaveExpertise = async () => {
    if (expertise.length === 0) {
      setExpertiseError(
        "You must have at least one subject in your expertise.",
      );
      return;
    }
    setExpertiseSaving(true);
    setExpertiseError("");
    setExpertiseMessage("");
    try {
      const response = await fetch("/teachers/my-expertise", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          expertise: expertise.map((subject) => subject.subject_id),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update expertise.");
      }
      setExpertiseMessage(data.message);
    } catch (err) {
      setExpertiseError(err.message);
    } finally {
      setExpertiseSaving(false);
      setIsEditingExpertise(false);
    }
  };
  const EditMyTeachingExpertise = () => {
    setIsEditingExpertise(true);
  };
  const handleCancelExpertise = () => {
    setIsEditingExpertise(false);
  };
  const cancelSubmit = () => {
    setError(null);
    setIsProfileEditing(false);
    navigate("/profile");
  };
  const handleError = () => {
    setIsProfileEditing(false);
    setError(null);
    setPasswordError(null);
  };
  return (
    <div>
      {!error &&
        !passwordError &&
        !isEditingExpertise &&
        !isDeletingSubject && (
          <div>
            <form onSubmit={handleProfileUpdate}>
              <div>
                <label>
                  <strong>Username:</strong>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>
                  <strong>Current Password:</strong>
                </label>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <label>
                  <strong>New Password:</strong>
                </label>
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewPassword(value);
                    checkPasswordMatch(value, confirmNewPassword);
                  }}
                />
              </div>
              <div>
                <label>
                  <strong>Confirm New Password:</strong>
                </label>
                <div>
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmNewPassword}
                    onChange={(e) => {
                      const value = e.target.value;
                      setConfirmNewPassword(value);
                      checkPasswordMatch(newPassword, value);
                    }}
                  />
                </div>
              </div>
              <br />
              {(newPassword || confirmNewPassword) && (
                <div>
                  <div>
                    {newPasswordStrenghtStatus.length ? "✔" : "✖"} at least 8
                    characters
                  </div>
                  <div>
                    {newPasswordStrenghtStatus.upper ? "✔" : "✖"} one uppercase
                    letter
                  </div>
                  <div>
                    {newPasswordStrenghtStatus.lower ? "✔" : "✖"} one lowercase
                    letter
                  </div>
                  <div>
                    {newPasswordStrenghtStatus.number ? "✔" : "✖"} one number
                  </div>
                </div>
              )}
              {newPassword && confirmNewPassword && passwordMatch === true && (
                <div>
                  <strong>✔ New passwords match</strong>
                </div>
              )}
              {newPassword && confirmNewPassword && passwordMatch === false && (
                <div>
                  <strong>✖ New passwords do not match</strong>
                </div>
              )}
              <button type="submit" disabled={!username}>
                Save Changes
              </button>
            </form>
            <button type="submit" onClick={cancelSubmit}>
              Cancel
            </button>
          </div>
        )}
      {currentUser?.role === "Teacher" &&
        !isEditingExpertise &&
        !isDeletingSubject && (
          <button onClick={EditMyTeachingExpertise}>
            Edit My Teaching Expertise
          </button>
        )}
      {currentUser?.role === "Teacher" && isEditingExpertise && (
        <h3>Edit My Teaching Expertise</h3>
      )}
      {currentUser?.role === "Teacher" &&
        isEditingExpertise &&
        !isDeletingSubject && (
          <div className="edit-expertise">
            {expertiseLoading ? (
              <p>Loading your expertise...</p>
            ) : (
              <>
                {/* Category dropdown */}
                <h4>Add New Subject</h4>
                <div>
                  <label htmlFor="expertiseCategory">Choose a Category:</label>
                  <select
                    id="expertiseCategory"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedSubjectId("");
                    }}
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((category) => (
                      <option
                        key={category.category_id}
                        value={category.category_id}
                      >
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Subject dropdown */}
                {selectedCategory && (
                  <div>
                    <label htmlFor="expertiseSubject">Choose a Subject:</label>
                    <select
                      id="expertiseSubject"
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                    >
                      <option value="">-- Select Subject --</option>
                      {availableSubjects.map((subject) => (
                        <option
                          key={subject.subject_id}
                          value={subject.subject_id}
                        >
                          {subject.subject_name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddExpertise}
                      disabled={!selectedSubjectId}
                    >
                      Add Subject
                    </button>
                  </div>
                )}
                {/* Existing and newly selected expertise */}
                <h4>My Expertise</h4>
                {expertise.length === 0 ? (
                  <p>You must select at least one subject.</p>
                ) : (
                  <ul>
                    {expertise.map((subject) => (
                      <li key={subject.subject_id}>
                        <strong>{subject.subject_name}</strong>
                        {" (Category: "}
                        {subject.category_name}
                        {")"}
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveExpertise(subject.subject_id)
                          }
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {/* Feedback */}
                {/* {expertiseError && (
                <p style={{ color: "red" }}>{expertiseError}</p>
              )}
              {expertiseMessage && (
                <p style={{ color: "green" }}>{expertiseMessage}</p>
              )} */}
                {/* Save */}
                <button
                  type="button"
                  onClick={handleSaveExpertise}
                  disabled={
                    expertiseSaving ||
                    expertiseLoading ||
                    expertise.length === 0
                  }
                >
                  {expertiseSaving ? "Saving..." : "Save Expertise"}
                </button>
                {/* Cancel */}
                <button
                  type="button"
                  onClick={handleCancelExpertise}
                  disabled={expertiseSaving || expertiseLoading}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        )}
      {isDeletingSubject && (
        <div>
          <div>{`Are you sure you want to delete ${expertise.find((e) => e.subject_id === deletingSubjectId).subject_name}?`}</div>
          <button onClick={() => handleRemoveExpertiseYes(deletingSubjectId)}>
            Yes
          </button>
          <button onClick={() => handleRemoveExpertiseNo()}>No</button>
        </div>
      )}
      {(error || passwordError) && (
        <div>
          {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit" onClick={handleError}>
            Ok
          </button>
        </div>
      )}
    </div>
  );
}
