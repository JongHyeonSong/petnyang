const { spawn } = require("child_process");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const dayjs = require("dayjs");

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

// dev상태거나 윈도우에서는 슬래쉬 치환
let FONT_PATH = "";
const FONT_DIR = path.join(__dirname, "fonts/BMJUA_TTF.TTF");
// if is window replace
if (process.platform === "win32") {
  FONT_PATH = FONT_DIR.replace(/\\/g, "/");
} else {
  FONT_PATH = FONT_DIR;
}

// const DEFAULT_OPTION = ""

const DEFAULT_OPTION = `fontsize=48:fontcolor=white:fontfile='${FONT_PATH}':box=1:boxcolor=black@0.5:boxborderw=5`;
const LINE_GAP = 70;

/**
 * 옵션 - 순서가 바뀌면 안되는경우가 있음 기준모르겠음 enable이 일단뒤로감
 * text fontfile DEFAULT(fontsize fontcolor fontfile box boxcolor boxborderw) enable
 */

const Q1Opt = {
  mentArr: ["어제 애니봤어?", "몇시에 잤어?", "오쪼라고ss"],
  startPos: { xPos: 10, yPos: 700 },
  timeSlice: { start: 0.1, end: 2 },
};
const A1Opt = {
  mentArr: ["11시..."],
  startPos: { xPos: "(w-text_w-10)", yPos: 700 },
  timeSlice: { start: 2.5, end: 3.5 },
};
const Q2Opt = {
  mentArr: ["일찍 잤는데", "왜 계속 졸아?"],
  startPos: { xPos: 10, yPos: 700 },
  timeSlice: { start: 4, end: 8 },
};
const A2Opt = {
  mentArr: ["오..."],
  startPos: { xPos: "(w-text_w-10)", yPos: 700 },
  timeSlice: { start: 8, end: 11 },
};
const A22Opt = {
  mentArr: ["오전..."],
  startPos: { xPos: "(w-text_w-10)", yPos: 700 },
  timeSlice: { start: 11, end: 11.5 },
};

const P1Opt = {
  mentArr: ["줘팸1..."],
  startPos: { xPos: "10", yPos: 1000 },
  timeSlice: { start: 12.5, end: 20 },
};
const P2Opt = {
  mentArr: ["줘팸2..."],
  startPos: { xPos: "10", yPos: 1100 },
  timeSlice: { start: 13, end: 20 },
};
const P3Opt = {
  mentArr: ["줘팸3..."],
  startPos: { xPos: "10", yPos: 1200 },
  timeSlice: { start: 13.5, end: 20 },
};

/**
 * 멘트가 엔터키로 여러줄일때 적당한 LINE_GAP으로 살짝띄운 스크립트를 반환해준다
 *
 * mentArr: ["어제 애니봤어?", "몇시에 잤어?", "오쪼라고"],
 * startPos: { xPos:10, yPos: 700 },
 * timeSlice: { start: 0.1, end: 2 },
 *
 * 일경우 3줄의 drawtext 스크립트를 반환
 *
 * [
 *  '`drawtext=text='zbzbz':fontfile='C:/Windows/Fonts/HMKMRHD.TTF':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2`,
 *  '`drawtext=text='!한글!조아!':fontfile='${FONT_PATH}':fontcolor=white:fontsize=24:x=(w-text_w)/3:y=(h-text_h)/2,drawtext=text='Custom Font':fontfile='C:/Windows/Fonts/HMKMRHD.TTF':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2,drawtext=text='!!한글!조아!':fontfile='${FONT_PATH}':fontcolor=white:fontsize=24:x=(w-text_w)/5:y=(h-text_h)/2`,
 *  '`drawtext=text='!한글!조아!':x=10:y=700:${DEFAULT_OPTION}:enable='between(t,2.5,3.5)'`,
 * ]
 */
function multiScriptMaker(scene) {
  const { mentArr, startPos, timeSlice } = scene;

  const multipleScripts = mentArr.map((ment, idx) => {
    const combinedDrawText =
      `drawtext=text='${ment}'` +
      `:x=${startPos.xPos}:y=${startPos.yPos + idx * LINE_GAP}` +
      `:${DEFAULT_OPTION}` +
      `:enable='between(t,${timeSlice.start},${timeSlice.end})'`;

    return combinedDrawText;
  });
  return multipleScripts;
}

