import { useState } from "react";

export default function Card({
  card,
  error,
  setError,
  setCards,
  isDeleting,
  setIsDeleting,
  isEditing,
  setIsEditing,
  onCardUpdated,
}) {
  const [question, setQuestion] = useState(card.question);
  const [answer, setAnswer] = useState(card.answer);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  const editCard = () => {
    setQuestion(card.question);
    setAnswer(card.answer);
    setError(null);
    setIsEditing(true);
  };
  const cancelEdit = () => {
    setQuestion(card.question);
    setAnswer(card.answer);
    setError(null);
    setIsEditing(false);
  };
  const saveCard = async () => {
    setError(null);

    try {
      const response = await fetch(`/g5Cards/${card.id}`, {
        method: "PUT",
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
        setError(data.error || "Failed to update card.");
        return;
      }

      onCardUpdated(data.card);

      setIsEditing(false);
    } catch (err) {
      setError("Something went wrong while updating the card.");
    }
  };
  const RevealTheAnswer = () => {
    setIsAnswerRevealed((currIsAnswerRevealed) => !currIsAnswerRevealed);
  };
  const handleYes = async (cardId) => {
    setError(null);
    try {
      const response = await fetch(`/g5Cards/${cardId}/next-box`, {
        method: "PUT",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to move the card.");
        return;
      }

      setCards((currentCards) =>
        currentCards.map((card) => (card.id === cardId ? data.card : card)),
      );
    } catch (err) {
      setError("Something went wrong while moving the card.");
    }
    setIsAnswerRevealed((currIsAnswerRevealed) => !currIsAnswerRevealed);
  };
  const handleNo = async (cardId) => {
    setError(null);
    try {
      const response = await fetch(`/g5Cards/${cardId}/reset-box`, {
        method: "PUT",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to reset the card.");
        return;
      }

      setCards((currentCards) =>
        currentCards.map((card) => (card.id === cardId ? data.card : card)),
      );
    } catch (err) {
      setError("Something went wrong while resetting the card.");
    }
    setIsAnswerRevealed((currIsAnswerRevealed) => !currIsAnswerRevealed);
  };
  return (
    <div>
      {error && <p>{error}</p>}
      {isEditing && (
        <>
          <div>
            <label htmlFor={`question-${card.id}`}>Question:</label>

            <input
              type="text"
              id={`question-${card.id}`}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor={`answer-${card.id}`}>Answer:</label>

            <input
              type="text"
              id={`answer-${card.id}`}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>

          <button onClick={saveCard}>Save</button>

          <button onClick={cancelEdit}>Cancel</button>
        </>
      )}
      <div>Question: {card.question}</div>
      {!isAnswerRevealed ? (
        <button onClick={RevealTheAnswer}>Reveal the answer</button>
      ) : (
        <div>
          <div>Answer: {card.answer}</div>
          <div>
            <div>Did you answer correctly?</div>
            <button onClick={() => handleYes(card.id)}>Yes</button>
            <button onClick={() => handleNo(card.id)}>No</button>
          </div>
        </div>
      )}
      <div>Box: {card.box_number}</div>
      <div>
        <button onClick={editCard}>Edit</button>
        <button>Delete</button>
      </div>
      -----------------------
    </div>
  );
}
