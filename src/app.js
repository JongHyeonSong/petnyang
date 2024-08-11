const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const multer = require('multer');
const fs = require('fs');
const fsext = require('fs-extra');  // To handle file copying and moving



// const upload = multer({ dest: 'uploads/' });

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.jpg') //Appending .jpg
  }
})

var upload = multer({ storage: storage });

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "static")));

app.get("/ping", (req, res) => {
  res.send("pong")
})


const exe = require("./ffmpeg")
app.all("/api", upload.single('file'), async (req, res) => {
  const file = req.file;

  if (file) {
    await new Promise((resolve, reject) => {
      console.log('File received:', file);

      // Specify the custom location where you want to save the file
      const customPath = path.join(__dirname, 'videos', 'backz.jpg');
  
      // Copy the file to the custom location
      fsext.copy(file.path, customPath)
          .then(() => {
              // res.json({
              //     message: 'File uploaded and copied successfully',
              //     originalFile: file.filename,
              //     customLocation: customPath
              // });

              resolve();
          })
          .catch(err => {
              console.error('Error copying file:', err);
              res.status(500).send('Error saving file to custom location');
          });
    });
  } else {
      res.status(400).send('No file uploaded');
      
  }
  // {
  //   fieldname: 'file',
  //   originalname: 'cat.jpg',
  //   encoding: '7bit',
  //   mimetype: 'text/plain',
  //   destination: 'src/uploads/',
  //   filename: '1723376412983.jpg',
  //   path: 'src\\uploads\\1723376412983.jpg',
  //   size: 488854
  // }


  console.log(file);
  const paramMap = JSON.parse(req.body.paramMap);

  console.log("----@@@----");
  console.log(paramMap);
  console.log(paramMap.q1);
  
  // paramMap: {"q1":"ab","q2":"wefwefwe"}

  await exe({
    q1 : {
      text : paramMap?.q1
      // text : paramMap?.q1 || "q11 안녕!!"
    }
    ,
    q2 : {
      text : paramMap?.q2 || "q22 안녕@@"
    }
  })
  const returnFile = fs.readFileSync('./src/output/ou1.mp4');
  // response file binary

  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Content-Disposition', 'attachment; filename=ou1.mp4');
  res.setHeader('Content-Length', returnFile.length);
  res.end(returnFile);

  // res.send("HIHI")
  


  // console.log(req.body);
})

app.listen(3000, () => {
  console.log("Server is running on port 3000");
})