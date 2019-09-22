//Search members to project function
let memberIds = [];
let list;

function addMember() {
  let memForm = document.getElementById("newMembers");
  for (var i = 0; i < list.length; i++) {
    list[i].addEventListener("click", function() {
      let att = this.getAttribute("data-memId"); // member Id from data Attribute
      let memProImg = this.getAttribute("data-img");
      memberIds.push(att);
      let newName = this.textContent; //innerHtml (name)
      let inputStr =
        "<div class='memList'><input type='checkbox' name='members' value='" +
        newName +
        "' disabled='disabled' checked><img src='/pro-img/" +
        memProImg +
        "'>" +
        newName +
        "</input></div>";
      memForm.insertAdjacentHTML("beforeend", inputStr);
    });
  }
}

//--------------
var showResults = debounce(function(arg) {
  var value = arg.trim();
  var membersList = $("#membersList");
  var popup = $("#memberPopup");
  var input = $("#assign");
  input.addClass("loading");
  if (value == "" || value.length <= 0) {
    input.removeClass("loading");
    popup.hide();
    return;
  } else {
    popup.show();
  }
  var jqxhr = $.get("/p/search?q=" + value, function(data) {
    membersList.html("");
  })
    .done(function(data) {
      if (data.length === 0) {
        membersList.append(
          "<span>No members found with ' " + value + " ' </span>"
        );
      } else {
        data.forEach(x => {
          membersList.append(
            "<li class='lis' data-img='" +
              x.profileImg +
              "' data-memId='" +
              x._id +
              "'><img src='/pro-img/" +
              x.profileImg +
              "'>" +
              x.name +
              "</li>"
          );
        });

        list = document.querySelectorAll(".lis");
        addMember();
      }
      input.removeClass("loading");
    })
    .fail(function(err) {
      console.log(err);
    });
}, 200);

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this;
    args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}
