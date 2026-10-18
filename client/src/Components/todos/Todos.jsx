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
  const [isEditingATodo, setIsEditingATodo] = useState(false);
  const [isDeletingATodo, setIsDeletingATodo] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Pagination
  const [startCreating, setStartCreating] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("text");

  const todosPerPage = 5;
  const indexOfLastTodo = currentPage * todosPerPage;
  const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
  const filteredTodos = todos.filter((todo) =>
    todo.text.toLowerCase().includes(searchText.trim().toLowerCase()),
  );
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sortBy === "text") {
      return a.text.localeCompare(b.text, undefined, {
        sensitivity: "base",
      });
    }
    if (sortBy === "due_date") {
      // Todos without a due date appear last.
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      // YYYY-MM-DD dates can be compared as strings.
      return String(a.due_date)
        .slice(0, 10)
        .localeCompare(String(b.due_date).slice(0, 10));
    }
    if (sortBy === "status") {
      // Incomplete first, completed last.
      return Number(Boolean(a.status)) - Number(Boolean(b.status));
    }
    return 0;
  });
  const currentTodos = sortedTodos.slice(indexOfFirstTodo, indexOfLastTodo);
  const totalPages = Math.ceil(sortedTodos.length / todosPerPage);
  // const today = new Date().toISOString().split("T")[0];
  const formatDate = (date) => {
    if (!date) return "";
    if (typeof date === "string") {
      return date.slice(0, 10);
    }
    // Read the date using local calendar fields, not UTC.
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };
  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  const todayTodos = todos.filter((todo) => {
    const dueDate = formatDate(todo.due_date);
    const isDueToday = dueDate === today;
    const matchesSearch = todo.text
      .toLowerCase()
      .includes(searchText.trim().toLowerCase());
    return isDueToday && matchesSearch;
  });
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
      setStartCreating(false);
    }
  };
  const handleTodoCompleted = (updatedTodo) => {
    setTodos((previousTodos) =>
      previousTodos.map((todo) =>
        todo.id === updatedTodo.id ? updatedTodo : todo,
      ),
    );
  };
  const handleTodoUndo = (updatedTodo) => {
    setTodos((previousTodos) =>
      previousTodos.map((todo) =>
        todo.id === updatedTodo.id ? updatedTodo : todo,
      ),
    );
  };
  const handleTodoUpdated = (updatedTodo) => {
    setTodos((previousTodos) =>
      previousTodos.map((todo) =>
        todo.id === updatedTodo.id ? updatedTodo : todo,
      ),
    );
  };
  const handleTodoDeleted = (todoId) => {
    setTodos((previousTodos) =>
      previousTodos.filter((todo) => todo.id !== todoId),
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
            <input
              type="text"
              placeholder="Search todos..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              disabled={isEditingATodo || isDeletingATodo}
            />
            <label htmlFor="sortTodos">Sort todos by:</label>
            <select
              id="sortTodos"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              disabled={isEditingATodo || isDeletingATodo}
            >
              <option value="text">Text</option>
              <option value="due_date">Due Date</option>
              <option value="status">Status</option>
            </select>
            <table>
              <thead>
                {filteredTodos.length === 0 ? (
                  <tr>
                    <td colSpan="5">No todos found.</td>
                  </tr>
                ) : (
                  <tr>
                    <th>Todo</th>
                    <th>Created Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                )}
              </thead>

              <tbody>
                {currentTodos.map((todo) => (
                  <Todo
                    key={todo.id}
                    todo={todo}
                    onTodoCompleted={handleTodoCompleted}
                    onTodoUndo={handleTodoUndo}
                    onTodoUpdated={handleTodoUpdated}
                    error={error}
                    setError={setError}
                    isEditingATodo={isEditingATodo}
                    setIsEditingATodo={setIsEditingATodo}
                    onTodoDeleted={handleTodoDeleted}
                    isDeletingATodo={isDeletingATodo}
                    setIsDeletingATodo={setIsDeletingATodo}
                  />
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div>
                <button
                  onClick={() => setCurrentPage((page) => page - 1)}
                  disabled={
                    currentPage === 1 || isEditingATodo || isDeletingATodo
                  }
                >
                  Previous
                </button>

                <span>
                  {" "}
                  Page {currentPage} of {totalPages}{" "}
                </span>

                <button
                  onClick={() => setCurrentPage((page) => page + 1)}
                  disabled={
                    currentPage === totalPages ||
                    isEditingATodo ||
                    isDeletingATodo
                  }
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )
      )}
      {/* Creating a new todo */}
      {!startCreating && (
        <button
          onClick={startCreatingTodo}
          disabled={isEditingATodo || isDeletingATodo}
        >
          Create a new todo
        </button>
      )}
      <h3>Your today's todos</h3>
      {todayTodos.length === 0 ? <div>Today, You don't have anything to do!</div> :
      todayTodos.map((todo) =>
        <div>{todo.text} - {todo.status ? "✓" : "x"}</div>
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
