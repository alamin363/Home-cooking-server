const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
// medial order ----------

require("dotenv").config();
app.use(cors());
app.use(express.json());

// add mongodb ------------

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
const reviewCollection = client.db("cooks").collection("review");
const blogCollection = client.db("cooks").collection("blog");

// check server and found varyfie user in decoded
app.get("/", (req, res) => {
  // console.log(req.decoded);
  res.send("cooking server is running now");
});

// ?product gate limit3

app.get("/products", async (req, res) => {
  try {
    const query = {};
    const result = cookingCollection.find(query);
    const results = cookingCollection.find(query);
    const data = await result.limit(3).toArray();
    const allData = await results.toArray();
    if (data) {
      res.send({
        states: true,
        data,
        allData,
      });
    } else {
      res.status(403).send({
        states: false,
        error: "authentication failed",
      });
    }
  } catch (error) {
    res.status(401).send({
      states: false,
      error: error.message,
    });
  }
});
app.get("/blog", async (req, res) => {
  try {
    const query = {};
    const result = blogCollection.find(query);
    const data = await result.toArray();
    if (data) {
      res.send({
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
    res.status(401).send({
      states: false,
      error: error.message,
    });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = { _id: ObjectId(id) };
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
    res.status(403).send({
      states: false,
      error: error.message,
    });
  }
});

// product post --------
app.post("/products", async (req, res) => {
  try {
    const product = req.body;
    const result = await cookingCollection.insertOne(product);
    if (result.acknowledged) {
      res.send({
        states: true,
        data: result,
      });
    } else {
      res.send({ states: false, error: "product add filed" });
    }
  } catch (error) {
    res.send({ states: false, error: error.message });
  }
});
// post review
app.post("/review", async (req, res) => {
  try {
    const review = req.body;
    if (review.name) {
      const result = await reviewCollection.insertOne(review);
      if (result.acknowledged) {
        res.send({
          states: true,
          data: result,
        });
      } else {
        res.send({ states: false, error: "authentication failed" });
      }
    }
  } catch (error) {
    res.send({ states: false, error: error.message });
  }
});

// get review -------- with email
app.get("/review", async (req, res) => {
  try {
    // const email = req.query.email
    const query = {};
    let quary = {};
    if (req.query.email) {
      quary = {
        currentUser: req.query.email,
      };
    }
    const results = reviewCollection.find(query);
    const result = reviewCollection.find(quary);
    const resultWiteUser = await result.toArray();
    const data = await results.toArray();
    if (data && resultWiteUser[0]._id) {
      res.send({
        states: true,
        data,
        resultWiteUser,
      });
    } else {
      res.status(403).send({
        states: false,
        error: "authentication failed",
      });
    }
  } catch (error) {
    res.status(401).send("data load failed");
  }
});

// found review with dedicakor vew
app.get("/review/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    const query = { product_id: req.params.id };
    const results = reviewCollection.find(query);
    const data = await results.toArray();
    if (data) {
      res.send({
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
    res.status(401).send("data load failed");
  }
});

app.delete("/review/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = { _id: ObjectId(id) };
    const result = await reviewCollection.deleteOne(query);
    if (result) {
      res.status(200).send({
        states: true,
        data: result,
      });
    } else {
      res.send({ states: false, error: "authentication failed" });
    }
  } catch (error) {
    res.send({ states: false, error: error.message });
  }
});

// app.put("/review/:id", async (req, res) => {
//   try {
//     const id = req.params.id;
//      console.log(req.body)
//     const query = { _id: ObjectId(id)};
//     const result = await reviewCollection.updateOne(query, { $set: req.body });
//     console.log(result)
//     if (result) {
//       res.status(200).send({
//         states: true,
//         data: result,
//       });
//     } else {
//       res.send({ states: false, error: "authentication failed" });
//     }
//   } catch (error) {
//     res.send({ states: false, error: error.message });
//   }
// })

app.put("/review/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const quire = { _id: ObjectId(id) };
    const updatedData = req.body;
    const option = { upsert: true };
    const Reviews = {
      $set: {
        name: updatedData.name,
        nameOfItem: updatedData.nameOfItem,
        message: updatedData.message,
        rating: updatedData.rating,
        img_url: updatedData.img_url,
        product_id: updatedData.product_id,
        picture: updatedData.picture,
      },
    };
    const result = await reviewCollection.updateOne(quire, Reviews, option);
    res.send(result);
  } catch (error) {
    res.status(401).send({
      states: false,
      error: error.message,
    });
  }
});

// review section end

//create  jwt authtication token
app.post("/login", async (req, res) => {
  try {
    const email = req.body;
    const token = jwt.sign(email, process.env.JWT_SECRET_KEY, {
      expiresIn: "10h",
    });
    res.send({
      states: true,
      data: token,
    });
    // const result = await cookingCollection.insertOne(Cookiedata);
  } catch (error) {
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
    if (result) {
      res.status(200).send({
        states: true,
        data: result,
      });
    } else {
      res.send({ states: false, error: "authentication failed" });
    }
  } catch (error) {
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
    res.send({ states: false, error: error.message });
  }
});

app.listen(port, () => console.log(`port is running ${port}`));
