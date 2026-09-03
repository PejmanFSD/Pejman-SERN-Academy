import { useState } from "react";

export default function CreateG5CardForm({
  boxId,
  setError,
  onCardCreated,
  setIsCreatingCard,
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);

    try {
      const response = await fetch(`/g5Cards/${boxId}/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          question,
          answer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Creating the card failed.");
        return;
      }

      onCardCreated(data.card);

      setQuestion("");
      setAnswer("");
      setIsCreatingCard(false);
    } catch (err) {
      setError("Something went wrong while creating the card.");
    }
  };

  const cancelSubmit = () => {
    setQuestion("");
    setAnswer("");
    setError(null);
    setIsCreatingCard(false);
  };

  return (
    <div>
      <h2>Create a new card</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="question">Question:</label>

          <input
            type="text"
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="answer">Answer:</label>

          <input
            type="text"
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
          />
        </div>

        <button type="submit">Create Card</button>

        <button type="button" onClick={cancelSubmit}>
          Cancel
        </button>
      </form>
    </div>
  );
}
