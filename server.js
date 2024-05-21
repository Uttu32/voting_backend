const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDb = require("./db.js");
dotenv.config();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
const port = process.env.PORT || 4000;

const userRoutes = require('./routes/userRoute.js');
const candidateRoutes = require('./routes/candidateRoute.js');

app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);


connectDb().then(() => {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});
