import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CreateG5CardForm from "./CreateG5CardForm";
import Card from "./Card";

export default function G5Box({
  error,
  setError,
  isEditing,
  setIsEditing,
}) {
  const { boxId } = useParams();
  const [box, setBox] = useState(null);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const fetchBox = async () => {
      const response = await fetch(`/g5Boxes/${boxId}`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data.error);
        return;
      }

      setBox(data);
    };

    fetchBox();
  }, [boxId]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch(`/g5Cards/${boxId}/cards`, {
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to load cards.");
          return;
        }

        setCards(data);
      } catch (err) {
        setError("Something went wrong while loading the cards.");
      }
    };

    fetchCards();
  }, [boxId]);

  if (!box) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {!isCreatingCard && <h1>{box.box_name}</h1>}
      {!isCreatingCard && (
        <button onClick={() => setIsCreatingCard(true)}>Add Card</button>
      )}
      {isCreatingCard && (
        <CreateG5CardForm
          boxId={boxId}
          setError={setError}
          onCardCreated={(newCard) => {
            setCards((currentCards) => [...currentCards, newCard]);
          }}
          setIsCreatingCard={setIsCreatingCard}
        />
      )}
      {cards.length === 0 && !isCreatingCard ? (
        <p>This box has no cards yet.</p>
      ) : (
        !isCreatingCard && (
          <div>
            {cards.map((card) => (
              <Card
                key={card.id}
                card={card}
                onCardUpdated={(updatedCard) => {
                  setCards((currentCards) =>
                    currentCards.map((currentCard) =>
                      currentCard.id === updatedCard.id
                        ? updatedCard
                        : currentCard,
                    ),
                  );
                }}
                onCardDeleted={(deletedCardId) => {
                  setCards((currentCards) =>
                    currentCards.filter(
                      (currentCard) => currentCard.id !== deletedCardId,
                    ),
                  );
                }}
                error={error}
                setError={setError}
                setCards={setCards}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
