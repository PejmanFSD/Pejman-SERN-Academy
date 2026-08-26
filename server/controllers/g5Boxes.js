const G5Boxes = require("../models/g5Boxes");

// GET all boxes belonging to the logged-in user
module.exports.index = async (req, res) => {
    const userId = req.session.user_id; // Fetching the id of the user from the session
    const boxes = await G5Boxes.getBoxesByUserId(userId); // Fetching all the boxes of the user
    // (the "getBoxesByUserId" function has been already created in the model)
    res.json(boxes); // Sending the "boxes" variable to the front-end
};
// CREATE a new box
module.exports.create = async (req, res) => {
    const userId = req.session.user_id; // Fetching the id of the user from the session
    const box_name = req.body.box_name.trim(); // Fetching the name of the box from the <from /> that the user fills
    if (!box_name || !box_name.trim()) { // If the <input /> of the box name is empty or contains only " "
        // return an error with the "Box name is required." text and the 400 status
        return res.status(400).json({
            error: "Box name is required."
        });
    }
    try {
    // Creating the box by using the id of the user and the box name as the inputs of the "createBox" function
    // The "createBox" function has benn already created in the model
    const box = await G5Boxes.createBox(
        userId,
        box_name.trim()
    );
    res.status(201).json({box, message: "Box created successfully!"}); // Sending the created box to front-end with its message
    } catch(err) {
        // The boxes of each user should be unique
        if (err.number === 2627) { // The reserved error code for this error is 2627
            // Sending the error message with the status code of 409 to UI
            return res.status(409).json({
                error: "You already have a G5 box with this name."
            });
        }
        // If there's any other error, throw it:
        throw err;
    }
};
// UPDATE a box
module.exports.update = async (req, res) => {
    const userId = req.session.user_id; // Fetching the id of the user from the session
    const boxId = Number(req.params.id); // Fetching the id of the box from the router
    const { box_name } = req.body; // Fetching the new name of the box from the update <form /> that the user fills
    if (!box_name || !box_name.trim()) { // If the <input /> of the box name is empty or contains only " "
        // return an error with the "Box name is required." text and the 400 status
        return res.status(400).json({
            error: "Box name is required."
        });
    }
    // Updating the box by using the id of the user, the id of the box and the box name as the inputs of the "updateBox" function
    // The "updateBox" function has benn already created in the model
    const box = await G5Boxes.updateBox(
        boxId,
        userId,
        box_name.trim()
    );
    if (!box) { // If the id of the user or the id of the box doesn't exist
        // return an error with the "Box not found." text and the 404 status
        return res.status(404).json({
            error: "Box not found."
        });
    }
    res.json({box, message: "Box updated successfully!"}); // Sending the updated box to front-end with its message
};
// DELETE a box
module.exports.remove = async (req, res) => {
    const userId = req.session.user_id; // Fetching the id of the user from the session
    const boxId = Number(req.params.id); // Fetching the id of the box from the router
    // Deleting the box by using "the id of the user" and "the id of the box" as the inputs of the "deleteBox"
    // The "deleteBox" function has been already created in the model
    const box = await G5Boxes.deleteBox(boxId, userId);
    if (!box) { // If the id of the user or the id of the box doesn't exist
        // return an error with the "Box not found." text and the 404 status
        return res.status(404).json({
            error: "Box not found."
        });
    }
    // Sending the "Box deleted successfully." message to the front-end:
    res.json({
        message: "Box deleted successfully."
    });
};