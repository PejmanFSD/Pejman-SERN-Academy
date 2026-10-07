export default function Todo({ todo }) {
  return (
    <tr>
      <td>{todo.text}</td>
      <td>{new Date(todo.created_date).toLocaleDateString()}</td>
      <td>
        {todo.due_date
          ? new Date(todo.due_date).toLocaleDateString()
          : "No due date"}
      </td>
      <td>{todo.status ? "Completed" : "Not completed"}</td>
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
