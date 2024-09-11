const https = require("https");

const express = require("express");
const session = require("express-session");
const app = express();
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const fsext = require("fs-extra"); // To handle file copying and moving
const { v4: uuidv4 } = require("uuid");
const { genVideo } = require("./ffmpeg");

app.set("trust proxy", 1); // trust first proxy
app.use(
  cors({
    // origin: [
    //   "http://127.0.0.1:5500",
    //   "https://9615-211-118-132-210.ngrok-free.app",
    // ],
    origin: true,
    // methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);
app.use(
  session({
    secret: "@codestates",
    resave: false,
    saveUninitialized: true,

    proxy: true,
    cookie: {
      // domain: "localhost",
      // path: "/",
      // maxAge: 24 * 6 * 60 * 10000,
      sameSite: "none",
      httpOnly: !true,
      secure: true,
    },
  })
  // session({
  //   secret: "@codestates",
  //   resave: false,
  //   saveUninitialized: true,
  //   cookie: {
  //     // domain: "localhost",
  //     // path: "/",
  //     // maxAge: 24 * 6 * 60 * 10000,
  //     // sameSite: "none",
  //     httpOnly: !true,
  //     secure: !true,
  //   },
  // })
);

// const upload = multer({ dest: 'uploads/' });

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads/");
  },
  filename: function (req, file, cb) {
    let mimeType;

    switch (file.mimetype) {
      case "image/jpeg":
        mimeType = "jpg";
        break;
      case "image/png":
        mimeType = "png";
        break;
      case "image/gif":
        mimeType = "gif";
        break;
      case "image/bmp":
        mimeType = "bmp";
        break;
      default:
        mimeType = "jpg";
        break;
    }

    const outputFileName = `${Date.now()}-${uuidv4()}`;

    cb(null, outputFileName + "." + mimeType); //Appending .jpg
  },
});

var upload = multer({ storage: storage });

app.use(express.json());
// app.use(cors());

app.use(express.static(path.join(__dirname, "static")));

app.get("/ping", (req, res) => {
  console.log(req.session);
  console.log(req.session.id);
  console.log(req.sessionId);

  res.send({
    pong: true,
    session: req.session,
  });
});
app.get("/setv/:value", (req, res) => {
  console.log("🚀 ~ app.get ~ req.session:", req.session.id);

  value = req.params.value;
  console.log("🚀 ~ app.get ~ value:", value);
  req.session.userId = value;
  console.log("🚀 ~ app.get ~ req.session:", req.session);

  arr = req.session.arr || [];
  arr.push(value);

  req.session.arr = arr;

  res.send({
    pong: true,
    session: req.session,
  });
});

app.all("/api", upload.single("file"), async (req, res) => {
  // await new Promise((res) => setTimeout(res, 100));
  // return res.json({ a: 1 });

  const file = req.file;
  const paramMap = JSON.parse(req.body.paramMap);
  const sceneArr = paramMap.sceneArr;
  // console.log("🚀 ~ app.all ~ sceneArr:", sceneArr);

  if (!file) {
    res.status(400).send("No file uploaded");
    return;
  }

  const backImgPath = path.join(req.file.path);
  const fileNm = await genVideo(sceneArr, backImgPath);

  res.json({
    fileNm: fileNm,
  });

  // const returnFile = fs.readFileSync(outputFilePath);
  // res.setHeader("Content-Type", "video/mp4");
  // res.setHeader("Content-Disposition", "attachment; filename=ou1.mp4");
  // res.setHeader("Content-Length", returnFile.length);
  // res.end(returnFile);
});

app.get("/video/:fileNm", (req, res) => {
  const fileNm = req.params.fileNm;
  const filePath = path.join(__dirname, "output", fileNm);
  res.sendFile(filePath);
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// const server = https
//   .createServer(
//     {
//       key: fs.readFileSync("./key.pem"),
//       cert: fs.readFileSync("./cert.pem"),
//     },
//     app
//   )
//   .listen(3333, () => {
//     console.log("Server is running on port 3000");
//   });
