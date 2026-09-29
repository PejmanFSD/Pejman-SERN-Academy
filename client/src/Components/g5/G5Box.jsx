import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import CreateG5CardForm from "./CreateG5CardForm";
import Card from "./Card";

export default function G5Box({ error, setError, isEditing, setIsEditing }) {
  const { boxId } = useParams();
  const [box, setBox] = useState(null);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [cards, setCards] = useState([]);
  const [isBox0Shown, setIsBox0Shown] = useState(false);
  const [isBox1Shown, setIsBox1Shown] = useState(false);
  const [isBox2Shown, setIsBox2Shown] = useState(false);
  const [isBox3Shown, setIsBox3Shown] = useState(false);
  const [isBox4Shown, setIsBox4Shown] = useState(false);
  const [isBox5Shown, setIsBox5Shown] = useState(false);
  const [isBox6Shown, setIsBox6Shown] = useState(false);
  const [cardsNumInBox0, setCardsNumInBox0] = useState(0);
  const [cardsNumInBox1, setCardsNumInBox1] = useState(0);
  const [cardsNumInBox2, setCardsNumInBox2] = useState(0);
  const [cardsNumInBox3, setCardsNumInBox3] = useState(0);
  const [cardsNumInBox4, setCardsNumInBox4] = useState(0);
  const [cardsNumInBox5, setCardsNumInBox5] = useState(0);
  const [cardsNumInBox6, setCardsNumInBox6] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [isDeletingCard, setIsDeletingCard] = useState(false);
  const [isReturningToBox1FromRepository, setIsReturningToBox1FromRepository] =
    useState(false);
  const [isBoxShuffled, setIsBoxShuffled] = useState(false);
  const [isBoxStarted, setIsBoxStarted] = useState(false);
  const [activeBox, setActiveBox] = useState(-1);
  const hasInitializedActiveBox = useRef(false); // For evaluating the initial activeBox ONLY AND ONLY one time, on mount

  const handleBox0 = () => {
    setIsBoxStarted(false);
    setIsBoxShuffled(false);
    setIsBox0Shown(true);
    setIsBox1Shown(false);
    setIsBox2Shown(false);
    setIsBox3Shown(false);
    setIsBox4Shown(false);
    setIsBox5Shown(false);
    setIsBox6Shown(false);
  };
  const handleBox1 = () => {
    setIsBoxStarted(false);
    setIsBoxShuffled(false);
    setIsBox0Shown(false);
    setIsBox1Shown(true);
    setIsBox2Shown(false);
    setIsBox3Shown(false);
    setIsBox4Shown(false);
    setIsBox5Shown(false);
    setIsBox6Shown(false);
  };
  const handleBox2 = () => {
    setIsBoxStarted(false);
    setIsBoxShuffled(false);
    setIsBox0Shown(false);
    setIsBox1Shown(false);
    setIsBox2Shown(true);
    setIsBox3Shown(false);
    setIsBox4Shown(false);
    setIsBox5Shown(false);
    setIsBox6Shown(false);
  };
  const handleBox3 = () => {
    setIsBoxStarted(false);
    setIsBoxShuffled(false);
    setIsBox0Shown(false);
    setIsBox1Shown(false);
    setIsBox2Shown(false);
    setIsBox3Shown(true);
    setIsBox4Shown(false);
    setIsBox5Shown(false);
    setIsBox6Shown(false);
  };
  const handleBox4 = () => {
    setIsBoxStarted(false);
    setIsBoxShuffled(false);
    setIsBox0Shown(false);
    setIsBox1Shown(false);
    setIsBox2Shown(false);
    setIsBox3Shown(false);
    setIsBox4Shown(true);
    setIsBox5Shown(false);
    setIsBox6Shown(false);
  };
  const handleBox5 = () => {
    setIsBoxStarted(false);
    setIsBoxShuffled(false);
    setIsBox0Shown(false);
    setIsBox1Shown(false);
    setIsBox2Shown(false);
    setIsBox3Shown(false);
    setIsBox4Shown(false);
    setIsBox5Shown(true);
    setIsBox6Shown(false);
  };
  const handleBox6 = () => {
    setIsBoxStarted(true);
    setIsBoxShuffled(false);
    setIsBox0Shown(false);
    setIsBox1Shown(false);
    setIsBox2Shown(false);
    setIsBox3Shown(false);
    setIsBox4Shown(false);
    setIsBox5Shown(false);
    setIsBox6Shown(true);
    setIsBoxShuffled(true);
  };
  const ShuffleTheBox = () => {
    setCards((prevCards) => {
      const shuffledCards = [...prevCards];

      for (let i = shuffledCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffledCards[i], shuffledCards[j]] = [
          shuffledCards[j],
          shuffledCards[i],
        ];
      }

      return shuffledCards;
    });
    setIsBoxShuffled(true);
  };
  const handleStartBox = () => {
    setIsBoxStarted(true);
  };
  const startNewRound = () => {
    if (cardsNumInBox5 > 0) {
      setActiveBox(5);
    } else if (cardsNumInBox4 > 0) {
      setActiveBox(4);
    } else if (cardsNumInBox3 > 0) {
      setActiveBox(3);
    } else if (cardsNumInBox2 > 0) {
      setActiveBox(2);
    } else {
      setActiveBox(1);
    }
  }
  useEffect(() => {
    let box0 = 0;
    let box1 = 0;
    let box2 = 0;
    let box3 = 0;
    let box4 = 0;
    let box5 = 0;
    let box6 = 0;

    for (const card of cards) {
      if (card.box_number === 0) {
        box0++;
      } else if (card.box_number === 1) {
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
    setCardsNumInBox0(box0);
    setCardsNumInBox1(box1);
    setCardsNumInBox2(box2);
    setCardsNumInBox3(box3);
    setCardsNumInBox4(box4);
    setCardsNumInBox5(box5);
    setCardsNumInBox6(box6);
  }, [cards]);

  useEffect(() => {
    // Don't run the initialization again if the "hasInitializedActiveBox" variable is true
    // (when the on mount is done, at the end of this useEffect hook it becomes true)
    if (hasInitializedActiveBox.current) {
      return;
    }
    // Wait until the box counts have been calculated:
    if (
      cardsNumInBox0 === 0 &&
      cardsNumInBox1 === 0 &&
      cardsNumInBox2 === 0 &&
      cardsNumInBox3 === 0 &&
      cardsNumInBox4 === 0 &&
      cardsNumInBox5 === 0 &&
      cardsNumInBox6 === 0
    ) {
      return;
    }
    if (cardsNumInBox5 > 0) {
      setActiveBox(5);
    } else if (cardsNumInBox4 > 0) {
      setActiveBox(4);
    } else if (cardsNumInBox3 > 0) {
      setActiveBox(3);
    } else if (cardsNumInBox2 > 0) {
      setActiveBox(2);
    } else if (cardsNumInBox1 > 0) {
      setActiveBox(1);
    }
     else if (cardsNumInBox1 > 0) {
      setActiveBox(0);
    }
    // Mark initialization as complete, so from now on the value of "activeBox" depends on the situations
    hasInitializedActiveBox.current = true;
  }, [
    cardsNumInBox0,
    cardsNumInBox1,
    cardsNumInBox2,
    cardsNumInBox3,
    cardsNumInBox4,
    cardsNumInBox5,
    cardsNumInBox6,
  ]);

  useEffect(() => {
    if (activeBox === 5) {
      if (cardsNumInBox5 === 0 && cardsNumInBox4 > 0) {
        setActiveBox(4);
      } else if (cardsNumInBox5 === 0 && cardsNumInBox4 === 0 && cardsNumInBox3 > 0) {
        setActiveBox(3);
      } else if (cardsNumInBox5 === 0 && cardsNumInBox4 === 0 && cardsNumInBox3 === 0 && cardsNumInBox2 > 0) {
        setActiveBox(2);
      } else if (cardsNumInBox5 === 0 && cardsNumInBox4 === 0 && cardsNumInBox3 === 0 && cardsNumInBox2 === 0 && cardsNumInBox1 > 0) {
        setActiveBox(1);
      } else if (cardsNumInBox5 === 0 && cardsNumInBox4 === 0 && cardsNumInBox3 === 0 && cardsNumInBox2 === 0 && cardsNumInBox1 === 0 && cardsNumInBox0 > 0) {
        setActiveBox(0);
      } else if (cardsNumInBox5 === 0 && cardsNumInBox4 === 0 && cardsNumInBox3 === 0 && cardsNumInBox2 === 0 && cardsNumInBox1 === 0 && cardsNumInBox0 === 0) {
        setActiveBox(-1);
      }
    }

    else if (activeBox === 4) {
      if (cardsNumInBox4 === 0 && cardsNumInBox3 > 0) {
        setActiveBox(3);
      } else if (cardsNumInBox4 === 0 && cardsNumInBox3 === 0 && cardsNumInBox2 > 0) {
        setActiveBox(2);
      } else if (cardsNumInBox4 === 0 && cardsNumInBox3 === 0 && cardsNumInBox2 === 0 && cardsNumInBox1 > 0) {
        setActiveBox(1);
      } else if (cardsNumInBox4 === 0 && cardsNumInBox3 === 0 && cardsNumInBox2 === 0 && cardsNumInBox1 === 0 && cardsNumInBox0 > 0) {
        setActiveBox(0);
      } else if (cardsNumInBox4 === 0 && cardsNumInBox3 === 0 && cardsNumInBox2 === 0 && cardsNumInBox1 === 0 && cardsNumInBox0 === 0) {
        setActiveBox(-1);
      }
    }
    
    else if (activeBox === 3) {
      if (cardsNumInBox3 === 0 && cardsNumInBox2 > 0) {
        setActiveBox(2);
      } else if (cardsNumInBox3 === 0 && cardsNumInBox2 === 0 && cardsNumInBox1 > 0) {
        setActiveBox(1);
      } else if (cardsNumInBox3 === 0 && cardsNumInBox2 === 0 && cardsNumInBox1 === 0 && cardsNumInBox0 > 0) {
        setActiveBox(0);
      } else if (cardsNumInBox3 === 0 && cardsNumInBox2 === 0 && cardsNumInBox1 === 0 && cardsNumInBox0 === 0) {
        setActiveBox(-1);
      }
    }
    
    else if (activeBox === 2) {
      if (cardsNumInBox2 === 0 && cardsNumInBox1 > 0) {
        setActiveBox(1);
      } else if (cardsNumInBox2 === 0 && cardsNumInBox1 === 0 && cardsNumInBox0 > 0) {
        setActiveBox(0);
      } else if (cardsNumInBox2 === 0 && cardsNumInBox1 === 0 && cardsNumInBox0 === 0) {
        setActiveBox(-1);
      }
    }

    else if (activeBox === 1) {
      if (cardsNumInBox1 === 0 && cardsNumInBox0 > 0) {
        setActiveBox(0);
      } else if (cardsNumInBox1 === 0 && cardsNumInBox0 === 0) {
        setActiveBox(-1);
      }
    }

    else if (activeBox === 0) {
      if (cardsNumInBox1 === 0) {
        setActiveBox(-1);
      }
    }
  }, [
    cardsNumInBox0,
    cardsNumInBox1,
    cardsNumInBox2,
    cardsNumInBox3,
    cardsNumInBox4,
    cardsNumInBox5,
    cardsNumInBox6,
  ]);

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
      <div>Active Box: {activeBox}</div>
      <div>------------------------------------------------------</div>
      <div>The number of cards in Starting Area: {cardsNumInBox0}</div>
      <div>The number of cards in Box 1: {cardsNumInBox1}</div>
      <div>The number of cards in Box 2: {cardsNumInBox2}</div>
      <div>The number of cards in Box 3: {cardsNumInBox3}</div>
      <div>The number of cards in Box 4: {cardsNumInBox4}</div>
      <div>The number of cards in Box 5: {cardsNumInBox5}</div>
      <div>The number of cards in the repository: {cardsNumInBox6}</div>
      <h1>{box.box_name}</h1>
      {!isCreatingCard &&
        !isReturningToBox1FromRepository &&
        !isCreatingCard &&
        !isEditingCard &&
        !isDeletingCard &&
        !isAnswerRevealed && (
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
      {!isCreatingCard &&
        !isDeletingCard &&
        !isEditingCard &&
        !isAnswerRevealed && (
          <div>
            <button onClick={handleBox0} disabled={activeBox !== 0}>
              Starting Area
            </button>
            <button onClick={handleBox1} disabled={activeBox !== 1}>
              box 1
            </button>
            <button onClick={handleBox2} disabled={activeBox !== 2}>
              box 2
            </button>
            <button onClick={handleBox3} disabled={activeBox !== 3}>
              box 3
            </button>
            <button onClick={handleBox4} disabled={activeBox !== 4}>
              box 4
            </button>
            <button onClick={handleBox5} disabled={activeBox !== 5}>
              box 5
            </button>
            <button onClick={handleBox6}>the repository</button>
          </div>
        )}
      {!isBoxShuffled &&
        !isCreatingCard &&
        !isDeletingCard &&
        !isEditingCard &&
        !isAnswerRevealed &&
        (isBox1Shown ||
          isBox2Shown ||
          isBox3Shown ||
          isBox4Shown ||
          isBox5Shown) && (
          <button onClick={ShuffleTheBox}>
            {isBox1Shown
              ? "Shuffle Box 1"
              : isBox2Shown
                ? "Shuffle Box 2"
                : isBox3Shown
                  ? "Shuffle Box 3"
                  : isBox4Shown
                    ? "Shuffle Box 4"
                    : isBox5Shown && "Shuffle Box 5"}
          </button>
        )}
      {isBoxShuffled &&
        !isBoxStarted &&
        !isCreatingCard &&
        !isDeletingCard &&
        !isEditingCard &&
        !isAnswerRevealed &&
        (isBox1Shown ||
          isBox2Shown ||
          isBox3Shown ||
          isBox4Shown ||
          isBox5Shown) &&
        (
          <div>
            <div>
              {isBox1Shown
                ? "Box 1 is shuffled"
                : isBox2Shown
                  ? "Box 2 is shuffled"
                  : isBox3Shown
                    ? "Box 3 is shuffled"
                    : isBox4Shown
                      ? "Box 4 is shuffled"
                      : isBox5Shown && "Box 5 is shuffled"}
            </div>
            <button onClick={handleStartBox}>
              {isBox1Shown
                ? "Start Box 1"
                : isBox2Shown
                  ? "Start Box 2"
                  : isBox3Shown
                    ? "Start Box 3"
                    : isBox4Shown
                      ? "Start Box 4"
                      : isBox5Shown && "Start Box 5"}
            </button>
          </div>
        )}
      {cards.length === 0 && !isCreatingCard && isBoxStarted ? (
        <p>This box has no cards yet.</p>
      ) : (
        !isCreatingCard &&
        isBoxStarted && (
          <div>
            {cards.map(
              (card) =>
                ((isBox0Shown && card.box_number === 0) ||
                  (isBox1Shown && card.box_number === 1) ||
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
                    isAnswerRevealed={isAnswerRevealed}
                    setIsAnswerRevealed={setIsAnswerRevealed}
                    isDeletingCard={isDeletingCard}
                    setIsDeletingCard={setIsDeletingCard}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    isEditingCard={isEditingCard}
                    setIsEditingCard={setIsEditingCard}
                    isReturningToBox1FromRepository={
                      isReturningToBox1FromRepository
                    }
                    setIsReturningToBox1FromRepository={
                      setIsReturningToBox1FromRepository
                    }
                  />
                ),
            )}
          </div>
        )
      )}
      {cards.length === 0 && !isCreatingCard && !isBoxStarted && !isBoxShuffled && activeBox === 0 ? (
        <p>This box has no cards yet.</p>
      ) : (
        cards.length > 0 && !isCreatingCard && !isBoxStarted && !isBoxShuffled && activeBox === 0 && cardsNumInBox0 === 0 &&
        (cardsNumInBox1 !== 0 || cardsNumInBox2 !== 0 || cardsNumInBox3 !== 0 || cardsNumInBox4 !== 0 || cardsNumInBox5 !== 0)
      ) ? (
        <div>
          <div>The current round of answering the cards is finished</div>
          <button onClick={startNewRound}>Start the new round</button>
        </div>
      ) : (
        cards.length > 0 && !isCreatingCard && !isBoxStarted && !isBoxShuffled && activeBox === 0 && cardsNumInBox0 === 0 &&
        cardsNumInBox1 === 0 && cardsNumInBox2 === 0 && cardsNumInBox3 === 0 && cardsNumInBox4 === 0 && cardsNumInBox5 === 0
      ) ? (
        <div>There's no cards in the boxes, either return the cards from the repository to the starting area or add new cards!</div>
      ) : (cards.length > 0 && !isCreatingCard && !isBoxStarted && !isBoxShuffled && activeBox === 0 &&
          <div>
            {cards.map(
              (card) =>
                (isBox0Shown && card.box_number === 0) && (
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
                    isAnswerRevealed={isAnswerRevealed}
                    setIsAnswerRevealed={setIsAnswerRevealed}
                    isDeletingCard={isDeletingCard}
                    setIsDeletingCard={setIsDeletingCard}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    isEditingCard={isEditingCard}
                    setIsEditingCard={setIsEditingCard}
                    isReturningToBox1FromRepository={
                      isReturningToBox1FromRepository
                    }
                    setIsReturningToBox1FromRepository={
                      setIsReturningToBox1FromRepository
                    }
                  />
                ),
            )}
          </div>
      )}
    </div>
  );
}
