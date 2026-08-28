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
  const [page, setPage] = useState(1);
  const [deletingUser, setDeletingUser] = useState(null);
  // For pagination:
  const [totalPages, setTotalPages] = useState(1);
  // For searching a specific user:
  const [search, setSearch] = useState("");
  // const [sortBy, setSortBy] = useState("Username");

  const navigate = useNavigate();
  const fetchUsers = async (page = 1, search = "") => {
    // let response;
    // if (sortBy === "Username") {
    const response = await fetch(`/users?page=${page}&search=${search}`, {
      // "?page=${page}"" is for pagination and "&search=${search}" is for searching
      // Before pagination and search it was just "users"
      credentials: "include",
    });
    // }
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Something went wrong");
      return;
    }
    const data = await response.json();
    console.log("Users API response:", data);
    setUsers(data.users);
    setTotalPages(data.totalPages);
  };
  useEffect(() => {
    fetchUsers(page, search);
  }, [
    page,
    search,
    // sortBy
  ]); // Execute the "fetchUsers" function whenever "page" or "search" or "sortBy" change.
  const handleOk = () => {
    navigate(-1);
    setError(null);
  };
  // Specifically for the "isAdmin" middlewares:
  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={handleOk} className="btn2">
          Ok
        </button>
      </div>
    );
  }
  const handleDelete = (userId) => {
    setDeletingUser(userId);
    setIsDeleting(true);
  };
  const handleDeleteYes = async (userId) => {
    try {
      const response = await fetch(`/users/${userId}`, {
        // Fetching the user from the back-end
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to delete user.");
        return;
      }
      // Removing the user from the state variable:
      setUsers((currUsers) => currUsers.filter((u) => u.id !== userId));
      // Reseting the relevant state variables:
      setDeletingUser(null);
      setIsDeleting(false);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Something went wrong while deleting the user.");
    }
  };
  const handleDeleteNo = () => {
    setDeletingUser(null);
    setIsDeleting(false);
  };
  return (
    <div>
      <h1>All the registered users</h1>
      {!isDeleting && !isLoggingOut && (
        <div>
          <input
            type="text"
            placeholder={"Search user..."}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      )}
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
      {!isDeleting && users && users.length > 0 && !isLoggingOut && (
        <div>
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span style={{ margin: "0 10px" }}>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
