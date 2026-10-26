import {
  useNavigate,
  useLocation, // For hiding the button of the current page
} from "react-router-dom";
import MySchool from "../schools/MySchool";

export default function Profile({
  currentUser,
  setIsProfileEditing,
  isLoggingOut,
  isDeleting,
  setIsDeleting
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const handleEditMyProfile = () => {
    navigate("/edit-profile");
    setIsProfileEditing(true);
  };
  return (
    <div>
      {currentUser && !isLoggingOut && <h1>My Profile</h1>}
      {currentUser && !isLoggingOut && (
        <div>
          <div>
            <strong>Username: </strong>
            {currentUser.username}
          </div>
          <div>
            <strong>Role: </strong>
            {currentUser.role}
          </div>
          <button onClick={handleEditMyProfile}>Edit My Profile</button>
        </div>
      )}
      <br />
      {currentUser?.role === "Principal" &&
        <MySchool
          isDeleting={isDeleting}
          setIsDeleting={setIsDeleting}
        />
      }
    </div>
  );
}
