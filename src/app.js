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
require("dotenv").config();

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

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    // "temperature": 1,
    // "top_p": 0.95,
    // "top_k": 64,
    // "max_output_tokens": 8192,
    response_mime_type: "application/json",
  },
});
const prompt = `
내가 농담 하나 할게. 플레이어1과 플레이어2가 있어. 플레이어1이 질문을 하고, 플레이어2가 대답을 해. 그런데 플레이어2의 대답이 너무 이상해서 플레이어1이 플레이어2를 벌주게 돼. 
예시를 보여줄게. 이제부터 플레이어1은 'p1', 플레이어2는 'p2'로 할게. 

p1_1: 내가 듣기로 너 요즘 컴퓨터 언어를 배우고 있다며, 맞아?
p2_1: 응, 맞아.
p1_2: 어떤 언어를 사용하고 있어?
p2_2: C...
p1_3: 오! C야, 아니면 C++야?
p2_3: ChatGPT.
p1_4: 정신 좀 차려.
p1_5: 공부좀 더하자.
p1_6: 친구야!!

이런 형식의 농담을 하나 만들어줘
p2_2 에서 p2_3 로 가면서 완전히 반전이 되는게 포인트야! 첫 글자가 같거나 비슷한걸로 가도록해줘
말 하는 순서는 위와 정확히 똑같아야하고 
위처럼 총 9줄이어야해 순서가 정확히 똑같아야해 
꼭 컴퓨터 관련아니라 완전히 랜덤으로 해줘
결과값은 {"p1_1": "say1", "p2_1" : "say2", "p1_2": "say3", ...} 이런식으로 해줘

거듭 이야기하지만 위랑 대화순서가 완전하게 일치해야해
`;
app.get("/genRandom", async (req, res) => {
  try {
    const result = await model.generateContent([prompt]);
    const textResult = result.response.text();
    console.log(textResult);
    const jsonResult = JSON.parse(textResult);
    console.log("🚀 ~ app.get ~ jsonResult:", jsonResult);
    res.json(jsonResult);
  } catch (error) {
    console.log(error);
    res.json({ error: error.message });
  }
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
