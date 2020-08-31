//Search members to project function
let memberIds = [];
let list;
let submitBtn = document.getElementsByClassName("submit");
function addMember() {
  let memForm = document.getElementById("newMembers");
  for (var i = 0; i < list.length; i++) {
    list[i].addEventListener("click", function () {
      let memId = this.getAttribute("data-memId"); // member Id from data Attribute
      let memProImg = this.getAttribute("data-img");
      let newName = this.textContent; //innerHtml (name)
      let inputStr =
        "<label class='checkbox-label'><input type='checkbox' name='members' value='" +
        memId +
        "' checked></input><span class='checkbox-custom'></span><img src='/pro-img/" +
        memProImg +
        "'>" +
        newName +
        "</label>";
      memberIds.push(memId);
      if (submitBtn.length === 0) {
        let theButtonStr =
          "<button class='submit btnlink' type='submit'>Add Members Selected </button>";
        memForm.insertAdjacentHTML("beforeend", theButtonStr);
      }
      memForm.insertAdjacentHTML("beforeend", inputStr);
    });
  } // end of for loop
}

//--------------
var showResults = debounce(function (arg) {
  var value = arg.trim();
  var membersList = $("#membersList");
  var popup = $("#memberPopup");
  var input = $("#assign");
  input.addClass("loading");
  if (value == "" || value.length <= 0) {
    input.removeClass("loading");
    popup.fadeOut();
    return;
  } else {
    popup.fadeIn();
  }
  var jqxhr = $.get("/p/search?q=" + value, function (data) {
    membersList.html("");
  })
    .done(function (data) {
      if (data.length === 0) {
        membersList.append(
          "<span>No members found with ' " + value + " ' </span>"
        );
      } else {
        data.forEach((x) => {
          console.log(x);
          var outputHTML =
            "<li class='lis' data-img='" +
            x.profileImg +
            "' data-memId='" +
            x._id +
            "'><img src='/pro-img/" +
            x.profileImg +
            "'>" +
            x.name +
            "</li>";
          membersList.append(outputHTML);
        });
        list = document.querySelectorAll(".lis");
        addMember();
      }
      input.removeClass("loading");
    })
    .fail(function (err) {
      console.log(err);
    });
}, 350); // debounce data every 350ms from each 2 keystrokes

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this;
    args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}
