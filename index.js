const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
// medial order ----------

require("dotenv").config();
app.use(cors());
app.use(express.json());

// add mongodb ------------

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ha2hum3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// midelworer ------------ varyfai jwt token -- →
const varyFyJwt = async (req, res, next) => {
  try {
    const tokeninfo = req.headers.authorization;
    if (!tokeninfo) {
      res.status(401).send({ states: false, message: "unauthorize access" });
    }
    const token = tokeninfo.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        res.status(401).send({ states: false, message: "unauthorize access" });
      }
      req.decoded = decoded;
      next();
    });
  } catch (error) {
    console.log(error.name, error.message);
  }
};

// check project is canected ore not
const run = () => {
  try {
    client.connect();
    console.log("db connected");
  } catch (error) {
    console.log(error.name, error.message);
  }
};
run();
const cookingCollection = client.db("cooks").collection("product");

// check server and found varyfie user in decoded
app.get("/", (req, res) => {
  // console.log(req.decoded);
  res.send("cooking server is running");
});

// ?product gate limit3

app.get("/products", async (req, res) => {
  try {
    const query = {};
    const result = cookingCollection.find(query);
    const data = await result.toArray();
    if (data) {
      res.status(200).send({
        states: true,
        data,
      });
    } else {
      res.status(403).send({
        states: false,
        error: "authentication failed",
      });
    }
  } catch (error) {
    console.log(error.name, error.message);
    res.status(401).send("data load failed");
  }
});

// product post
app.post("/products", async (req, res) => {
  try {
    const Cookiedata = req.body;
    const result = await cookingCollection.insertOne(Cookiedata);
    if (result.acknowledged) {
      res.send({
        states: true,
        data: result,
      });
    } else {
      res.send({ states: false, error: "authentication failed" });
    }
  } catch (error) {
    console.log(error.name, error.message);
    res.send({ states: false, error: error.message });
  }
});

//create  jwt authtication token
app.post("/login", async (req, res) => {
  try {
    const email = req.body;
    console.log(email);
    const token = jwt.sign(email, process.env.JWT_SECRET_KEY, {
      expiresIn: "10h",
    });
    res.send({
      states: true,
      data: token,
    });
    // const result = await cookingCollection.insertOne(Cookiedata);
  } catch (error) {
    console.log(error.name, error.message);
    res.send({ states: false, error: error.message });
  }
});

// product apdeated
app.patch("/products/:id", async (req, res) => {
  try {
    const data = req.body;
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await cookingCollection.updateOne(query, { $set: data });
    console.log(result);
    if (result) {
      res.status(200).send({
        states: true,
        data: result,
      });
    } else {
      res.send({ states: false, error: "authentication failed" });
    }
  } catch (error) {
    console.log(error.name, error.message);
    res.send({ states: false, error: error.message });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = { _id: ObjectId(id) };
    const result = await cookingCollection.deleteOne(query);
    if (result) {
      res.status(200).send({
        states: true,
        data: result,
      });
    } else {
      res.send({ states: false, error: "authentication failed" });
    }
  } catch (error) {
    console.log(error.name, error.message);
    res.send({ states: false, error: error.message });
  }
});

app.listen(port, () => console.log(`port is running ${port}`));
