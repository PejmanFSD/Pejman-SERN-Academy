import "../../App.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Users({
  users,
  setUsers,
  error,
  setError,
  isLoggingOut,
  isDeleting,
  setIsDeleting,
  currentUser,
}) {
  const [deletingUser, setDeletingUser] = useState(null);
  const navigate = useNavigate();
  const fetchUsers = async () => {
    let response;
    response = await fetch(`/users`, {
      // "?page=${page}"" is for pagination and "&search=${search}" is for searching
      // Before pagination and search it was just "users"
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Something went wrong");
      return;
    }
    const data = await response.json();
    setUsers(data.users);
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  const handleOk = () => {
    navigate(-1);
    setError(null);
  };
  const handleDelete = (userId) => {
    setDeletingUser(userId);
    setIsDeleting(true);
  };
  const handleDeleteYes = async (userId) => {
    await fetch(`/users/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });
    // Removing the user from the state variable:
    setUsers((currUsers) => currUsers.filter((u) => u.id !== userId));
    setDeletingUser(null);
    setIsDeleting(false);
  };
  const handleDeleteNo = () => {
    setDeletingUser(null);
    setIsDeleting(false);
  };
  return (
    <div>
      <h1>All the registered users</h1>
      {(!users || (users && users.length === 0)) && !isLoggingOut ? (
        <div>No users available</div>
      ) : (
        !isLoggingOut && (
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>
                    {user.role === "Admin" && !isDeleting ? (
                      <div>Admin &#128515;</div>
                    ) : (
                      !isDeleting && (
                        <button onClick={() => handleDelete(user.id)}>
                          Delete
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
      {isDeleting && deletingUser && (
        <div>
          {`Are you sure you want to delete ${users.find((u) => u.id === deletingUser).username}?`}
          <br />
          <button onClick={() => handleDeleteYes(deletingUser)}>Yes</button>
          <button onClick={handleDeleteNo}>Cancel</button>
        </div>
      )}
    </div>
  );
}
