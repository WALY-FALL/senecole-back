import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import multer from "multer";

import profRoutes from "./routes/profRoutes.js";
import eleveRoutes from "./routes/eleveRoutes.js";
import classRoutes from "./routes/classroutes.js";
import coursRoutes from "./routes/coursRoutes.js";
import exercicesRoutes from "./routes/exercicesRoutes.js";
import devoirsRoutes from "./routes/devoirsRoutes.js";
import demandeRoutes from "./routes/demandeRoutes.js";

import liveCoursRoutes from "./routes/liveCoursRoutes.js";
import corsMiddleware from "./middleware/cors.js";

import connectDB from "./config/db.js";
import "./config/cloudinary.js";



const app = express();


// ============================
// MIDDLEWARES GENERAUX
// ============================

//CORS


app.use(corsMiddleware);
//app.options("*", cors(corsOptions));


app.use(express.json());

app.use(morgan("dev"));



// ============================
// SOCKET.IO
// ============================


const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://senecolevirtuelle.com",
      "https://www.senecolevirtuelle.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});


// rendre socket accessible aux controllers

app.use((req,res,next)=>{

  req.io = io;

  next();

});

// ============================
// UPLOADS
// ============================

const __dirname = path.resolve();

const uploadsDir = path.join(
  __dirname,
  "uploads"
);

if(!fs.existsSync(uploadsDir)){

  fs.mkdirSync(
    uploadsDir,
    {
      recursive:true
    }
  );

}

app.use("/uploads", express.static(uploadsDir));

// ============================
// MULTER
// ============================


const storage = multer.diskStorage({

 destination:(req,file,cb)=>{

   cb(
    null,
    uploadsDir
   );

 },


 filename:(req,file,cb)=>{

   cb(
    null,
    Date.now()+"-"+file.originalname
   );

 }

});


const upload = multer({
 storage
});




// ============================
// DATABASE
// ============================

connectDB();




// ============================
// ROUTES API
// ============================


app.use("/api/eleves",eleveRoutes);
app.use("/api/profs",profRoutes);
app.use( "/api/classes",classRoutes);
app.use("/api/cours",coursRoutes);
app.use("/api/exercices",exercicesRoutes);
app.use("/api/devoirs",devoirsRoutes);
app.use("/api/demandes",demandeRoutes);
app.use("/api/live-cours",liveCoursRoutes);





// ============================
// SOCKET EVENTS
// ============================


io.on("connection",(socket)=>{

console.log("🟢 Utilisateur connecté :", socket.id);

// rejoindre une classe

socket.on("join-room", (classeId)=>{
 console.log("📥 Join reçu :", classeId);
 socket.join(classeId);

 const room = io.sockets.adapter.rooms.get(classeId);
 const users =room ? Array.from(room) : [];

console.log("👥 Salle :", users);

 io.in(classeId).emit("users-in-room", users);

 socket.to(classeId).emit("user-joined", {socketId: socket.id}); 
});





// ============================
// WEBRTC OFFER
// ============================


socket.on(
"webrtc-offer",
(data)=>{


 console.log(
  "📤 OFFER vers",
  data.to
 );


 io.to(data.to)
 .emit(
 "webrtc-offer",
 {
  offer:data.offer,
  from:socket.id
 }
 );


});





// ============================
// WEBRTC ANSWER
// ============================


socket.on(
"webrtc-answer",
(data)=>{


 console.log(
  "📥 ANSWER vers",
  data.to
 );


 io.to(data.to)
 .emit(
 "webrtc-answer",
 {
  answer:data.answer,
  from:socket.id
 }
 );


});





// ============================
// ICE
// ============================


socket.on(
"webrtc-ice-candidate",
(data)=>{


 io.to(data.to)
 .emit(
 "webrtc-ice-candidate",
 {
  candidate:data.candidate,
  from:socket.id
 }
 );


});





socket.on(
"disconnect",
()=>{


 console.log(
 "🔴 Déconnexion :",
 socket.id
 );


});


});





// ============================
// START SERVER
// ============================

const PORT = process.env.PORT || 8989;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});









