import { useState } from "react";

export default function Todo({
  todo,
  onTodoCompleted,
  onTodoUndo,
  onTodoUpdated,
  error,
  setError,
}) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(todo.text);
  const [dueDate, setDueDate] = useState(String(todo.due_date).slice(0, 10));
  const [isSaving, setIsSaving] = useState(false);

  const getLocalToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };
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
  const startEditing = () => {
    setText(todo.text);
    setDueDate(String(todo.due_date).slice(0, 10));
    setError("");
    setIsEditing(true);
  };
  const cancelEditing = () => {
    setText(todo.text);
    setDueDate(String(todo.due_date).slice(0, 10));
    setError("");
    setIsEditing(false);
  };
  const handleSave = async (event) => {
    event.preventDefault();
    if (!text.trim()) {
      setError("Todo text is required.");
      return;
    }
    if (!dueDate || dueDate < getLocalToday()) {
      setError("The due date cannot be in the past.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const response = await fetch(`/todos/${todo.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          due_date: dueDate,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not update todo.");
      }
      onTodoUpdated(data);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };
  const formatDate = (date) => {
    if (!date) return "—";
    return String(date).slice(0, 10);
  };
  return (
    // <tr>
    //   <td>{todo.text}</td>
    //   <td>{new Date(todo.created_date).toLocaleDateString()}</td>
    //   <td>
    //     {todo.due_date
    //       ? new Date(todo.due_date).toLocaleDateString()
    //       : "No due date"}
    //   </td>
    //   <td>
    //     {todo.status ? (
    //       <button
    //         type="button"
    //         onClick={handleUndo}
    //         disabled={isCompleting}
    //         aria-label={`Complete ${todo.text}`}
    //         title="Completed"
    //         style={{backgroundColor : isCompleting ? "gray" : "lightGreen", width: "40px"}}
    //         // light green
    //       >
    //         {isCompleting ? "…" : "✓"}
    //       </button>
    //     ) : (
    //       <button
    //         type="button"
    //         onClick={handleComplete}
    //         disabled={isCompleting}
    //         aria-label={`Complete ${todo.text}`}
    //         title="Mark as completed"
    //         style={{backgroundColor : isCompleting ? "gray" : "pink", width: "40px"}}
    //       >
    //         {isCompleting ? "…" : "○"}
    //       </button>
    //     )}
    //     {error && <p role="alert">{error}</p>}
    //   </td>
    // </tr>
    <tr>
      <td>
        {isEditing ? (
          <input
            type="text"
            value={text}
            maxLength={500}
            onChange={(e) => setText(e.target.value)}
            required
          />
        ) : (
          todo.text
        )}
        {error && <div style={{ color: "red" }}>{error}</div>}
      </td>
      <td>{formatDate(todo.created_date)}</td>
      <td>
        {isEditing ? (
          <input
            type="date"
            value={dueDate}
            min={getLocalToday()}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        ) : (
          formatDate(todo.due_date)
        )}
      </td>

      <td>
        {todo.status ? (
          <button
            type="button"
            onClick={handleUndo}
            disabled={isCompleting}
            aria-label={`Complete ${todo.text}`}
            title="Completed"
            style={{
              backgroundColor: isCompleting ? "gray" : "lightGreen",
              width: "40px",
            }}
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
            style={{
              backgroundColor: isCompleting ? "gray" : "pink",
              width: "40px",
            }}
          >
            {isCompleting ? "…" : "○"}
          </button>
        )}
      </td>

      <td>
        {isEditing ? (
          <>
            <button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={cancelEditing} disabled={isSaving}>
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={startEditing}
            disabled={Boolean(todo.status)}
          >
            Edit
          </button>
        )}
      </td>
    </tr>
  );
}