// ```
// ffmpeg
// -i C:\Users\user\Desktop\project\private\petnyang\src\videos\cat-concat.mp4
// -i C:\Users\user\Desktop\project\private\petnyang\src\videos\backz.jpg
// -ss 0 -t 20
// -filter_complex
//   [1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920:(iw-1080)/2:(ih-1920)/2[bg1080]
//   ;[0:v]colorkey=0x00FE00:0.4:0.05[nuggi]
//   ;[bg1080][nuggi]overlay=(W-w)/2:(H-h)/2[bg_concat]
//   ;[bg_concat]
//     drawtext=text='undefined':x=10:y=700:fontsize=48:fontcolor=white:fontfile='C:/Users/user/Desktop/project/private/petnyang/src/fonts/HMKMRHD.TTF':box=1:boxcolor=black@0.5:boxborderw=5:enable='between(t,0.1,2)'
//     ,drawtext=text='11시...':x=(w-text_w-10):y=700:fontsize=48:fontcolor=white:fontfile='C:/Users/user/Desktop/project/private/petnyang/src/fonts/HMKMRHD.TTF':box=1:boxcolor=black@0.5:boxborderw=5:enable='between(t,2.5,3.5)'
//     ,drawtext=text='q22 안녕@@':x=10:y=700:fontsize=48:fontcolor=white:fontfile='C:/Users/user/Desktop/project/private/petnyang/src/fonts/HMKMRHD.TTF':box=1:boxcolor=black@0.5:boxborderw=5:enable='between(t,4,8)'
//     ,drawtext=text='오...':x=(w-text_w-10):y=700:fontsize=48:fontcolor=white:fontfile='C:/Users/user/Desktop/project/private/petnyang/src/fonts/HMKMRHD.TTF':box=1:boxcolor=black@0.5:boxborderw=5:enable='between(t,8,11)'
//     ,drawtext=text='오전...':x=(w-text_w-10):y=700:fontsize=48:fontcolor=white:fontfile='C:/Users/user/Desktop/project/private/petnyang/src/fonts/HMKMRHD.TTF':box=1:boxcolor=black@0.5:boxborderw=5:enable='between(t,11,11.5)'
//     ,drawtext=text='줘팸1...':x=10:y=1000:fontsize=48:fontcolor=white:fontfile='C:/Users/user/Desktop/project/private/petnyang/src/fonts/HMKMRHD.TTF':box=1:boxcolor=black@0.5:boxborderw=5:enable='between(t,12.5,20)'
//     ,drawtext=text='줘팸2...':x=10:y=1100:fontsize=48:fontcolor=white:fontfile='C:/Users/user/Desktop/project/private/petnyang/src/fonts/HMKMRHD.TTF':box=1:boxcolor=black@0.5:boxborderw=5:enable='between(t,13,20)'
//     ,drawtext=text='줘팸3...':x=10:y=1200:fontsize=48:fontcolor=white:fontfile='C:/Users/user/Desktop/project/private/petnyang/src/fonts/HMKMRHD.TTF':box=1:boxcolor=black@0.5:boxborderw=5:enable='between(t,13.5,20)'
// C:\Users\user\Desktop\project\private\petnyang\src\output\ou1.mp4 -y

