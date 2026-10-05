export default function Todo({todo}) {
  return (
    <div>
      <h4>{todo.text}</h4>
      <div>Created: {new Date(todo.created_date).toLocaleDateString()}</div>
      <div>
        Due:{" "}
        {todo.due_date
          ? new Date(todo.due_date).toLocaleDateString()
          : "No due date"}
      </div>
      <div>Status: {todo.status ? "Completed" : "Not completed"}</div>
    </div>
  );
}
