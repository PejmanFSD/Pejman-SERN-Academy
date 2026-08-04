import "../../App.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Users({
  users,
  setUsers,
  error,
  setError,
  isLoggingOut,
  currentUser,
}) {
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
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
}
