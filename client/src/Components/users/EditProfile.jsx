import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function EditProfile({
  setCurrentUser,
  //   setFlash,
  setIsProfileEditing,
  error,
  setError,
  //   passwordError,
  //   setPasswordError,
}) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  //   const [currentPassword, setCurrentPassword] = useState("");
  //   const [newPassword, setNewPassword] = useState("");
  //   const [confirmNewPassword, setConfirmNewPassword] = useState("");
  //   const [passwordMatch, setPasswordMatch] = useState(null);
  //   const [newPasswordStrenghtStatus, setNewPasswordStrenghtStatus] = useState({
  //     length: false,
  //     upper: false,
  //     lower: false,
  //     number: false,
  //   });

  useEffect(() => {
    // const fetchProfile = async () => {
    //   const res = await fetch("/users/profile", {
    //     credentials: "include",
    //   });
    //   const data = await res.json();
    //   setUsername(data.username);
    // };

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
  //   useEffect(() => {
  //     checkPassword(newPassword);
  //   }, [newPassword]);
  // We check if the password is strong or not, both in Back-End and Front-End:
  //   const isStrongPassword = (password) => {
  //     if (password.length < 8) return false;
  //     let hasUpper = false;
  //     let hasLower = false;
  //     let hasNumber = false;
  //     for (let char of password) {
  //       if (char >= "A" && char <= "Z") hasUpper = true;
  //       else if (char >= "a" && char <= "z") hasLower = true;
  //       else if (char >= "0" && char <= "9") hasNumber = true;
  //     }
  //     return hasUpper && hasLower && hasNumber;
  //   };
  // Checking if each character of the password has one of the
  // conditions of a strong password:
  //   const checkPassword = (password) => {
  //     setNewPasswordStrenghtStatus({
  //       length: false,
  //       upper: false,
  //       lower: false,
  //       number: false,
  //     });
  //     for (let char of password) {
  //       if (char >= "A" && char <= "Z")
  //         setNewPasswordStrenghtStatus((currNewPasswordStrenghtStatus) => ({
  //           ...currNewPasswordStrenghtStatus,
  //           upper: true,
  //         }));
  //       else if (char >= "a" && char <= "z")
  //         setNewPasswordStrenghtStatus((currNewPasswordStrenghtStatus) => ({
  //           ...currNewPasswordStrenghtStatus,
  //           lower: true,
  //         }));
  //       else if (char >= "0" && char <= "9")
  //         setNewPasswordStrenghtStatus((currNewPasswordStrenghtStatus) => ({
  //           ...currNewPasswordStrenghtStatus,
  //           number: true,
  //         }));
  //     }
  //     if (password.length >= 8)
  //       setNewPasswordStrenghtStatus((currNewPasswordStrenghtStatus) => ({
  //         ...currNewPasswordStrenghtStatus,
  //         length: true,
  //       }));
  //   };
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    // If there's already an error, we don't need it now because it's been already handled
    setError(null);
    // setPasswordError(null);
    // Validate password fields:
    // if (currentPassword || newPassword || confirmNewPassword) {
    //   // Either all the <input /> tags should be filled or empty:
    //   if (!currentPassword || !newPassword || !confirmNewPassword) {
    //     setPasswordError(
    //       "Please either fill all password fields or leave all empty",
    //     );
    //     return;
    //   }
    //   if (!isStrongPassword(newPassword)) {
    //     setError("Your new password should be strong!");
    //     return;
    //   }
    //   // Confirming the new password:
    //   if (newPassword !== confirmNewPassword) {
    //     setPasswordError("New passwords do not match");
    //     return;
    //   }
    // }
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
    // if (currentPassword) {
    //   const passwordResponse = await fetch("/users/change-password", {
    //     method: "PUT",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     credentials: "include",
    //     body: JSON.stringify({
    //       currentPassword,
    //       newPassword,
    //     }),
    //   });

    //   const passwordData = await passwordResponse.json();
    //   // Error-Handling of changing password:
    //   if (!passwordResponse.ok) {
    //     setPasswordError(passwordData.message);
    //     return;
    //   }
    // }
    setCurrentUser(updatedUser.user); // After assigning the flash message as
    // a separate key-value pair to the "user" object (in controller),
    // "updatedUser" becomes an object with 2 key-value pairs. For updating
    // the "currentUser" we don't need the first pair (whose key is "message")
    // we just have to fetch the value of the second key("user")
    // setFlash(updatedUser.message);
    setIsProfileEditing(false);
    navigate("/profile");
  };
  //   const checkPasswordMatch = (password, confirmPassword) => {
  //     if (!password && !confirmPassword) {
  //       setPasswordMatch(null);
  //       return;
  //     }
  //     if (password === confirmPassword) {
  //       setPasswordMatch(true);
  //     } else {
  //       setPasswordMatch(false);
  //     }
  //   };
  const cancelSubmit = () => {
    setError(null);
    setIsProfileEditing(false);
    navigate("/profile");
  };
  const handleError = () => {
    setIsProfileEditing(false);
    setError(null);
    // setPasswordError(null);
  };
  return (
    <div>
      {!error && (
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
            {/* <div>
                    <label>
                      <strong>Current Password:</strong>
                    </label>
                    <input
                      type="password"
                      placeholder="Current Password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      class="form-control"
                      style={{
                        border: "1px solid black",
                        margin: "auto",
                        textAlign: "center",
                        width: "250px",
                        height: "40px",
                        marginTop: "10px",
                      }}
                    />
                  </div> */}
            {/* <div>
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
                      class="form-control"
                      style={{
                        border: "1px solid black",
                        margin: "auto",
                        textAlign: "center",
                        width: "250px",
                        height: "40px",
                        marginTop: "10px",
                      }}
                    />
                  </div> */}
            {/* <div>
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
                        class="form-control"
                        style={{
                          border: "1px solid black",
                          margin: "auto",
                          textAlign: "center",
                          width: "250px",
                          height: "40px",
                          marginTop: "10px",
                        }}
                      />
                    </div>
                  </div> */}
            {/* <br /> */}
            {/* {(newPassword || confirmNewPassword) && (
            <div className="my-3">
              <div
                style={{
                  color: newPasswordStrenghtStatus.length ? "black" : "gray",
                }}
              >
                {newPasswordStrenghtStatus.length ? "✔" : "✖"} at least 8
                characters
              </div>
              <div
                style={{
                  color: newPasswordStrenghtStatus.upper ? "black" : "gray",
                }}
              >
                {newPasswordStrenghtStatus.upper ? "✔" : "✖"} one uppercase
                letter
              </div>
              <div
                style={{
                  color: newPasswordStrenghtStatus.lower ? "black" : "gray",
                }}
              >
                {newPasswordStrenghtStatus.lower ? "✔" : "✖"} one lowercase
                letter
              </div>
              <div
                style={{
                  color: newPasswordStrenghtStatus.number ? "black" : "gray",
                }}
              >
                {newPasswordStrenghtStatus.number ? "✔" : "✖"} one number
              </div>
            </div>
          )} */}
            {/* {newPassword && confirmNewPassword && passwordMatch === true && (
            <div style={{ color: "black" }}>
              <strong>✔ New passwords match</strong>
            </div>
          )}
          {newPassword && confirmNewPassword && passwordMatch === false && (
            <div style={{ color: "gray" }}>
              <strong>✖ New passwords do not match</strong>
            </div>
          )} */}
            <button type="submit" disabled={!username}>
              Save Changes
            </button>
          </form>

          <button type="submit" onClick={cancelSubmit}>
            Cancel
          </button>
        </div>
      )}
      {error && (
        <div>
          {/* {passwordError && <p style={{ color: "red" }}>{passwordError}</p>} */}
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit" onClick={handleError}>
            Ok
          </button>
        </div>
      )}
    </div>
  );
}
