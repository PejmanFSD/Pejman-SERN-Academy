export default function CreateTodo({
    handleCreateTodo,
    text,
    setText,
    dueDate,
    setDueDate,
    error,
    isCreating
}) {
  return (
    <form onSubmit={handleCreateTodo}>
      <div>
        <label htmlFor="todo-text">Todo:</label>
        <input
          id="todo-text"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your todo"
        />
      </div>
      <div>
        <label htmlFor="due-date">Due date:</label>
        <input
          id="due-date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      {error && <p>{error}</p>}
      <button type="submit" disabled={isCreating}>
        {isCreating ? "Creating..." : "Add Todo"}
      </button>
    </form>
  );
}
