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
  const [currentPage, setCurrentPage] = useState(1); // Pagination
  const [startCreating, setStartCreating] = useState(false);

  const todosPerPage = 5;
  const indexOfLastTodo = currentPage * todosPerPage;
  const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
  const currentTodos = todos.slice(indexOfFirstTodo, indexOfLastTodo);
  const totalPages = Math.ceil(todos.length / todosPerPage);

  const today = new Date().toISOString().split("T")[0];

  const startCreatingTodo = () => {
    setStartCreating(true);
  };
  const backToTodos = () => {
    setStartCreating(false);
  };
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

    if (dueDate < today) {
      setError("Due date cannot be before today.");
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
  const handleTodoCompleted = (updatedTodo) => {
    setTodos((previousTodos) =>
      previousTodos.map((todo) =>
        todo.id === updatedTodo.id ? updatedTodo : todo,
      ),
    );
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
      {todos.length === 0 && !startCreating ? (
        <p>You don't have any todos yet.</p>
      ) : (
        !startCreating && (
          // <div>
          //   {todos.map((todo) => (
          //     <Todo key={todo.id} todo={todo} />
          //   ))}
          // </div>
          <div>
            <table>
              <thead>
                <tr>
                  <th>Todo</th>
                  <th>Created Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {currentTodos.map((todo) => (
                  <Todo
                    key={todo.id}
                    todo={todo}
                    onTodoCompleted={handleTodoCompleted}
                    error={error}
                    setError={setError}
                  />
                ))}
              </tbody>
            </table>
            <div>
              <button
                onClick={() => setCurrentPage((page) => page - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span>
                {" "}
                Page {currentPage} of {totalPages}{" "}
              </span>

              <button
                onClick={() => setCurrentPage((page) => page + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )
      )}
      {/* Creating a new todo */}
      {!startCreating && (
        <button onClick={startCreatingTodo}>Create a new todo</button>
      )}
      {startCreating && (
        <div>
          <h4>Create a new todo</h4>
          <CreateTodo
            handleCreateTodo={handleCreateTodo}
            text={text}
            setText={setText}
            dueDate={dueDate}
            setDueDate={setDueDate}
            error={error}
            isCreating={isCreating}
            today={today}
          />
          <button onClick={backToTodos}>Back to my Todos</button>
        </div>
      )}
    </div>
  );
}
