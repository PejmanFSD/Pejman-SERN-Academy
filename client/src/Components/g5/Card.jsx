export default function Card({question, answer, boxNumber}) {
    return (
        <div>
            <div>Question: {question}</div>
            <div>Answer: {answer}</div>
            <div>Box: {boxNumber}</div>
        </div>
    )
}