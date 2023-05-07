var avatarPreview = $(".avatarPreview"),
  ranBtn = document.getElementById("ranAvatarBtn"),
  inputAvatar = document.getElementById("avatarInput");
function ranNum(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusiv
}
generateDefaultAvatar();
ranBtn.addEventListener("click", function () {
  generateDefaultAvatar();
});
function generateDefaultAvatar() {
  var theNum = ranNum(1, 11);
  var defaultAvatarURL = "url('/pro-img/i-" + theNum + ".png')";
  avatarPreview[0].setAttribute(
    "style",
    "background-image: " + defaultAvatarURL
  );
  inputAvatar.value = "i-" + theNum + ".png";
}
