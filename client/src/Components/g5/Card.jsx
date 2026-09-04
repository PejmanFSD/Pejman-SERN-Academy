import { useState } from "react";

export default function Card({question, answer, boxNumber}) {
    const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

    const RevealTheAnswer = () => {
        setIsAnswerRevealed(currIsAnswerRevealed => !currIsAnswerRevealed);
    }
    return (
        <div>
            <div>Question: {question}</div>
            {!isAnswerRevealed ?
                <button onClick={RevealTheAnswer}>Reveal the answer</button> :
                <div>Answer: {answer}</div>
            }
            <div>Box: {boxNumber}</div>
            -----------------------
        </div>
    )
}