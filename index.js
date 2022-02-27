import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import bodyParser from 'body-parser';
import userRoutes from "./routes/user.js";
import locationRoutes from "./routes/location.js";
import groupRoutes from "./routes/group.js";
import clientRoutes from "./routes/client.js";
import billRunRoutes from "./routes/billrun.js";
import billRunCanRoutes from "./routes/billruncandidate.js";

const app = express();

// app.use(cors({ origin: '*',  methods: ["GET","POST"]}));
app.use(cors());
app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))

app.use('/users', userRoutes);
app.use('/location', locationRoutes);
app.use('/group', groupRoutes);
app.use('/client', clientRoutes);
app.use('/billrun', billRunRoutes);
app.use('/billruncandidate', billRunCanRoutes);

const server = http.createServer(app);

const CONNECTION_URL = 'mongodb+srv://kamonrara:kamonrara@cluster0.2vltm.mongodb.net/igreyconnect?retryWrites=true&w=majority';
const PORT = process.env.PORT || 4444;

//cloud 
// mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => app.listen(PORT,'0.0.0.0', () => console.log(`Server Running on Port: http://localhost:${PORT}`)))
//   .catch((error) => console.log(`${error} did not connect`));
// mongoose.set('useFindAndModify', false);

//local
mongoose.connect('mongodb://localhost/igrey', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => server.listen(PORT,() => console.log(`Server Running on Port: http://localhost:${PORT}`)))
  .catch((error) => console.log(`${error} did not connect`));
mongoose.set('useFindAndModify', false);