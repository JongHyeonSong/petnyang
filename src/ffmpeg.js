const { spawn } = require("child_process");
const path = require("path");

function executeFFmpeg(args) {
  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn("ffmpeg", args);

    ffmpegProcess.stdout.on("data", (data) => {
      console.log(`FFmpeg stdout: ${data}`);
    });

    ffmpegProcess.stderr.on("data", (data) => {
      console.error(`FFmpeg stderr: ${data}`);
    });

    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        console.log("FFmpeg process completed successfully");
        resolve();
      } else {
        console.error(`FFmpeg process exited with code ${code}`);
        reject(new Error(`FFmpeg process exited with code ${code}`));
      }
    });

    ffmpegProcess.on("error", (error) => {
      console.error(`FFmpeg process error: ${error.message}`);
      reject(error);
    });
  });
}

const GREEN_VIDEO = path.join(__dirname, "videos/cat-concat.mp4");
const BACK_IMG = path.join(__dirname, "videos/back2.jpg");
const OUTPUT_VIDEO = path.join(__dirname, "output/ou1.mp4");
const FONT_PATH = "C:/Windows/Fontfs/HMKMRHD.TTF"; // Font path


// const DEFAULT_OPTION = ""

const DEFAULT_OPTION = `fontsize=48:fontcolor=white:fontfile='${FONT_PATH}':box=1:boxcolor=black@0.5:boxborderw=5`

/**
 * 옵션 - 순서가 바뀌면 안되는경우가 있음 기준모르겠음 enable이 일단뒤로감
 * text fontfile DEFAULT(fontsize fontcolor fontfile box boxcolor boxborderw) enable
 */


const Q1Opt = {
  comments : ["어제 애니봤어?", "몇시에 잤어?", "오쪼라고"],
  startPos : {x:10, y:700},
  timeSlice:{start:0.1, end:2}
}
const A1Opt = {
  comments : ["11시..."],
  startPos : {x:"(w-text_w-10)", y:700},
  timeSlice:{start:2.5, end:3.5}
}
const Q2Opt = {
  comments : ["일찍 잤는데", "왜 계속 졸아?"],
  startPos : {x:10, y:700},
  timeSlice:{start:4, end:8}
}
const A2Opt = {
  comments : ["오..."],
  startPos : {x:"(w-text_w-10)", y:700},
  timeSlice:{start:8, end:11}
}
const A22Opt = {
  comments : ["오전..."],
  startPos : {x:"(w-text_w-10)", y:700},
  timeSlice:{start:11, end:11.5}
}

const P1Opt = {
  comments : ["줘팸1..."],
  startPos : {x:"10", y:1000},
  timeSlice:{start:12.5, end:20}
}
const P2Opt = {
  comments : ["줘팸2..."],
  startPos : {x:"10", y:1100},
  timeSlice:{start:13, end:20}
}
const P3Opt = {
  comments : ["줘팸3..."],
  startPos : {x:"10", y:1200},
  timeSlice:{start:13.5, end:20}
}

const LINE_GAP = 70;

function maker(opt){
  returnArr = []
  const {comments, startPos, timeSlice} = opt
  for (const [idx, commnet] of comments.entries()) {
    const mnts = `drawtext=text='${commnet}':x=${startPos.x}:y=${startPos.y+idx*LINE_GAP}:${DEFAULT_OPTION}:enable='between(t,${timeSlice.start},${timeSlice.end})'`
    returnArr.push(mnts)
  }
  return returnArr;
}

