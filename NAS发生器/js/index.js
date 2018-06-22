var dappAddress = "n1t7CvSXrB6P9zMvoETjd26B2uUkRGyH5Z4";
$(function () {
	var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
	var nebpay = new NebPay();
	$("#all").click(function () {
		var to = dappAddress;
		var value = "0";
		var callFunction = "getlist";
		var callArgs = "[]";
		nebpay.simulateCall(to, value, callFunction, callArgs, {
			listener: function (resp) {
				//console.log(JSON.stringify(resp.result));
				if (resp.result == "") {
					$("#searchresult").html('<div class="panel-body" >nodata</div>');
					return;
				}
				var res = JSON.parse(resp.result);
				if (res.length == 0) {
					$("#searchresult").html('<div class="panel-body">nodata</div>');
					return;
				}

				var tempStr = '<div class="col-md-3 text-center">';

				for (var i = 0; i < res.length-1; i++) {
					if (i % 2 == 0) { //0 2 4 6 8
						tempStr += '<span class="icons c1"><i class="fa fa-trophy"></i></span>';
					} else { //1 3 4 5 6
						tempStr += '<span class="icons c2"><i class="fa fa-picture-o"></i></span>';
					}
					tempStr += '<div class="box-area"><h3>';
					tempStr += res[i].title;
					tempStr += '</h3><p>';
					tempStr += res[i].info + '<br>';
					tempStr += '<small><cite>' + 'ID:' + res[i].author.substr(3, 6) + '</cite></small>';
					tempStr += '</p> </div> ';
					tempStr += '</div>';
				}
				console.log(tempStr);
				$("#searchresult").html(tempStr);
			}
		});
	});
	//列表
	$("#up").click(function ()  {
		var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
		var nebpay = new NebPay();
		var address = $("#address").val(); //地址
		address = address.replace(/\n/g, "<br>");
		nebpay.call(dappAddress, "0", "receive_1", "[\"" +"\"]", {
			listener: function Push(resp) {
				console.log("response of push: " + JSON.stringify(resp))
				var respString = JSON.stringify(resp);
				if (respString.search("rejected by user") !== -1) {
					alert("关闭交易,取消")
				} else if (respString.search("txhash") !== -1) {
					alert("上传Hash: " + resp.txhash + "请等待交易确认")
				}
			}
		})
	});
	
	$("#ups").click(function ()  {
		var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
		var nebpay = new NebPay();
		var address = $("#address").val(); //地址
		if (address == "") {
			alert("EMPTY wallet address!");
			return;
		}
		if (address.length != 35) {
			alert("Invalid wallet address!");
			return;
		}
		address = address.replace(/\n/g, "<br>");
		nebpay.call(dappAddress, "0", "receive", "[\"" + address + "\"]", {
			listener: function Push(resp) {
				console.log("response of push: " + JSON.stringify(resp))
				var respString = JSON.stringify(resp);
				if (respString.search("rejected by user") !== -1) {
					alert("关闭交易,取消")
				} else if (respString.search("txhash") !== -1) {
					alert("上传Hash: " + resp.txhash + "请等待交易确认")
				}
			}
		})
	});

	$("#saven").click(function () {
		var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
		var nebpay = new NebPay();
	
		var name = $("#name").val();    //名称
		var content = $("#conte").val();	//内容
		var img = $("#img").val();		//图片
		var url = $("#url").val();		//地址
		var bal = $("#bal").val();
	
		if (name == "") {
			alert("请输入物品名称。");
			return;
		}
		if (content == "") {
			alert("请输入物品描述。");
			return;
		}
		if (bal <= 0.005) {
			alert("赞助费过低");
			return;
		}
	
		name = name.replace(/\n/g, "<br>");
		content = content.replace(/\n/g, "<br>");
		url = url.replace(/\n/g, "<br>");
		img = img.replace(/\n/g, "<br>");
	
	
		var to = dappAddress;
		var callFunction = "savenew";
		var callArgs = '["' + name + '","' + content + '","' + img + '","' + url + '"]';
		nebpay.call(to, bal, callFunction, callArgs, {
			listener: function Push(resp) {
				console.log("response of push: " + JSON.stringify(resp))
				var respString = JSON.stringify(resp);
				if (respString.search("rejected by user") !== -1) {
					alert("关闭交易,取消上传")
				} else if (respString.search("txhash") !== -1) {
					alert("上传Hash: " + resp.txhash + "请等待交易确认,如果上传失败请检查内容是否含有特殊字符")
				}
			}
		});
	});
	$("#all").click();
});




function ttt(timestamp) {
	var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
	Y = date.getFullYear() + '-';
	M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
	D = date.getDate() + ' ';
	h = date.getHours() + ':';
	m = date.getMinutes() + ':';
	s = date.getSeconds();
	return Y + M + D + h + m + s;
}