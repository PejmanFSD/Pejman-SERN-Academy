import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CreateG5CardForm from "./CreateG5CardForm";
import Card from "./Card";

export default function G5Box({setError}) {
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
      <button onClick={() => setIsCreatingCard(true)}>Add Card</button>
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
      {cards.length === 0 ? (
    <p>This box has no cards yet.</p>
) : (
    <div>
        {cards.map((card) => (
            <div key={card.id}>
                <Card
                  question={card.question}
                  answer={card.answer}
                  boxNumber={card.box_number}
                />
            </div>
        ))}
    </div>
)}
    </div>
  );
}
