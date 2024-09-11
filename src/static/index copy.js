$(function () {
  // fns.initPrevie();
  // fetch("https://localhost:3000/ping", {
  //   method: "GET",
  //   credentials: "include",
  // })
  //   .then((n) => n.text())
  //   .then((r) => {
  //     console.log(r);
  //   });
  // //   axios.get("https://localhost:3000/ping", { withCredentials: true });
  // $("#sendBtn").on("click", function () {
  //   const q1text = $("#line-q1 input").eq(0);
  //   const q2text = $("#line-q2 input").eq(0);
  //   const bgFile = $("#bg-file").get(0);
  //   const formData = new FormData();
  //   const jsonData = {
  //     q1: q1text.val(),
  //     q2: q2text.val(),
  //   };
  //   // formData.append('paramMap', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }));
  //   formData.append("paramMap", JSON.stringify(jsonData));
  //   formData.append("file", bgFile.files[0]);
  //   $.ajax({
  //     url: "/api",
  //     type: "POST",
  //     xhrFields: {
  //       responseType: "blob", // Set the response type to 'blob' to handle binary data
  //     },
  //     data: formData,
  //     processData: false,
  //     contentType: false,
  //     success: function (data) {
  //       const videoURL = URL.createObjectURL(data);
  //       $("#testVideo").attr("src", videoURL);
  //       console.log(data);
  //     },
  //     error: function (err) {
  //       console.log(err);
  //     },
  //   });
  // });
});

const fns = {
  initPrevie() {
    const mainPhone = $("#mainPhone");

    setResponsiveWidth();
    window.addEventListener("resize", _.throttle(setResponsiveWidth, 200));

    function setResponsiveWidth() {
      const height = mainPhone.outerHeight();
      const responsiveWidth = height / 2;
      // mainPhone.style.width = `${responsiveWidth}px`;

      mainPhone.css("width", `${responsiveWidth}px`);
    }
  },
};
