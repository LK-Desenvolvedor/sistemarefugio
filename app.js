const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const uri = "mongodb+srv://ronildobotalhepinto_db_user:ctbDsND5QIrm1ceZ@cluster0.dswtp2k.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function connectDB() {
    await client.connect();
    console.log("Mongo conectado");
}

connectDB();

const db = client.db("cronicas_db");
const groups = db.collection("groups");

app.get("/groups", async (req, res) => {
    const data = await groups.find().toArray();
    res.json(data);
});

app.post("/groups", async (req, res) => {
    const result = await groups.insertOne(req.body);
    res.status(201).json(result);
});

app.get("/groups/:id", async (req, res) => {
    try {
        const id = new ObjectId(req.params.id);
        const group = await groups.findOne({ _id: id });
        if (!group) return res.status(404).json({ error: "Grupo não encontrado" });
        res.json(group);
    } catch (err) {
        res.status(400).json({ error: "ID inválido" });
    }
});

app.put("/groups/:id", async (req, res) => {
    try {
        const id = new ObjectId(req.params.id);
        // remove o _id do corpo para evitar conflito
        const { _id, ...updateData } = req.body;
        const result = await groups.replaceOne({ _id: id }, updateData);
        if (result.matchedCount === 0) return res.status(404).json({ error: "Grupo não encontrado" });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: "ID inválido ou erro no update" });
    }
});

app.delete("/groups/:id", async (req, res) => {
    try {
        const id = new ObjectId(req.params.id);
        const result = await groups.deleteOne({ _id: id });
        if (result.deletedCount === 0) return res.status(404).json({ error: "Grupo não encontrado" });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: "ID inválido" });
    }
});

app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});