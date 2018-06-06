var dappAddress = "n1taXDgGiiQh6hyptg2aCXYRHwa7X6EX8Za";
$(function () {
	var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
	var nebpay = new NebPay();



	//列表
	$("#allstars").click(function () {
		var to = dappAddress;
		var value = "0";
		var callFunction = "getlist";
		var callArgs = "[]";

		nebpay.simulateCall(to, value, callFunction, callArgs, {
			listener: function (resp) {
				if (resp.result == "") {
					$("#searchresult").html('<div class="panel-body" >暂无记录</div>');
					return;
				}
				var res = JSON.parse(resp.result);
				if (res.length == 0) {
					$("#searchresult").html('<div class="panel-body">暂无记录</div>');
					return;
				}

				var tempStr = "";

				for (var i = 0; i < res.length; i++) {
					cj = res[i].cjvalue / (10e17);
					if (i % 2 == 0) {  //0 2 4 6 8
						tempStr += '<div class="panel-body"> ';
					} else {		//1 3 4 5 6
						tempStr += '<div class="panel-footer">';
					}


					tempStr += '<p>';
					tempStr += res[i].index + " 内容:" + res[i].info;
					tempStr += '</p>';
					tempStr += '<p>';
					tempStr += '<small><cite>' + '记录地址:' + res[i].author + '</cite></small>';
					tempStr += '<br>';
					tempStr += '<small><cite>' + '记录时间:' + ttt(res[i].createdDate) + '</cite></small>';
					tempStr += '<br>';
					tempStr += '<small><cite>' + '终止:' + ttt(res[i].end) + '</cite></small>';
					tempStr += '<br>';
					tempStr += '<small><cite>' + '目前出价:' + cj + '</cite></small> &nbsp;&nbsp;';
					tempStr += '<button type="button" class="btn btn-primary" id="savebutton" onclick="confirm('+i+');">参与拍卖</button>';
					tempStr += '</p> </div> ';
				}
				$("#searchresult").html(tempStr);
			}
		});
	});

	//发起拍卖
	$("#create").click(function () {
		$("#detailTitle").text("发起拍卖")

		var tempStr = '';
		tempStr += '<div class="panel-body"> ';
		tempStr += '<form role="form">';
		tempStr += '<div class="form-group">';
		tempStr += '<p>发起拍卖 保证金至少0.000002</p>';
		tempStr += '<p>持续时间秒数</p>';
		tempStr += '<textarea class="form-control" rows="1" id="name" >60</textarea>';
		tempStr += '<p>Info 详细内容</p>';
		tempStr += '<textarea class="form-control" rows="10" id="content" >将我替换详细描述</textarea>';
		tempStr += '<button type="button" class="btn btn-primary" id="savebutton" onclick="save();">发起拍卖</button>';
		tempStr += '</div>';
		tempStr += '</form>';
		tempStr += '</div> ';
		$("#searchresult").html(tempStr);
	});








	//===============================================
	function confirm(i) { //序号 
		alert("== OK =="+i);
		$("#detailTitle").text("竞拍出价");
	
		var to = dappAddress;
		var value = "0";
		var callFunction = "getlist";
		var callArgs = "[]";

		nebpay.simulateCall(to, value, callFunction, callArgs, {
			listener: function (resp) {
				if (resp.result == "") {
					$("#searchresult").html('<div class="panel-body" >暂无记录</div>');
					return;
				}
				var res = JSON.parse(resp.result);
				if (res.length == 0) {
					$("#searchresult").html('<div class="panel-body">暂无记录</div>');
					return;
				}

				var cj = res[i].cjvalue / (10e17);


				var tempStr = '';
				tempStr += '<div class="panel-body"> ';
				tempStr += '<form role="form">';
				tempStr += '<div class="form-group">';
				tempStr += '<p>商品序号</p>' + '[' + i + ']';
				tempStr += '<p>商品信息</p>' + res[i].info;
				tempStr += '<p>上架时间</p>' + ttt(res[i].createdDate);
				tempStr += '<p>终止时间</p>' + ttt(res[i].end);
				tempStr += '<p>卖家地址</p>' + res[i].author;
				tempStr += '<p>目前出价</p>' + cj;
				tempStr += '<p>出价 (加价至少0.001)</p>';
				tempStr += '<textarea class="form-control" rows="1" id="nidsmon" >0.001</textarea>';
				tempStr += '<button type="button" class="btn btn-primary" id="savebidbutton" onclick="savebid();">参与拍卖</button>';
				tempStr += '</div>';
				tempStr += '</form>';
				tempStr += '</div> ';

				$("#searchresult").html(tempStr);
			}
		});
	};


	function savebid() {
		var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
		var nebpay = new NebPay();

		var nids = $("#nids").val();   //序号
		var nidsmon = $("#nidsmon").val(); //价格
		if (nids == "") {
			alert("请输入序号。");
			return;
		}
		if (nidsmon == "") {
			alert("请输入出价");
			return;
		}

		nids = nids.replace(/\n/g, "<br>");
		nidsmon = nidsmon.replace(/\n/g, "<br>");
		nebpay.call(dappAddress, "" + nidsmon, "bid", "[\"" + nids + "\"]", {
			listener: function Push(resp) {
				console.log("response of push: " + JSON.stringify(resp))
				var respString = JSON.stringify(resp);
				if (respString.search("rejected by user") !== -1) {
					alert("关闭交易,取消出价")
				} else if (respString.search("txhash") !== -1) {
					alert("上传Hash: " + resp.txhash + "请等待交易确认,如果上传失败请检查内容是否含有特殊字符")
				}
			}
		})
	};



	function save() {
		var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
		var nebpay = new NebPay();
		var content = $("#content").val();
		var name = $("#name").val();
		if (content == "") {
			alert("请输入描述。");
			return;
		}
		if (name == "") {
			alert("请输入持续时间 (秒)");
			return;
		}

		content = content.replace(/\n/g, "<br>");
		name = name.replace(/\n/g, "<br>");
		var to = dappAddress;
		var value = "0";
		var callFunction = "savenew";
		var callArgs = '["' + content + '",' + name + ']';
		nebpay.call(to, value, callFunction, callArgs, {
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
	};



	function ttt(timestamp) {
		var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
		Y = date.getFullYear() + '-';
		M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
		D = date.getDate() + ' ';
		h = date.getHours() + ':';
		m = date.getMinutes() + ':';
		s = date.getSeconds();
		return Y + M + D + h + m + s;
	}});