// ```;
/**
   * 
   * @param {*} sceneArr 
   * @param {*} backImgPath 
   * @param {*} outputFileName 
   * @returns 
   * 
   * -i C:\Users\user\Desktop\project\private\petnyang\src\videos\cat-concat.mp4
    -i C:\Users\user\Desktop\project\private\petnyang\src\videos\backz.jpg
    -ss 0 -t 20
    -filter_complex
      [1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920:(iw-1080)/2:(ih-1920)/2[bg1080]
      ;[0:v]colorkey=0x00FE00:0.4:0.05[nuggi]
      ;[bg1080][nuggi]overlay=(W-w)/2:(H-h)/2[bg_concat]
      ;[bg_concat]
        drawtext=text='undefined':x=10:y=700:fontsize=48:fontcolor=white:fontfile='C:/Users/user/Desktop/project/private/petnyang/src/fonts/HMKMRHD.TTF':box=1:boxcolor=black@0.5:boxborderw=5:enable='between(t,0.1,2)'
        ,drawtext=text='11시...':x=(w-text_w-10):y=700:fontsize=48:fontcolor=white:fontfile='C:/Users/user/Desktop/project/private/petnyang/src/fonts/HMKMRHD.TTF':box=1:boxcolor=black@0.5:boxborderw=5:enable='between(t,2.5,3.5)'
        ,drawtext=text='q22 안녕@@':x=10:y=700:fontsize=48:fontcolor=white:fontfile='C:/Users/user/Desktop/project/private/petnyang/src/fonts/HMKMRHD.TTF':box=1:boxcolor=black@0.5:boxborderw=5:enable='between(t,4,8)'
        ,drawtext=text='오...':x=(w-text_w-10):y=700:fontsize=48:fontcolor=white:fontfile='C:/Users/user/Desktop/project/private/petnyang/src/fonts/HMKMRHD.TTF':box=1:boxcolor=black@0.5:boxborderw=5:enable='between(t,8,11)'
        ,drawtext=text='오전...':x=(w-text_w-10):y=700:fontsize=48:fontcolor=white:fontfile='C:/Users/user/Desktop/project/private/petnyang/src/fonts/HMKMRHD.TTF':box=1:boxcolor=black@0.5:boxborderw=5:enable='between(t,11,11.5)'
        ,drawtext=text='줘팸1...':x=10:y=1000:fontsize=48:fontcolor=white:fontfile='C:/Users/user/Desktop/project/private/petnyang/src/fonts/HMKMRHD.TTF':box=1:boxcolor=black@0.5:boxborderw=5:enable='between(t,12.5,20)'
        ,drawtext=text='줘팸2...':x=10:y=1100:fontsize=48:fontcolor=white:fontfile='C:/Users/user/Desktop/project/private/petnyang/src/fonts/HMKMRHD.TTF':box=1:boxcolor=black@0.5:boxborderw=5:enable='between(t,13,20)'
        ,drawtext=text='줘팸3...':x=10:y=1200:fontsize=48:fontcolor=white:fontfile='C:/Users/user/Desktop/project/private/petnyang/src/fonts/HMKMRHD.TTF':box=1:boxcolor=black@0.5:boxborderw=5:enable='between(t,13.5,20)'
    C:\Users\user\Desktop\project\private\petnyang\src\output\ou1.mp4 -y
   */

function genScript(sceneArr, backImgPath, outputFilePath) {
  // 한 씬(scene) 에서 한마디라도 여러줄이 될수있는데, 구분하지말고 여러줄 자체를 drawtext로 다넣어준다
  const drawTextScripts = sceneArr.map((scene) => {
    const drawTextScriptsArr = multiScriptMaker(scene);
    return drawTextScriptsArr;
  });

  // 한줄씩 테스트방법 : 뒤키워드 [bg1080]을 지우고 나머지 세라인을 지운다 파라미터를 넘기는느낌인데, 넘겨서 쓰던지 OR 안넘기던지
  const FILTER_COMPLEX_OPTIONS = [
    [
      "[1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920:(iw-1080)/2:(ih-1920)/2[bg1080]",
    ], // 이미지를 늘린다음 1080으로 비율맞춤
    "[0:v]colorkey=0x00FE00:0.4:0.05[nuggi]", // 기존영상의 녹색 누끼제거
    "[bg1080][nuggi]overlay=(W-w)/2:(H-h)/2[bg_concat]", // 이미지배경과 누끼제거영상을 합성
    `[bg_concat]${drawTextScripts.flat().join(",")}`, // 합성한 영상에 텍스트를 추가
  ];

  // const BACK_IMG = path.join(__dirname, `videos/backz.jpg`);

  // OUTPUT_VIDEO;

  return [
    "-i",
    GREEN_VIDEO,
    "-i",
    backImgPath,
    "-ss",
    "0",
    "-t",
    "15", // 총20초인데 17초정도끊으면 줘팸타임 끝남
    "-filter_complex",
    FILTER_COMPLEX_OPTIONS.join(";"),
    outputFilePath,
    "-y", // Overwrite the output file if it exists
  ];
}

