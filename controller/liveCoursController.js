// Démarrer un cours en direct au clic du prof
import LiveCours from "../models/LiveCours.js";
//import mongoose from "mongoose";


export const startLive = async (req,res)=>{
    console.log("🔥 ROUTE START HIT");
   
  try {

    const {
      classeId,
      titre,
      description
    } = req.body;


    // vérifier si un live existe déjà
    const ancienLive = await LiveCours.findOne({
      classeId,
      statut:"en_cours"
    });


    if(ancienLive){

      return res.json(ancienLive);

    }

    console.log("📥 Démarrage live");
console.log("profId reçu :", req.body.profId);
console.log("classeId reçu :", req.body.classeId);


    const live = await LiveCours.create({

        profId: req.prof._id,

      classeId,

      titre,

      description,

      statut:"en_cours"

    });
    console.log("PROF CONNECTE :", req.prof);


    // 🔥 informer les élèves de la classe
    req.io
      .to(classeId)
      .emit(
        "live-started",
        {
          liveId:live._id,
          classeId,
          titre
        }
      );


    res.status(201).json(live);


  } catch(error){

    res.status(500)
    .json({
      message:error.message
    });

  }

};
export const getLiveClasse = async (req, res) => {
    try {
  
      const { classeId } = req.params;
  
      console.log("🔎 classeId reçu par backend :", classeId);
  
      const live = await LiveCours.findOne({
        classeId,
        statut: "en_cours"
      });
  
      console.log("🎥 LIVE TROUVÉ PAR BACKEND :", live);
  
      if (!live) {
        return res.status(404).json({
          message: "Aucun live actif"
        });
      }
  
      res.json(live);
  
    } catch (error) {
  
      console.error("❌ Erreur getLiveClasse :", error);
  
      res.status(500).json({
        message: error.message
      });
    }
  };

//Arrêter un direct
export const stopLive = async (req, res) => {

  try {

    const { id } = req.params;

    const live = await LiveCours.findById(id);

    if (!live) {
      return res.status(404).json({
        message: "Live introuvable"
      });
    }

    // 🔐 Vérifier que le prof qui arrête est bien le propriétaire
    if (live.profId.toString() !== req.prof._id.toString()) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à arrêter ce live"
      });
    }

    live.statut = "termine";
    live.dateFin = new Date();

    await live.save();

    // 🔥 Informer les élèves
    req.io
      .to(live.classeId.toString())
      .emit("live-stopped", {
        liveId: live._id,
        classeId: live.classeId
      });

    console.log("🛑 LIVE TERMINÉ :", live._id);

    res.json({
      message: "Cours terminé",
      live
    });

  } catch (error) {

    console.error("❌ Erreur stopLive :", error);

    res.status(500).json({
      message: error.message
    });

  }
};
/*export const stopLive = async(req,res)=>{

    try{

        const {id}=req.params;


        const live = await LiveCours.findByIdAndUpdate(

            id,

            {
                statut:"termine",
                dateFin:new Date()
            },

            {
                new:true
            }

        );


        res.json({
            message:"Cours terminé",
            live
        });



    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};*/