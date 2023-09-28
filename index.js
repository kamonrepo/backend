import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import bodyParser from 'body-parser';
import userRoutes from "./routes/user.js";
import groupRoutes from "./routes/group.js";
import clientRoutes from "./routes/client.js";
import billRunRoutes from "./routes/billrun.js";
import billRunCanRoutes from "./routes/billruncandidate.js";
import categoryRoutes from "././routes/services/category.js";
import planRoutes from "././routes/services/plan.js";
import reportRoutes from "././routes/report/index.js";
import paymentRoutes from "././routes/payment.js";
import postRoutes from "././routes/posts.js";
import soaRoutes from "././routes/soa.js";

const app = express();

app.use(cors());
app.use(cors({ origin: '*',  methods: ["GET","POST"]}));
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

app.use('/users', userRoutes);
app.use('/group', groupRoutes);
app.use('/client', clientRoutes);
app.use('/billrun', billRunRoutes);
app.use('/billruncandidate', billRunCanRoutes);
app.use('/category', categoryRoutes);
app.use('/plan', planRoutes);
app.use('/report', reportRoutes);
app.use('/payment', paymentRoutes);
app.use('/posts', postRoutes);
app.use(express.static('public'));
app.use('/images', express.static('images'));
app.use('/soa', soaRoutes);

const server = http.createServer(app);

const PORT = process.env.PORT || 4444;

mongoose.connect('mongodb://127.0.0.1/igrey', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => server.listen(PORT,() => console.log(`Server Running on Port: http://localhost:${PORT}`)))
  .catch((error) => console.log(`${error} did not connect`));
mongoose.set('useFindAndModify', false);