import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CreateG5CardForm from "./CreateG5CardForm";
import Card from "./Card";

export default function G5Box({ error, setError, isEditing, setIsEditing }) {
  const { boxId } = useParams();
  const [box, setBox] = useState(null);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [cards, setCards] = useState([]);
  const [isBox1Shown, setIsBox1Shown] = useState(false);
  const [isBox2Shown, setIsBox2Shown] = useState(false);
  const [isBox3Shown, setIsBox3Shown] = useState(false);
  const [isBox4Shown, setIsBox4Shown] = useState(false);
  const [isBox5Shown, setIsBox5Shown] = useState(false);
  const [isBox6Shown, setIsBox6Shown] = useState(false);
  const [cardsNumInBox1, setCardsNumInBox1] = useState(0);
  const [cardsNumInBox2, setCardsNumInBox2] = useState(0);
  const [cardsNumInBox3, setCardsNumInBox3] = useState(0);
  const [cardsNumInBox4, setCardsNumInBox4] = useState(0);
  const [cardsNumInBox5, setCardsNumInBox5] = useState(0);
  const [cardsNumInBox6, setCardsNumInBox6] = useState(0);

  const handleBox1 = () => {
    setIsBox1Shown(true);
    setIsBox2Shown(false);
    setIsBox3Shown(false);
    setIsBox4Shown(false);
    setIsBox5Shown(false);
    setIsBox6Shown(false);
  };
  const handleBox2 = () => {
    setIsBox1Shown(false);
    setIsBox2Shown(true);
    setIsBox3Shown(false);
    setIsBox4Shown(false);
    setIsBox5Shown(false);
    setIsBox6Shown(false);
  };
  const handleBox3 = () => {
    setIsBox1Shown(false);
    setIsBox2Shown(false);
    setIsBox3Shown(true);
    setIsBox4Shown(false);
    setIsBox5Shown(false);
    setIsBox6Shown(false);
  };
  const handleBox4 = () => {
    setIsBox1Shown(false);
    setIsBox2Shown(false);
    setIsBox3Shown(false);
    setIsBox4Shown(true);
    setIsBox5Shown(false);
    setIsBox6Shown(false);
  };
  const handleBox5 = () => {
    setIsBox1Shown(false);
    setIsBox2Shown(false);
    setIsBox3Shown(false);
    setIsBox4Shown(false);
    setIsBox5Shown(true);
    setIsBox6Shown(false);
  };
  const handleBox6 = () => {
    setIsBox1Shown(false);
    setIsBox2Shown(false);
    setIsBox3Shown(false);
    setIsBox4Shown(false);
    setIsBox5Shown(false);
    setIsBox6Shown(true);
  };
useEffect(() => {
    let box1 = 0;
    let box2 = 0;
    let box3 = 0;
    let box4 = 0;
    let box5 = 0;
    let box6 = 0;

    for (const card of cards) {
        if (card.box_number === 1) {
            box1++;
        } else if (card.box_number === 2) {
            box2++;
        } else if (card.box_number === 3) {
            box3++;
        } else if (card.box_number === 4) {
            box4++;
        } else if (card.box_number === 5) {
            box5++;
        } else if (card.box_number === 6) {
            box6++;
        }
    }

    setCardsNumInBox1(box1);
    setCardsNumInBox2(box2);
    setCardsNumInBox3(box3);
    setCardsNumInBox4(box4);
    setCardsNumInBox5(box5);
    setCardsNumInBox6(box6);
}, [cards]);
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
      <div>cardsNumInBox1: {cardsNumInBox1}</div>
      <div>cardsNumInBox2: {cardsNumInBox2}</div>
      <div>cardsNumInBox3: {cardsNumInBox3}</div>
      <div>cardsNumInBox4: {cardsNumInBox4}</div>
      <div>cardsNumInBox5: {cardsNumInBox5}</div>
      <div>cardsNumInBox6: {cardsNumInBox6}</div>
      {!isCreatingCard && <h1>{box.box_name}</h1>}
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
      <button onClick={handleBox1}>box 1</button>
      <button onClick={handleBox2}>box 2</button>
      <button onClick={handleBox3}>box 3</button>
      <button onClick={handleBox4}>box 4</button>
      <button onClick={handleBox5}>box 5</button>
      <button onClick={handleBox6}>the repository</button>
      {cards.length === 0 && !isCreatingCard ? (
        <p>This box has no cards yet.</p>
      ) : (
        !isCreatingCard && (
          <div>
            {cards.map(
              (card) =>
                ((isBox1Shown && card.box_number === 1) ||
                  (isBox2Shown && card.box_number === 2) ||
                  (isBox3Shown && card.box_number === 3) ||
                  (isBox4Shown && card.box_number === 4) ||
                  (isBox5Shown && card.box_number === 5) ||
                  (isBox6Shown && card.box_number === 6)) && (
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
                ),
            )}
          </div>
        )
      )}
      {!isCreatingCard && (
        <button onClick={() => setIsCreatingCard(true)}>Add Card</button>
      )}
    </div>
  );
}
