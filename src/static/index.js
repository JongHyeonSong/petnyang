const vueData = {
  isLoading: false,
  mentList: {
    cat1_1: {
      title: "고양이1 멘트",
      desc: "어제 애니봤어?",
      mentArr: ["어제 애니봤어?", "몇시에 잤어?", "오쪼라고"],
      startPos: { xPos: 10, yPos: 700 },
      timeSlice: { start: 0.1, end: 2 },
    },
    cat2_1: {
      title: "고양이2 멘트",
      desc: "11시...?",
      mentArr: ["11시..."],
      startPos: { xPos: "(w-text_w-10)", yPos: 700 },
      timeSlice: { start: 2.5, end: 3.5 },
    },

    cat1_2: {
      title: "고양이1 멘트",
      desc: "일찍 잤는데 왜 계속 졸아?",
      mentArr: ["일찍 잤는데", "왜 계속 졸아?"],
      startPos: { xPos: 10, yPos: 700 },
      timeSlice: { start: 4, end: 8 },
    },

    cat2_2: {
      title: "고양이2 멘트",
      desc: "오..?",
      mentArr: ["오..."],
      startPos: { xPos: "(w-text_w-10)", yPos: 700 },

      timeSlice: { start: 8, end: 11 },
    },

    cat2_3: {
      title: "고양이2 멘트",
      desc: "오전...",
      mentArr: ["오전..."],
      startPos: { xPos: "(w-text_w-10)", yPos: 700 },
      timeSlice: { start: 11, end: 11.5 },
    },

    pem1: {
      title: "고양이1 줘팸",
      desc: "팸1...",
      mentArr: ["줘팸1..."],
      startPos: { xPos: 10, yPos: 1000 },
      timeSlice: { start: 12.5, end: 20 },
    },
    pem2: {
      title: "고양이1 줘팸",
      desc: "팸2...",
      mentArr: ["줘팸2..."],
      startPos: { xPos: 10, yPos: 1100 },
      timeSlice: { start: 13, end: 20 },
    },
    pem3: {
      title: "고양이1 줘팸",
      desc: "팸3...",
      mentArr: ["줘팸3..."],
      startPos: { xPos: 10, yPos: 1200 },
      timeSlice: { start: 13.5, end: 20 },
    },

    // ################3
  },
};

let vm;

$(function () {
  initVue();
  fns.init();
});

function initVue() {
  vm = Vue.createApp({
    data() {
      return vueData;
    },
    methods: {
      onMainClick() {},

      async onSnedClick(ment) {
        const formData = new FormData();

        const sceneArr = Object.values(vm.mentList);
        formData.append("paramMap", JSON.stringify({ sceneArr: sceneArr }));

        let bgFile = null;

        if (vm.bgFile) {
          bgFile = vm.bgFile;
        } else {
          const response = await fetch("/back.jpg");
          bgFile = await response.blob();
        }

        formData.append("file", bgFile);

        vm.isLoading = true;
        const res = await fetch("/api", {
          method: "POST",
          body: formData,
        });
        vm.isLoading = !true;

        const { fileNm } = await res.json();
        this.openModal(fileNm);
      },

      closeModal() {
        document.getElementById("my_video").pause();
      },
      openModal(fileNm = "") {
        document.getElementById("my_modal").showModal();

        if (fileNm) {
          document.getElementById("my_video").src = `/video/${fileNm}`;
        }
      },
      async onFileChange(e) {
        const file = e.target.files[0];
        if (!file) return alert("no file!");

        vm.bgFile = file;
        const url = URL.createObjectURL(file);
        const mainPhone = document.getElementById("mainPhone");
        mainPhone.style.backgroundImage = `url(nuggi-cat.png), url(${url})`;
      },
    },
    mounted() {
      // this.openModal();
    },
  }).mount("#app");
}

function initSetup() {}

const fns = {
  init() {
    const mainPhone = $("#mainPhone");

    setResponsiveWidth();
    window.addEventListener("resize", _.throttle(setResponsiveWidth, 200));

    function setResponsiveWidth() {
      const height = mainPhone.outerHeight();
      const responsiveWidth = height * 0.6;
      // mainPhone.style.width = `${responsiveWidth}px`;

      mainPhone.css("width", `${responsiveWidth}px`);
    }
  },
};
