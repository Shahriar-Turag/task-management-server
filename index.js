const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tl8lipp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

async function run() {
    try {
        await client.connect();
        const todoCollection = client.db("taskManagement").collection("todos");

        app.get("/todos", async (req, res) => {
            const cursor = todoCollection.find({});
            const todos = await cursor.toArray();
            res.json(todos);
        });

        app.post("/todos", async (req, res) => {
            const todo = req.body;
            await todoCollection.insertOne(todo);
            res.json(todo);
        });

        app.delete("/todos/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await todoCollection.deleteOne(query);
            res.json(result);
        });

        app.put("/todos/:id", async (req, res) => {
            const id = req.params.id;
            const todo = req.body;
            const query = { _id: ObjectId(id) };
            const result = await todoCollection.replaceOne(query, todo);
            res.json(result);
        });

        app.put("/todos/status/:id", async (req, res) => {
            const id = req.params.id;

            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedStatus = { $set: { status: "Completed" } };
            const result = await todoCollection.updateOne(
                query,
                updatedStatus,
                options
            );
            res.json(result);
        });
        // app.get("/todos/:status", async (req, res) => {
        //     const status = req.params.status;
        //     const cursor = todoCollection.find({ status: "completed" });
        //     const todos = await cursor.toArray();
        //     res.json(todos);
        //     console.log(todos);
        // });
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("task management server is running");
});

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
