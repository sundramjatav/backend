const express = require("express");
const { CreateInventory, FindInventory, ScanInventory, Deleteinventory, EditInventory, findInventoryById, updateInventoryById, FindAllInventory } = require("../controllers/taskController");
const upload = require("../multer");
const router = express.Router();
const {authenticatedUser} = require('../middlewares/authenticateUser')


// Create a new inventory item
router.post("/create-inventory",authenticatedUser, CreateInventory )
router.get("/find-inventory",authenticatedUser, FindInventory );
router.get("/findAll-inventory", FindAllInventory );
router.post("/scan-inventory", authenticatedUser, upload.single("qrImage"), ScanInventory);
router.delete('/delete/:id',authenticatedUser, Deleteinventory);
router.get('/find/:id',authenticatedUser,findInventoryById)
router.put('/update/:id',authenticatedUser,updateInventoryById)

module.exports = router;
