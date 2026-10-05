import { useState, useEffect } from "react";
import Todo from "./Todo";
import CreateTodo from "./CreateTodo";

export default function Todos({
  error,
  setError,
  // setFlash,
}) {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  // Fetching all the user's todos
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
  // Creating a new todo
  const handleCreateTodo = async (e) => {
    e.preventDefault();

    setError("");

    if (!text.trim()) {
      setError("Please enter a todo.");
      return;
    }

    if (!dueDate) {
      setError("Please select a due date.");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          text: text.trim(),
          due_date: dueDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create todo.");
      }

      // Add the newly-created Todo to the existing array
      setTodos((previousTodos) => [...previousTodos, data]);

      // Clear the form
      setText("");
      setDueDate("");
    } catch (error) {
      console.error("Error creating todo:", error);
      setError(error.message);
    } finally {
      setIsCreating(false);
    }
  };
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
      {/* Creating a new todo */}
      <h4>Create a new todo</h4>
      <CreateTodo
        handleCreateTodo={handleCreateTodo}
        text={text}
        setText={setText}
        dueDate={dueDate}
        setDueDate={setDueDate}
        error={error}
        isCreating={isCreating}
      />
    </div>
  );
}
