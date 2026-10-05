import { useState, useEffect } from "react";

export default function Todos({
  error,
  setError,
  currentUser,
  // setFlash,
  isLoggingOut,
  isDeleting,
  setIsDeleting,
  isProfileEditing,
}) {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getTodos = async () => {
      try {
        const response = await fetch("/todos", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to get todos.");
        }

        setTodos(data);
      } catch (error) {
        console.error("Error getting todos:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    getTodos();
  }, []);

  if (isLoading) {
    return <p>Loading todos...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>My Todos</h2>
      {todos.length === 0 ? (
        <p>You don't have any todos yet.</p>
      ) : (
        <div>
          {todos.map((todo) => (
            <div key={todo.id}>
              <div>{todo.text}</div>
              <div>Created: {new Date(todo.created_date).toLocaleDateString()}</div>
              <div>
                Due:{" "}
                {todo.due_date
                  ? new Date(todo.due_date).toLocaleDateString()
                  : "No due date"}
              </div>
              <div>Status: {todo.status ? "Completed" : "Not completed"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
