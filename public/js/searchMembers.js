//Search members to project function
var showResults = debounce(function(arg) {
	var value = arg.trim();
	var membersList = $("#membersList");
	if(value == "" || value.length <= 0){
		membersList.fadeOut();
	}else{
		membersList.fadeIn();
	}
	var jqxhr = $.get("/p/search?q=" + value, function(data){
		membersList.html("");
	})
	.done(function(data) {
		if(data.length === 0) {
			membersList.append("<span> No Results!</span>");
		}else{
			data.forEach(x => {
				membersList.append("<li>" + x.name + "</li>");
			});
		}
	})
	.fail(function(err){
		console.log(err);
	})
}, 200);

function debounce(func,wait,immediate) {
	var timeout;
	return function() {
		var context = this;
		args = arguments;
		var later = function() {
			timeout = null;
			if(!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if(callNow) func.apply(context,args);
	};
};