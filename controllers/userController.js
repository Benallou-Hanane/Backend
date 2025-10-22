const User = require("../models/User");

exports.submitUser = async (req, res) => {
    console.log("Données reçues dans backend:", req.body);
    try {
        const user = new User(req.body);
        await user.save();
        res.json({ message: "Formulaire enregistré avec succès !" });
    } catch (err) {
        console.error("Erreur enregistrement User:", err);
        res.status(500).json({ message: "Erreur lors de l'enregistrement: " + err.message });
    }
};
