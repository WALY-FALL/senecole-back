// backend/controller/demandeController.js
import DemandeAcces from "../models/DemandeAccesmodel.js";
//import Eleve from "../models/elevemodel.js";
//import Classe from "../models/classemodel.js";

// 📌 1) Créer une demande d'accès
export const creerDemande = async (req, res) => {
  try {
    const { eleveId, profId, classeId } = req.body;

    if (!eleveId || !profId || !classeId) {
      return res.status(400).json({ message: "Champs manquants." });
    }

    // 🔍 Vérifier si la demande existe déjà
    // 🔍 Vérifier si l'élève a déjà une demande pour ce professeur
const deja = await DemandeAcces.findOne({
  eleveId,
  profId
});

if (deja) {
  return res.status(400).json({
    message: "Cet élève a déjà choisi une classe pour ce professeur."
  });
}
    /*const deja = await DemandeAcces.findOne({ eleveId, profId, classeId });

    if (deja) {
      return res
        .status(400)
        .json({ message: "Demande déjà envoyée pour cette classe." });
    }*/

    const demande = await DemandeAcces.create({
      eleveId,
      profId,
      classeId,
    });

    res.status(201).json(demande);
  } catch (error) {
    console.error("Erreur création demande :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// 📌 2) Récupérer les demandes d’un prof
export const getDemandesByProf = async (req, res) => {
  try {
    const { profId } = req.params;

    if (!profId) {
      return res.status(400).json({ message: "profId manquant." });
    }

    const demandes = await DemandeAcces.find({ profId })
      .populate("eleveId", "nom prenom email")
      .populate("classeId", "nom description");

    res.status(200).json(demandes);
  } catch (error) {
    console.error("Erreur récupération demandes :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// 📌 3) Accepter une demande
export const accepterDemande = async (req, res) => {
  try {
    const { demandeId } = req.params;

    const demande = await DemandeAcces.findById(demandeId);

    if (!demande) {
      return res.status(404).json({ message: "Demande introuvable." });
    }

    demande.statut = "accepte";
    await demande.save();

    res.json({ message: "Demande acceptée.", demande });
  } catch (error) {
    console.error("Erreur acceptation :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// 📌 4) Refuser une demande
export const refuserDemande = async (req, res) => {
  try {
    const { demandeId } = req.params;

    const demande = await DemandeAcces.findById(demandeId);

    if (!demande) {
      return res.status(404).json({ message: "Demande introuvable." });
    }

    demande.statut = "refuse";
    await demande.save();

    res.json({ message: "Demande refusée.", demande });
  } catch (error) {
    console.error("Erreur refus :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// controller/demandeController.js
export const getDemandesByEleve = async (req, res) => {
  try {
    const { eleveId } = req.params;
    if (!eleveId) return res.status(400).json({ message: "eleveId manquant" });

    const demandes = await DemandeAcces.find({ eleveId })
      .populate("profId", "nom prenom")
      .populate("classeId", "nom niveau");

    res.status(200).json(demandes);
  } catch (err) {
    console.error("Erreur récupération demandes élève :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

