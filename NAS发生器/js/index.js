var dappAddress = "n1t7CvSXrB6P9zMvoETjd26B2uUkRGyH5Z4";
$(function () {
	var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
	var nebpay = new NebPay();


	//第一次领取
	$("#up").click(function () {
		var address = $("#inputAddress").val();
		if (address.length != 35) {
			alert("Invalid wallet address!");
		}




		document.getElementById("ajaxCallApplication").url = "http://dapp.gpu360.com:8082/application";
		document.getElementById("ajaxCallApplication").params = {

			// "walletAddress": this.$.inputAddress.value
			"walletAddress": document.getElementById("inputAddress")

		}; alert("OK"+document.getElementById("ajaxCallApplication").url);
		document.getElementById("ajaxCallApplication").generateRequest();

	});

	/*
	 if (this.$.inputAddress.value.length != 35) {
              alert("Invalid wallet address!");
            }


            this.$.ajaxCallApplication.url = "http://dapp.gpu360.com:8082/application";
            this.$.ajaxCallApplication.params = {
              "walletAddress": this.$.inputAddress.value
            };
            this.$.ajaxCallApplication.generateRequest();
	
	
	
	
	
	
	
	
	//第一次领取
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
	}); */


	$("#ups").click(function () {
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