const Inventory = require("../model/taskModel");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");


const CreateInventory = async (req, res) => {
  const { name, date, quantity,  } = req.body;

  try {
    const qrIdentifier = uuidv4();
    const qrCodeData = await QRCode.toDataURL(qrIdentifier);
    const newItem = new Inventory({
      name,
      receivedDate:date,
      receivedQuantity:quantity,
      pendingItems:quantity,
      qrIdentifier,
      qrCode: qrCodeData,
      userId: req.user._id,
    });
    const savedItem = await newItem.save();
    res.status(201).json({
      success: true,
      message: "Created successfully",
      savedItem,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const FindInventory = async (req, res) => {
  try {
    const allInventory = await Inventory.find({ userId: req.user._id });
    res.status(200).json({ message: "Find Inventory", allInventory });
   
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const FindAllInventory = async (req, res) => {
  try {
    const allInventory = await Inventory.find(); 
    res.status(200).json({ message: "All Inventories", allInventory });
    console.log(allInventory);
    
  } catch (error) {
    console.error("Error fetching all inventories:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const jsQR = require("jsqr");
const Jimp = require("jimp");
const fs = require("fs");

const ScanInventory = async (req, res) => {
  try {
    const filePath = req.file.path;
    const image = await Jimp.read(filePath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    const imageData = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        const rgba = Jimp.intToRGBA(image.getPixelColor(x, y));
        imageData[idx] = rgba.r; // Red
        imageData[idx + 1] = rgba.g; // Green
        imageData[idx + 2] = rgba.b; // Blue
        imageData[idx + 3] = rgba.a; // Alpha
      }
    }
    const code = jsQR(imageData, width, height);
    console.log(code.data,"--------code")

    if (code) {
      const inventory = await Inventory.findOne({ qrIdentifier: code.data });
      if (inventory) {
        if (inventory.pendingItems > 0) {
          inventory.status = "Received";
          inventory.dispatchQuantity += 1;
          inventory.dispatchDate = new Date();
          inventory.pendingItems -= 1;

          await inventory.save();
          res.json({ qrCodeData: code.data });
        } else {
          res.status(400).json({ message: "All items have been dispatched, no pending items left." });
        }
      } else {
        res.status(404).json({ message: "QR code not found or invalid." });
      }
    } else {
      res.status(400).json({ message: "QR code not found or invalid." });
    }

  } catch (error) {
    console.error("Error scanning QR code:", error);
    res.status(500).json({ message: "Error scanning QR code." });
  }
};



const Deleteinventory =  async (req, res) => {
  try {
    const { id } = req.params;
    await Inventory.findByIdAndDelete(id);
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item' });
  }
};


const findInventoryById = async (req, res) => {
  try {
      const inventoryItem = await Inventory.findById(req.params.id);
      if (!inventoryItem) {
          return res.status(404).json({ message: 'Inventory item not found' });
      }
      res.json({ inventory: inventoryItem });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};

const updateInventoryById = async (req, res) => {
  try {
      const updatedItem = await Inventory.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true, runValidators: true }
      );
      if (!updatedItem) {
          return res.status(404).json({ message: 'Inventory item not found' });
      }
      res.json({ inventory: updatedItem });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = { CreateInventory, updateInventoryById,FindAllInventory, FindInventory, ScanInventory,Deleteinventory,findInventoryById };
