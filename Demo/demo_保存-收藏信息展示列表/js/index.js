var dappAddress = "n2341D8QQrBjRi5U9QeDUBcbeoRCwWRqtQ5";
$(function() {
	
	
		var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
		var nebpay = new NebPay();

		
		//var dappAddress = "n2341D8QQrBjRi5U9QeDUBcbeoRCwWRqtQ5";
		var txHash = "4cbc74e26f138c57dda5e3a86dc6965a3f11dca7c7735e3164611a0e15ffedba";
		
		
	$("#navall").click(function() {
		$("#detailTitle").text("所有记录的合约");

		var to = dappAddress;
		var value = "0";
		var callFunction = "getAll";
		var callArgs = "[]";
		nebpay.simulateCall(to, value, callFunction, callArgs, {
			listener: function(resp) {
				//console.log(JSON.stringify(resp.result));
				if(resp.result == ""){
					$("#searchresult").html('<div class="panel-body" >请前往github.com/ChengOrangeJu/WebExtensionWallet安装钱包</div>');
					return;
				}
				var myArr = JSON.parse(resp.result);
				if(myArr.length == 0){
					$("#searchresult").html('<div class="panel-body">请前往github.com/ChengOrangeJu/WebExtensionWallet安装钱包，安装后请耐心等待加载</div>');
					return;
				}

				var tempStr = "";

				for (var i = 0; i < myArr.length; i++) {
					if (i % 2 == 0) {
						tempStr += '<div class="panel-body"> ';
					} else {
						tempStr += '<div class="panel-footer">';
					}

					//					
					tempStr += '<p>';
					tempStr += myArr[i].content;
					tempStr += '</p>';
					tempStr += '<p>';
					tempStr += '<small><cite>' + '合约记录者：' + myArr[i].author + '</cite></small>';
					tempStr += '<br>';
					tempStr += '<a class="btn" href="javascript:void(0)" id="like" onclick="addLike(';
					tempStr += myArr[i].index;
					tempStr += ')">收藏合约</a>';

					tempStr += '</p> </div> ';
				}
				console.log(tempStr);
				$("#searchresult").html(tempStr);
			}
		});

	});
	$("#navall").click();

	$("#navlike").click(function() {
		$("#detailTitle").text("我收藏的合约");



		var to = dappAddress;
		var value = "0";
		var callFunction = "getMyLike";
		var callArgs = "[]";
		nebpay.simulateCall(to, value, callFunction, callArgs, {
			listener: function(resp) {
				//console.log(JSON.stringify(resp.result));
				if(resp.result == ""){
					$("#searchresult").html('<div class="panel-body">暂时没有记录</div>');
					return;
				}
				var myArr = JSON.parse(resp.result);
				if(myArr.length == 0){
					$("#searchresult").html('<div class="panel-body">暂时没有记录</div>');
					return;
				}
				

				var tempStr = "";

				for (var i = 0; i < myArr.length; i++) {
					if (i % 2 == 0) {
						tempStr += '<div class="panel-body"> ';
					} else {
						tempStr += '<div class="panel-footer">';
					}

					//					
					tempStr += '<p>';
					tempStr += myArr[i].content;
					tempStr += '</p>';
					tempStr += '<p>';
					tempStr += '<small><cite>' + '合约记录者：' + myArr[i].author + '</cite></small>';
					
					tempStr += '<br>';
					tempStr += '<a class="btn" href="#" id="removelike" onclick="removeLike(';
					tempStr += myArr[i].index;
					tempStr += ')">取消收藏</a>';
					
					tempStr += '</p> </div> ';
				}
				console.log(tempStr);
				$("#searchresult").html(tempStr);
			}
		});

	});

	$("#navcreate").click(function() {
		$("#detailTitle").text("我要记录合约");

		var tempStr = '';
		tempStr += '<div class="panel-body"> ';
		tempStr += '<form role="form">';
		tempStr += '<div class="form-group">';
		tempStr += '<textarea style="float: left" class="form-control" rows="10" id="content" >将我替换为想记录的合约内容</textarea>';
		tempStr += '<button type="button" class="btn btn-primary" id="savebutton" onclick="save();">记录合约</button>';		
		tempStr += '</div>';
		tempStr += '</form>';
		tempStr += '</div> ';
		console.log(tempStr);

		$("#searchresult").html(tempStr);
	});

});

function addLike(index){
	var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
	var nebpay = new NebPay();

	//var dappAddress = "n1nk8EEJcCE2J1fk2wdFCLMkhH8cttrxGJE";
	var txHash = "4cbc74e26f138c57dda5e3a86dc6965a3f11dca7c7735e3164611a0e15ffedba";

		var to = dappAddress;
		var value = "0";
		var callFunction = "addLike";
		var callArgs = "[\"" + index + "\"]";
		nebpay.call(to, value, callFunction, callArgs, {
			listener: function(resp) {
				console.log(JSON.stringify(resp.result));
			}
		});
};

function removeLike(index){
	var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
	var nebpay = new NebPay();

	//var dappAddress = "n1nk8EEJcCE2J1fk2wdFCLMkhH8cttrxGJE";
	var txHash = "4cbc74e26f138c57dda5e3a86dc6965a3f11dca7c7735e3164611a0e15ffedba";

		var to = dappAddress;
		var value = "0";
		var callFunction = "removeLike";
		var callArgs = "[\"" + index + "\"]";
		nebpay.call(to, value, callFunction, callArgs, {
			listener: function(resp) {
				console.log(JSON.stringify(resp.result));
			}
		});
};

function save(){
	var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
	var nebpay = new NebPay();

	//var dappAddress = "n1nk8EEJcCE2J1fk2wdFCLMkhH8cttrxGJE";
	var txHash = "4cbc74e26f138c57dda5e3a86dc6965a3f11dca7c7735e3164611a0e15ffedba";
	
		var content = $("#content").val();

		if (content == "") {
			alert("请输入要记录的内容。");
			return;
		}
		
		content= content.replace(/\n/g,"<br>"); 

		var to = dappAddress;
		var value = "0";
		var callFunction = "save";
		var callArgs = "[\"" + content + "\"]";
		nebpay.call(to, value, callFunction, callArgs, {
			listener: function(resp) {
				console.log(JSON.stringify(resp));
				alert("发送成功");
			}
		});
	
};