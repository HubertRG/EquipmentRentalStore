/*
    Message model:
    - sender's fullname
    - e-mail
    - subject and content of the message
    - message's submition date
*/

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
