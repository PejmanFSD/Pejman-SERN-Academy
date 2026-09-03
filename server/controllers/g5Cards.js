const G5Cards = require("../models/g5Cards");

// GET all cards belonging to a specific box
module.exports.index = async (req, res) => {
    const userId = req.session.user_id; // Fetching the id of the user from the session
    const boxId = Number(req.params.boxId); // Fetching the id of the box from the router
    // Fetching all the cards of the specific box and assigning all of them as a variable called "cards"
    // (the "getCardsByBoxId" function has been already created in the model)
    const cards = await G5Cards.getCardsByBoxId(boxId, userId);
    // Sending the "cards" variable to front-end:
    res.json(cards);
};
// CREATE a new card
module.exports.create = async (req, res) => {
    const userId = req.session.user_id; // Fetching the id of the user from the session
    const boxId = Number(req.params.boxId); // Fetching the id of the box from the router
    // Assigning the <input /> values (that have been filled by the user) of the create <form />
    // to "question", "answer", "box_number" variables:
    const {question, answer} = req.body;
    if (!question || !question.trim()) { // If the <input /> of the question is empty or contains only " "
        // return an error with the "Question is required." text and the 400 status
        return res.status(400).json({
            error: "Question is required."
        });
    }
    if (!answer || !answer.trim()) { // If the <input /> of the answer is empty or contains only " "
        // return an error with the "Answer is required." text and the 400 status
        return res.status(400).json({
            error: "Answer is required."
        });
    }
    // Every newly created card starts in Box 1
    const boxNumber = 1;
    // Create the new card by using the <input /> values (that have been filled by the user) of the create <form />
    // The "createCard" function has been already created in the model
    const card = await G5Cards.createCard(boxId, userId, question.trim(), answer.trim(), boxNumber);
    // If the new created card is not fetched properly:
    if (!card) {
        // Return an error with the "Box not found." text and the 404 status code:
        return res.status(404).json({
            error: "Box not found."
        });
    }
    // Sending the new created card to the front-end with the message
    res.status(201).json({card, message: "Card created successfully!"});
};
// UPDATE a card
module.exports.update = async (req, res) => {
    const userId = req.session.user_id; // Fetching the id of the user from the session
    const cardId = Number(req.params.id); // Fetching the id of the card from the router
    // Assigning the <input /> values (that have been filled by the user) of the update <form />
    // to "question", "answer", "box_number" variables:
    const {question, answer, box_number} = req.body;
    if (!question || !question.trim()) { // If the <input /> of the question is empty or contains only " "
        // return an error with the "Question is required." text and the 400 status
        return res.status(400).json({
            error: "Question is required."
        });
    }
    if (!answer || !answer.trim()) { // If the <input /> of the answer is empty or contains only " "
        // return an error with the "Answer is required." text and the 400 status
        return res.status(400).json({
            error: "Answer is required."
        });
    }
    if (
        box_number === undefined || // If the "box_number" doesn't exist OR
        box_number === null || // If the "box_number" hasn't been fetched OR
        !Number.isInteger(Number(box_number)) || // If the "box_number" is not an integer OR
        Number(box_number) < 1 || // If the "box_number" is less than 1 OR
        Number(box_number) > 5 // If the "box_number" is greater than 5
        // (Based on the model, the box numbers are from 1 to 5)
    ) {
        // Return an error with the "Box number must be between 1 and 5." text
        return res.status(400).json({
            error: "Box number must be between 1 and 5."
        });
    }
    // Create the new updated card by using the <input /> values (that have been filled by the user) of the create <form />
    // The "updateCard" function has been already created in the model
    const card = await G5Cards.updateCard(cardId, userId, question.trim(), answer.trim(), Number(box_number));
    // If the new updated card is not fetched properly:
    if (!card) {
        // Return an error with the "Card not found." text and the 404 status code:
        return res.status(404).json({
            error: "Card not found."
        });
    }
    // Sending the new updated card to the front-end with the message
    res.json({card, message: "Card updated successfully!"});
};
// DELETE a card
module.exports.remove = async (req, res) => {
    const userId = req.session.user_id; // Fetching the id of the user from the session
    const cardId = Number(req.params.id); // Fetching the id of the card from the router
    // Deleting the card by using "the id of the user" and "the id of the card" as the inputs of the "deleteCard"
    // The "deleteCard" function has been already created in the model
    const card = await G5Cards.deleteCard(cardId, userId);
    if (!card) { // If the id of the user or the id of the card doesn't exist
        // return an error with the "Card not found." text and the 404 status
        return res.status(404).json({
            error: "Card not found."
        });
    }
    // Sending the "Card deleted successfully." message to the front-end:
    res.json({
        message: "Card deleted successfully."
    });
};