import { useState, useEffect } from "react";
import Todo from "./Todo";

export default function Todos({
  error,
  setError,
  // setFlash,
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
            <Todo key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </div>
  );
}
