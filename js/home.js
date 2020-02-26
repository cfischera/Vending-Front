$(document).ready(function() {
	loadItems();

	$("#makePurchase").on("click", makePurchase);

	$("#changeIn").val("$0.00");


	$(".changeButton").on("click", function(e) {
		if(e.target.id == "addDollar") {
			insertChange(1);
		} else if(e.target.id == "addQuarter") {
			insertChange(0.25);
		} else if(e.target.id == "addDime") {
			insertChange(0.1);
		} else if(e.target.id == "addNickel") {
			insertChange(0.05);
		}
	});

	$("#changeReturn").on("click", function() {
		dispenseChange(calculateChange(parseFloat($("#changeIn").val().substr(1))));
	});

	}
);

function loadItems() {
	$.ajax({ type: "GET", url: "http://tsg-vending.herokuapp.com/items", success: function(jsonArray) {
		$("#vendingItems").empty();
		$.each(jsonArray, function(index, item) {
			var preparedHtml;
			preparedHtml =
			"<div class='col-md-4 singleItem rounded border' onclick='selectItem("+item.id+")'>"+
			"<p>"+item.id+"</p>"+
			"<p style='text-align: center'>"+item.name+"</p>"+
			"<p style='text-align: center'>$"+item.price.toFixed(2)+"</p>"+
			"<p style='text-align: center'>Quantity Left: "+item.quantity+"</p>"+
			"</div>";
            $("#vendingItems").append(preparedHtml);
		});
	}, error: function() {
		$("#vendingItems").empty();
		$("#vendingItems").append("<p> Failed to Load Items</p>");
	}});
}

function makePurchase() {
	$("#mainMessage").empty();
	$.ajax({ type: "POST", url: "http://tsg-vending.herokuapp.com/money/"+$("#changeIn").val().substr(1)+"/item/"+$("#itemNum").val(),
		dataType: "json", success: function(changeReturn) {
			var returnTotal = (changeReturn.quarters*.25)+(changeReturn.dimes*.1)+(changeReturn.nickels*.05)+(changeReturn.pennies*.01);
			dispenseChange(calculateChange(returnTotal));
			$("#mainMessage").append("THANK YOU!!!");
			loadItems();
	}, statusCode: {
		422: function(errorMessage) {
			$("#mainMessage").append(JSON.parse(errorMessage.responseText).message);
			}
		}
	});
}

function selectItem(id) {
		$("#itemNum").val(id);
	}

function insertChange(moreChange) {
	var current = parseFloat($("#changeIn").val().substr(1));
	current += moreChange;
	$("#changeIn").val("$"+current.toFixed(2));
}

function calculateChange(changeTotal) {
	var fakeChange = (changeTotal*100).toFixed(0);
	var dollars = 0;
	var quarters = 0;
	var dimes = 0;
	var nickels = 0;
	while(fakeChange >= 100) {
		fakeChange -= 100;
		dollars++;
	}
	while(fakeChange >= 25) {
		fakeChange -= 25;
		quarters++;
	}
	while(fakeChange >= 10) {
		fakeChange -= 10;
		dimes++;
	}
	while(fakeChange >= 5) {
		fakeChange -= 5;
		nickels++;
	}
	return [dollars, quarters, dimes, nickels];
}

function dispenseChange(coinArray) {
	$("#changeOut").empty();
	if(coinArray[0] > 0) {
		$("#changeOut").append("<p>"+coinArray[0]+" Dollars</p>");
	}
	if(coinArray[1] > 0) {
		$("#changeOut").append("<p>"+coinArray[1]+" Quarters</p>");
	}
	if(coinArray[2] > 0) {
		$("#changeOut").append("<p>"+coinArray[2]+" Dimes</p>");
	}
	if(coinArray[3] > 0) {
		$("#changeOut").append("<p>"+coinArray[3]+" Nickels</p>");
	}
	$("#changeIn").val("$0.00");
}

