//Fonction pour créer une classe dans la base de donnee mongooose
import Classe from "../models/classmodel.js";
import DemandeAcces from "../models/demandeAccesmodel.js";


// Créer une classe liée au prof connecté
export const createClass = async (req, res) => {
  try {
    const { serie, niveau, description } = req.body;

     // ⚡ Préparer les données, n'ajouter `serie` que si elle est remplie
     const classData = {
      niveau,
      description,
      profId: req.prof._id,
    };

    if (serie && serie.trim() !== "") {
      classData.serie = serie.trim();
    }

    // ⚡ Associer la classe au prof connecté
    const newClass = await Classe.create(classData);

    res.status(201).json({ success: true, class: newClass });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Récupérer uniquement les classes du prof connecté
export const getMyClasses = async (req, res) => {
  try {
    const classes = await Classe.find({ profId: req.prof._id });
    res.status(200).json({ success: true, classes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Dans ton controller
export const getClasseById = async (req, res) => {
  try {
    const classe = await Classe.findById(req.params.id);
    if (!classe) {
      return res.status(404).json({ success: false, message: "Classe non trouvée" });
    }
    res.status(200).json({ success: true, classe });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};


// Modifier une classe
export const updateClass = async (req, res) => {
  try {
    const { id } = req.params; // ID de la classe à modifier
    const { serie, niveau, description } = req.body;

    // Vérifier que la classe existe et appartient au prof connecté
    const classe = await Classe.findOne({ _id: id, owner: req.user._id });
    if (!classe) {
      return res.status(404).json({ success: false, message: "Classe non trouvée ou pas autorisé" });
    }

    // Mettre à jour les champs
    classe.serie = serie || classe.serie;
    classe.niveau = niveau || classe.niveau;
    classe.description = description || classe.description;

    await classe.save();

    res.status(200).json({ success: true, classe });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Supprimer une classe
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que la classe existe et appartient au prof connecté
    const classe = await Classe.findOne({ _id: id, profId: req.prof._id });
    if (!classe) {
      return res.status(404).json({ success: false, message: "Classe non trouvée ou pas autorisé" });
    }

    await classe.deleteOne();

    res.status(200).json({ success: true, message: "Classe supprimée" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

export const getElevesByClasse = async (req, res) => {
  try {
    const { classeId } = req.params;

    const demandes = await DemandeAcces.find({
      classeId,
      statut: "accepte",
    }).populate(
      "eleveId",
      "prenom nom email"
    );

    const eleves = demandes
      .filter((demande) => demande.eleveId)
      .map((demande) => demande.eleveId);

    res.status(200).json({
      success: true,
      eleves,
    });

  } catch (error) {
    console.error(
      "Erreur récupération élèves classe :",
      error
    );

    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des élèves.",
      error: error.message,
    });
  }
};
