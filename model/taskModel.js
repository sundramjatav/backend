const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  receivedDate: { type: Date, required: true },
  dispatchDate: { type: Date, default: null },
  status: { type: String, required: true, default: "Pending" },
  receivedQuantity: { type: Number, required: true },
  dispatchQuantity: { type: Number, default: 0 },
  pendingItems: { type: Number },
  qrIdentifier: { type: String, unique: true, required: true },
  qrCode: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
}, { timestamps: true });

const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;
