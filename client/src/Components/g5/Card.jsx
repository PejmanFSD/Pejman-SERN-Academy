import { useState } from "react";

export default function Card({
  card,
  error,
  setError,
  setCards,
  onCardUpdated,
  onCardDeleted
}) {
  const [question, setQuestion] = useState(card.question);
  const [answer, setAnswer] = useState(card.answer);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isDeletingCard, setIsDeletingCard] = useState(false);
  const [isEditingCard, setIsEditingCard] = useState(false);

  const editCard = () => {
    setQuestion(card.question);
    setAnswer(card.answer);
    setError(null);
    setIsEditingCard(true);
  };
  const cancelEdit = () => {
    setQuestion(card.question);
    setAnswer(card.answer);
    setError(null);
    setIsEditingCard(false);
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

      setIsEditingCard(false);
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
  const ReturnToBox1 = async () => {
    try {
        const response = await fetch(
            `/g5Cards/${card.id}/reset-box`,
            {
                method: "PUT",
                credentials: "include",
            }
        );

        const data = await response.json();

        if (!response.ok) {
            setError(
                data.error || "Failed to return the card to Box 1."
            );
            return;
        }

        onCardUpdated(data.card);

    } catch (err) {
        setError(
            "Something went wrong while returning the card to Box 1."
        );
    }
};
  const deleteCard = () => {
    setIsDeletingCard(true);
  }
  const deleteCardNo = () => {
    setIsDeletingCard(false);
  }
  const deleteCardYes = async () => {
    setIsDeletingCard(true);
    setError(null);
    try {
      const response = await fetch(`/g5Cards/${card.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to delete the card.");
        return;
      }
      onCardDeleted(card.id);
    } catch (err) {
      setError("Something went wrong while deleting the card.");
    } finally {
      setIsDeletingCard(false);
    }
  };
  return (
    <div>
      {error && <p>{error}</p>}
      {isDeletingCard &&
      <div>
        <div>Are you sure you want to delete this card?</div>
        <button onClick={deleteCardYes}>Yes</button>
        <button onClick={deleteCardNo}>No</button>
      </div>
      }
      {isEditingCard && (
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
      {!isDeletingCard && !isEditingCard && <div>Question: {card.question}</div>}
      {!isAnswerRevealed && !isDeletingCard && !isEditingCard && card.box_number !== 6 ? (
        <button onClick={RevealTheAnswer}>Reveal the answer</button>
      ) : (!isDeletingCard && !isEditingCard && card.box_number !== 6 ?
        <div>
          <div>Answer: {card.answer}</div>
          <div>
            <div>Did you answer correctly?</div>
            <button onClick={() => handleYes(card.id)}>Yes</button>
            <button onClick={() => handleNo(card.id)}>No</button>
          </div>
        </div>
        :
        <div>Answer: {card.answer}</div>
      )}
      {!isAnswerRevealed && !isDeletingCard && !isEditingCard && card.box_number !== 6 && <div>Box: {card.box_number}</div>}
      {!isAnswerRevealed && !isDeletingCard && !isEditingCard && (
        <div>
          <button onClick={editCard}>Edit</button>
          <button onClick={deleteCard} disabled={isDeletingCard}>{isDeletingCard ? "Deleting..." : "Delete"}</button>
        </div>
      )}
      {card.box_number === 6 &&
      <div><button onClick={ReturnToBox1}>Return to Box 1</button></div>
      }
      -----------------------
    </div>
  );
}
