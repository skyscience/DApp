var dappAddress = "n229VtQzM2rg6YPv6ijiaPAUkwVhVb9wrGs";
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
				var time = Math.round(new Date().getTime() / 1000).toString(); //获取当前时间戳

				for (var i = 0; i < res.length; i++) {
					var pdpm = '';
					if (time > res[i].end) {
						pdpm += '<button class="button2" class="btn btn-primary" id="conbidbutton" onclick="alert("拍卖已截至");">拍卖已截至</button><br><br>';
						pdpm += '<button class="button3" class="btn btn-primary" id="conbidbutton" onclick="conbid(' + i + ');">确认完成拍卖</button>';
					}
					else {
						pdpm = '<button type="button1" class="button1" id="savebidbutton" onclick="bidinfo(' + i + ');">参与拍卖</button>';
					}

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
					tempStr += '<small><cite>' + '目前出价:' + cj + '</cite></small> <br>';
					tempStr += pdpm;
					tempStr += '</p> </div><hr> ';
				}
				console.log(tempStr);
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

	tempStr += '<h6>物品的拍卖时长 单位: 秒</h6>';
	tempStr += '<input type="text" class="form-control" rows="1" id="name" placeholder="请输入您物品的拍卖时长">';
	tempStr += '<br><br><br><h6>物品详情</h6>';
	tempStr += '<textarea class="form-control1" rows="10" id="content" placeholder="请输入 物品名称 物品介绍 地址 联系方式 卖家称呼..."></textarea>';
	tempStr += '<br><br><br><br><button class="button1" class="btn btn-primary" id="savebutton" onclick="save();">发起拍卖</button><p color="red";>注: 发起拍卖时，系统将自动扣除您 0.00002 的保证金.</p>';
	tempStr += '</div>';
	tempStr += '</form>';
	tempStr += '</div> ';
	console.log(tempStr);
	$("#searchresult").html(tempStr);
});


	//参与竞拍  XXXX
	$("#Mystars").click(function () {
		$("#detailTitle").text("竞拍出价");
		var tempStr = '';
		tempStr += '<div class="panel-body"> ';
		tempStr += '<form role="form">';
		tempStr += '<div class="form-group">';
		tempStr += '<p>商品序号</p>';
		tempStr += '<textarea class="form-control" rows="1" id="nids" >0</textarea>';
		tempStr += '<p>出价 (加价至少0.001)</p>';
		tempStr += '<textarea class="form-control" rows="1" id="nidsmon" >0.001</textarea>';
		tempStr += '<button type="button" class="btn btn-primary" id="savebidbutton" onclick="savebid();">请点击列表中的"参与拍卖"按钮</button>';
		tempStr += '</div>';
		tempStr += '</form>';
		tempStr += '</div> ';
		console.log(tempStr);

		$("#searchresult").html(tempStr);
	});
});







//==========================================================
//物品详情
function bidinfo(i) {
    $("#detailTitle").text("竞拍出价");
	var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
	var nebpay = new NebPay();
	var to = dappAddress;
	var value = "0";
	var callFunction = "getlist";
	var callArgs = "[]";


	nebpay.simulateCall(to, value, callFunction, callArgs, {
		listener: function (resp) {
			//console.log(JSON.stringify(resp.result));
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
			cj = res[i].cjvalue / (10e17);
			if (i % 2 == 0) {  //0 2 4 6 8
				tempStr += '<div class="panel-body"> ';
			} else {		//1 3 4 5 6
				tempStr += '<div class="panel-footer">';
			}


			//商品序号
			tempStr += '<div class="xh">';
			tempStr += "商品序号：" + res[i].index  + "<br> 内容:"  + res[i].info;
			tempStr += '</div>';
			tempStr += '<hr>';


			//商品信息
			tempStr += '<div class="info">';
			tempStr += '<small><cite>' + '卖家钱包:' + res[i].author + '</cite></small>';
			tempStr += '<br>';
			tempStr += '<small><cite>' + '上架时间:' + ttt(res[i].createdDate) + '</cite></small>';
			tempStr += '<br>';
			tempStr += '<small><cite>' + '拍卖截至时间:' + ttt(res[i].end) + '</cite></small>';
			tempStr += '<br>';
			tempStr += '<small><cite>' + '目前最高出价:' + cj + '</cite></small>';
			tempStr += '</div>';
			tempStr += '<hr>';


			//出价
			tempStr += '<div class="cj">';
			tempStr += '出价 (加价至少0.001)';
			tempStr += '<br><input type="text" class="form-control" rows="1" id="nidsmon"  placeholder="0.001">';


			tempStr += '<br><button type="button" class="btn btn-primary" id="savebidbutton" onclick="savebid(' + i + ');">参与拍卖</button>';
			tempStr += '</div>';
			tempStr += '</form>';
			tempStr += '</div> ';

			$("#searchresult").html(tempStr);
		}
	});
}


//出价 函数
function savebid(i) {
	var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
	var nebpay = new NebPay();
	var nids = i.toString();   //序号
	var nidsmon = $("#nidsmon").val(); //价格
	if (nids == "") {
		alert("处理序号失败...");
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


//保存 商品
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
	var value = "0.00002000001";//保证金
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

//确认按钮
function conbid(i) {
	var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
	var nebpay = new NebPay();
	var ids = i.toString();   //序号
	if (ids == "") {
		alert("处理序号失败...");
		return;
	}
	ids = ids.replace(/\n/g, "<br>");
	nebpay.call(dappAddress, "0", "confirm", "[\"" + ids + "\"]", {
		listener: function Push(resp) {
			console.log("response of push: " + JSON.stringify(resp))
			var respString = JSON.stringify(resp);
			if (respString.search("rejected by user") !== -1) {
				alert("关闭交易,取消确认")
			} else if (respString.search("txhash") !== -1) {
				alert("上传Hash: " + resp.txhash + "请等待交易确认")
			}
		}
	})
};
//转换 时间戳
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