/**
 *
 * @returns outputFilePath
 */
async function genVideo(sceneArr, backImgPath) {
  return new Promise(async (resolve, reject) => {
    const fileNm = `${dayjs().format("YYMMDD-HHmmss")}--${uuidv4()}.mp4`;
    const outputFilePath = path.join(__dirname, "output", fileNm);

    // const outputFilePath = `${Date.now()}-${uuidv4()}.mp4`;
    const runFfmpegArgs = genScript(sceneArr, backImgPath, outputFilePath);
    console.log("🚀 ~ returnnewPromise ~ runFfmpegArgs:", runFfmpegArgs);

    console.log("full", runFfmpegArgs.join(" "));
    // resolve(outputFilePath);

    try {
      await executeFFmpeg(runFfmpegArgs);
      resolve(fileNm);
    } catch (error) {
      reject(error);
    }

    // executeFFmpeg(newArgs)
    //   .then(() => {
    //     console.log("FFmpeg command executed successfully");
    //     resolve();
    //   })
    //   .catch((error) => {
    //     console.error("FFmpeg command failed:", error);
    //     reject(error);
    //   });
  });
}

module.exports = { genVideo };

// 이것만 테스트할때사용
if (require.main === module) {
  const TEXT_ARR = [
    // `drawtext=text='@@Custom Font':fontfile='C:/Windows/Fonts/HMKMRHD.TTF':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2`,
    // `drawtext=text='!한글!조아!':fontfile='${FONT_PATH}':fontcolor=white:fontsize=24:x=(w-text_w)/3:y=(h-text_h)/2,drawtext=text='Custom Font':fontfile='C:/Windows/Fonts/HMKMRHD.TTF':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2,drawtext=text='!!한글!조아!':fontfile='${FONT_PATH}':fontcolor=white:fontsize=24:x=(w-text_w)/5:y=(h-text_h)/2`,
    // `drawtext=text='!한글!조아!':x=10:y=700:${DEFAULT_OPTION}:enable='between(t,2.5,3.5)'`,
    ...multiScriptMaker(Q1Opt),
    ...multiScriptMaker(A1Opt),
    ...multiScriptMaker(Q2Opt),
    ...multiScriptMaker(A2Opt),
    ...multiScriptMaker(A22Opt),
    ...multiScriptMaker(P1Opt),
    ...multiScriptMaker(P2Opt),
    ...multiScriptMaker(P3Opt),
  ];
  const FILTER_OPTIONS = [
    "[1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920:(iw-1080)/2:(ih-1920)/2", // 이미지를 늘린다음 1080으로 비율맞춤
    // "[0:v]colorkey=0x00FE00:0.4:0.05[nuggi]", // 기존영상의 녹색 누끼제거
    // "[bg1080][nuggi]overlay=(W-w)/2:(H-h)/2[bg_concat]", // 이미지배경과 누끼제거영상을 합성
    // `[bg_concat]${TEXT_ARR.join(",")}`, // 합성한 영상에 텍스트를 추가
  ];
  // wer(FILTER_OPTIONS)

  const args = [
    "-i",
    GREEN_VIDEO,
    "-i",
    BACK_IMG,
    "-ss",
    "0",
    "-t",
    "20",
    "-filter_complex",
    FILTER_OPTIONS.join(";"),
    OUTPUT_VIDEO,
    "-y", // Overwrite the output file if it exists
  ];
  console.log("🚀 ~ args:", args);

  // This block will run only if the script is executed directly, not when required as a module.
  console.log("This script is executed directly.");
  // Place your main script logic here.
  executeFFmpeg(args)
    .then(() => console.log("FFmpeg command executed successfully"))
    .catch((error) => console.error("FFmpeg command failed:", error));
}
