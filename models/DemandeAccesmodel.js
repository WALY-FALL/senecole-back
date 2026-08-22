// backend/models/demandeAccesModel.js
import mongoose from "mongoose";

const demandeAccesSchema = new mongoose.Schema({
  eleveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Eleve",
    required: true,
  },
  profId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prof",
    required: true,
  },
  classeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classe",
    required: true,
  },
  statut: {
    type: String,
    enum: ["en_attente", "accepte", "refuse"],
    default: "en_attente",
  },
  dateDemande: {
    type: Date,
    default: Date.now,
  },
});

demandeAccesSchema.index(
  { eleveId: 1, profId: 1 },
  { unique: true }
);

const DemandeAcces = mongoose.model("DemandeAcces", demandeAccesSchema);
export default DemandeAcces;
