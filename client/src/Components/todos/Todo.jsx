import { useState } from "react";

export default function Todo({ todo, onTodoCompleted, onTodoUndo, error, setError }) {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    if (todo.status || isCompleting) return;
    setIsCompleting(true);
    setError("");
    try {
      const response = await fetch(`/todos/${todo.id}/complete`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to complete Todo.");
      }
      // Update the Todo in the parent component.
      onTodoCompleted(data);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setIsCompleting(false);
    }
  };
  const handleUndo = async () => {
    if (!todo.status || isCompleting) return;
    setIsCompleting(true);
    setError("");
    try {
      const response = await fetch(`/todos/${todo.id}/undo`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to complete Todo.");
      }
      // Update the Todo in the parent component.
      onTodoUndo(data);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <tr>
      <td>{todo.text}</td>
      <td>{new Date(todo.created_date).toLocaleDateString()}</td>
      <td>
        {todo.due_date
          ? new Date(todo.due_date).toLocaleDateString()
          : "No due date"}
      </td>
      <td>
        {todo.status ? (
          <button
            type="button"
            onClick={handleUndo}
            disabled={isCompleting}
            aria-label={`Complete ${todo.text}`}
            title="Completed"
            style={{backgroundColor : isCompleting ? "gray" : "lightGreen", width: "40px"}}
            // light green
          >
            {isCompleting ? "…" : "✓"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            disabled={isCompleting}
            aria-label={`Complete ${todo.text}`}
            title="Mark as completed"
            style={{backgroundColor : isCompleting ? "gray" : "pink", width: "40px"}}
          >
            {isCompleting ? "…" : "○"}
          </button>
        )}

        {error && <p role="alert">{error}</p>}
      </td>
      {/* <td>{todo.status ? "Completed" : "Not completed"}</td> */}
    </tr>
    // <div>
    //   <h4>{todo.text}</h4>
    //   <div>Created: {new Date(todo.created_date).toLocaleDateString()}</div>
    //   <div>
    //     Due:{" "}
    //     {todo.due_date
    //       ? new Date(todo.due_date).toLocaleDateString()
    //       : "No due date"}
    //   </div>
    //   <div>Status: {todo.status ? "Completed" : "Not completed"}</div>
    // </div>
  );
}
