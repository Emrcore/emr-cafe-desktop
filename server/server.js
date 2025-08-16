const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

// ? MongoDB ba�lant�s�
mongoose.connect("mongodb://127.0.0.1:27017/emr-admin", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ? ROUTER'lar
const authRouter = require("./routes/auth");
const tableRouter = require("./routes/tables");
const reportRouter = require("./routes/reports");
const userRouter = require("./routes/users");
const settingsRouter = require("./routes/settings");
const productRouter = require("./routes/products");
const productUploadRouter = require("./routes/productsUpload");
const licenseRouter = require("./routes/license");
const salesRouter = require("./routes/sales");
const posRouter = require("./routes/pos");
const reportsAdvancedRouter = require("./routes/reportsAdvanced");
const ordersRouter = require("./routes/orders");
const invoiceRouter = require("./routes/invoices");
const callRoutes = require("./routes/calls");
const tableCategoriesRouter = require("./routes/tableCategories");

// ? MIDDLEWARE
const tenantMiddleware = require("./middleware/tenant");
const subscriptionCheck = require("./middleware/subscriptionCheck");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// ? Global Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  req.io = io;
  next();
});

const logAction = require("./utils/logAction");
app.get("/api/test-log", async (req, res) => {
  await logAction(
    { username: "test", role: "test" },
    "test log",
    { info: "Sunucu test logu ba�ar�yla kaydedildi." }
  );
  res.json({ message: "Log yaz�ld�" });
});

// ? LOGIN (sadece tenant kontrol�)
app.use("/api/login", tenantMiddleware, authRouter);

// ? A��k endpoint: QR men�den garson �a��rma
app.use("/api/calls", callRoutes);

// ? Korunan endpoint'ler (auth + abonelik)
app.use("/api", tenantMiddleware, subscriptionCheck);
app.use("/api/reports", reportRouter);
app.use("/api/products", productRouter);
app.use("/api/products", productUploadRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/users", userRouter);
app.use("/api/license", licenseRouter);
app.use("/api/tables", tableRouter);
app.use("/api/sales", salesRouter);
app.use("/api/pos", posRouter);
app.use("/api/table-categories", tableCategoriesRouter);
app.use("/api/reports-advanced", reportsAdvancedRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/orders", ordersRouter); // �zel olarak yukar�da middleware uyguland� zaten

// ? Statik klas�rler
app.use("/invoices", express.static(path.join(__dirname, "invoices")));
app.use("/uploads", express.static("/var/www/uploads"));

// ? React frontend
const clientBuildPath = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientBuildPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// ? Socket.IO ba�lant�s�
io.on("connection", (socket) => {
  console.log("? Yeni ba�lant�:", socket.id);
});

// ? Sunucu ba�lat
server.listen(3001, () => {
  console.log("?? Sunucu �al���yor: http://localhost:3001");
});