const TEXT_ARR = [
  // `drawtext=text='@@Custom Font':fontfile='C:/Windows/Fonts/HMKMRHD.TTF':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2`,
  // `drawtext=text='!한글!조아!':fontfile='${FONT_PATH}':fontcolor=white:fontsize=24:x=(w-text_w)/3:y=(h-text_h)/2,drawtext=text='Custom Font':fontfile='C:/Windows/Fonts/HMKMRHD.TTF':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2,drawtext=text='!!한글!조아!':fontfile='${FONT_PATH}':fontcolor=white:fontsize=24:x=(w-text_w)/5:y=(h-text_h)/2`,
  // `drawtext=text='!한글!조아!':x=10:y=700:${DEFAULT_OPTION}:enable='between(t,2.5,3.5)'`,
  ...maker(Q1Opt),
  ...maker(A1Opt),
  ...maker(Q2Opt),
  ...maker(A2Opt),
  ...maker(A22Opt),
  ...maker(P1Opt),
  ...maker(P2Opt),
  ...maker(P3Opt),
];
const FILTER_OPTIONS = [
  "[1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920:(iw-1080)/2:(ih-1920)/2[bg1080]", // 이미지를 늘린다음 1080으로 비율맞춤
  "[0:v]colorkey=0x00FE00:0.4:0.05[nuggi]", // 기존영상의 녹색 누끼제거
  "[bg1080][nuggi]overlay=(W-w)/2:(H-h)/2[bg_concat]", // 이미지배경과 누끼제거영상을 합성
  `[bg_concat]${TEXT_ARR.join(",")}`, // 합성한 영상에 텍스트를 추가
];
// wer(FILTER_OPTIONS)

const args = [
  "-i", GREEN_VIDEO,
  "-i", BACK_IMG,
  "-ss", "0", "-t", "20",
  "-filter_complex", FILTER_OPTIONS.join(";"),
  OUTPUT_VIDEO,
  "-y", // Overwrite the output file if it exists
];

function wer(log) {
  console.log(log);
}


function genAi(mmm){
  const {q1, q2} = mmm
  console.log("mmmm >>> ", mmm);
  
  Q1Opt.comments = [q1.text]
  Q2Opt.comments = [q2.text]


  const fffff = [
    // `drawtext=text='@@Custom Font':fontfile='C:/Windows/Fonts/HMKMRHD.TTF':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2`,
    // `drawtext=text='!한글!조아!':fontfile='${FONT_PATH}':fontcolor=white:fontsize=24:x=(w-text_w)/3:y=(h-text_h)/2,drawtext=text='Custom Font':fontfile='C:/Windows/Fonts/HMKMRHD.TTF':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2,drawtext=text='!!한글!조아!':fontfile='${FONT_PATH}':fontcolor=white:fontsize=24:x=(w-text_w)/5:y=(h-text_h)/2`,
    // `drawtext=text='!한글!조아!':x=10:y=700:${DEFAULT_OPTION}:enable='between(t,2.5,3.5)'`,
    ...maker(Q1Opt),
    ...maker(A1Opt),
    ...maker(Q2Opt),
    ...maker(A2Opt),
    ...maker(A22Opt),
    ...maker(P1Opt),
    ...maker(P2Opt),
    ...maker(P3Opt),
  ];


  const top = [
    "[1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920:(iw-1080)/2:(ih-1920)/2[bg1080]", // 이미지를 늘린다음 1080으로 비율맞춤
    "[0:v]colorkey=0x00FE00:0.4:0.05[nuggi]", // 기존영상의 녹색 누끼제거
    "[bg1080][nuggi]overlay=(W-w)/2:(H-h)/2[bg_concat]", // 이미지배경과 누끼제거영상을 합성
    `[bg_concat]${fffff.join(",")}`, // 합성한 영상에 텍스트를 추가
  ]

  const BACK_IMG = path.join(__dirname, "videos/backz.jpg");

  return [
    "-i", GREEN_VIDEO,
    "-i", BACK_IMG,
    "-ss", "0", "-t", "20",
    "-filter_complex", top.join(";"),
    OUTPUT_VIDEO,
    "-y", // Overwrite the output file if it exists
  ]

  return "hihi"
}


async function exe(ppp){
  // executeFFmpeg(args)
  // .then(() => console.log("FFmpeg command executed successfully"))
  // .catch((error) => console.error("FFmpeg command failed:", error));

 

  return new Promise((resolve, reject) => {

    const newArgs = genAi(ppp)

    executeFFmpeg(newArgs)
    .then(() => {
      console.log("FFmpeg command executed successfully");
      resolve()
    })
    .catch((error) => {
      console.error("FFmpeg command failed:", error);
      reject(error)
    }
  );
    
  })
}

// exe()

// export exe fun
module.exports = exe



if (require.main === module) {
  // This block will run only if the script is executed directly, not when required as a module.
  console.log("This script is executed directly.");
  // Place your main script logic here.
  executeFFmpeg(args)
    .then(() => console.log("FFmpeg command executed successfully"))
    .catch((error) => console.error("FFmpeg command failed:", error));
}




