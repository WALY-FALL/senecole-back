import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { ajouterDevoirs,getDevoirsParProfesseur,getDevoirsParClasse,supprimerDevoirs,} from "../controller/devoirsController.js";

import {verifyToken, protect,} from "../middlewares/authMiddleware.js";

import cloudinary from "../config/cloudinary.js";

const router = express.Router();


// =====================================================
// STOCKAGE LOCAL
// =====================================================

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});


// =====================================================
// STOCKAGE CLOUDINARY
// =====================================================

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,

  params: async (req, file) => {
    return {
      folder: "senecolevirtuelle/cours",

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
// CHOIX DU STOCKAGE
// =====================================================

const storage =
  process.env.NODE_ENV === "production"
    ? cloudinaryStorage
    : localStorage;


const upload = multer({
  storage,
});


// =====================================================
// AJOUTER UN DEVOIR
// =====================================================

router.post(
  "/",
  verifyToken,
  upload.array("fichiers", 10),
  ajouterDevoirs
);


// =====================================================
// RÉCUPÉRER LES DEVOIRS D'UN PROFESSEUR
// =====================================================

router.get(
  "/prof",
  verifyToken,
  getDevoirsParProfesseur
);


// =====================================================
// RÉCUPÉRER LES DEVOIRS D'UNE CLASSE
// =====================================================

router.get(
  "/classe/:classeId",
  verifyToken,
  getDevoirsParClasse
);


// =====================================================
// TEST
// =====================================================

router.get("/test", (req, res) => {
  res.send("Route devoirs OK");
});


// =====================================================
// SUPPRIMER UN DEVOIR
// =====================================================

router.delete(
  "/:id",
  protect,
  supprimerDevoirs
);


export default router;

