import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import {
  ajouterCours,
  getCoursParProfesseur,
  getCoursParClasse,
  supprimerCours,
} from "../controller/coursController.js";

import {
  verifyToken,
  protect,
} from "../middlewares/authMiddleware.js";

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
// AJOUTER UN COURS
// =====================================================

router.post(
  "/",
  verifyToken,
  upload.array("fichiers", 10),
  ajouterCours
);


// =====================================================
// RÉCUPÉRER LES COURS D'UN PROFESSEUR
// =====================================================

router.get(
  "/prof",
  verifyToken,
  getCoursParProfesseur
);


// =====================================================
// RÉCUPÉRER LES COURS D'UNE CLASSE
// =====================================================

router.get(
  "/classe/:classeId",
  verifyToken,
  getCoursParClasse
);


// =====================================================
// TEST
// =====================================================

router.get("/test", (req, res) => {
  res.send("Route cours OK");
});


// =====================================================
// SUPPRIMER UN COURS
// =====================================================

router.delete(
  "/:id",
  protect,
  supprimerCours
);


export default router;

/*import express from "express";
import multer from "multer";
import { ajouterCours, getCoursParProfesseur, getCoursParClasse, supprimerCours } from "../controller/coursController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";


const router = express.Router();


// Storage local
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// Route upload cours

//router.post("/", upload.array("fichiers", 5), ajouterCours);


// Routes

// Ajouter un cours avec fichiers
// Ajouter un cours (sécurisé)
router.post("/", verifyToken, upload.array("fichiers", 10), ajouterCours);

// Récupérer tous les cours d'un professeur
router.get("/prof", verifyToken ,getCoursParProfesseur);

// Récupérer tous les cours d'une classe
router.get("/classe/:classeId", verifyToken, getCoursParClasse);

router.get("/test", (req, res) => {
  res.send("Route cours OK");
});

// Supprimer un cours (sécurisé)
router.delete("/:id", protect, supprimerCours);

export default router;*/
