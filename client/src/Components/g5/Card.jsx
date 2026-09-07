import { useState } from "react";

export default function Card({
  id,
  question,
  answer,
  boxNumber,
  setError,
  setCards,
}) {
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

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
  };
  return (
    <div>
      <div>Question: {question}</div>
      {!isAnswerRevealed ? (
        <button onClick={RevealTheAnswer}>Reveal the answer</button>
      ) : (
        <div>
          <div>Answer: {answer}</div>
          <div>
            <div>Did you answer correctly?</div>
            <button onClick={() => handleYes(id)}>Yes</button>
            <button onClick={() => handleNo(id)}>No</button>
          </div>
        </div>
      )}
      <div>Box: {boxNumber}</div>
      -----------------------
    </div>
  );
}
