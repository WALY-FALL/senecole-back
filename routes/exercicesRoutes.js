import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import {
  ajouterExercices,
  getExercicesParProfesseur,
  getExercicesParClasse,
  supprimerExercices
} from "../controller/exercicesController.js";

import {
  verifyToken,
  protect
} from "../middlewares/authMiddleware.js";

import cloudinary from "../config/cloudinary.js";

const router = express.Router();


// =====================================================
// STOCKAGE CLOUDINARY
// =====================================================

const cloudinaryStorage = new CloudinaryStorage({

  cloudinary: cloudinary,

  params: async (req, file) => {

    return {
      folder: "senecolevirtuelle/exercices",

      resource_type: "auto",

      public_id:
        Date.now() +
        "-" +
        file.originalname
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9-_]/g, "_"),
    };

  },

});


// =====================================================
// MULTER
// =====================================================

const upload = multer({
  storage: cloudinaryStorage
});


// =====================================================
// ROUTES
// =====================================================

// Ajouter un exercice
router.post(
  "/",
  verifyToken,
  upload.array("fichiers", 10),
  ajouterExercices
);


// Récupérer les exercices d'un professeur
router.get(
  "/prof",
  verifyToken,
  getExercicesParProfesseur
);


// Récupérer les exercices d'une classe
router.get(
  "/classe/:classeId",
  verifyToken,
  getExercicesParClasse
);


// Route test
router.get("/test", (req, res) => {
  res.send("Route exercice OK");
});


// Supprimer un exercice
router.delete(
  "/:id",
  protect,
  supprimerExercices
);


export default router;