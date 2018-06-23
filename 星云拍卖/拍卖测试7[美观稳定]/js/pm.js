var dappAddress = "n1o2rHoUHnAVBGSvd73zzwZxesyRi7Nr21Q";
var pdmore = '';
var length = 0;


$(function () {
	var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
	var nebpay = new NebPay();


	//列表    7-44
	$("#allstars").click(function () {
		$("#detailTitle").text("拍卖列表")
		var to = dappAddress;
		var value = "0";
		var callFunction = "getlist";
		var callArgs = "[]";


		nebpay.simulateCall(to, value, callFunction, callArgs, {
			listener: function (resp) {
				var ui = document.getElementById("loading");
				var res = JSON.parse(resp.result);
				var tempStr = "";
				var time = Math.round(new Date().getTime() / 1000).toString(); //获取当前时间戳

				ui.style.display = "none";
				if (resp.result == "") {
					$("#searchresult").html('<div class="panel-body" >暂无记录</div>');
					return;
				}

				if (res.length == 0) {
					$("#searchresult").html('<div class="panel-body">暂无记录</div>');
					return;
				}
				$("#search_click").html();




				// length += 20;
				// if (length > res.length) {
				// 	length = res.length;
				// }



				// for (var i = 0; i < length; i++) {
				for (var i = 0; i < res.length; i++) {
					if(i == 7){
						i += 63;
					}



					var pdpm = '';
					if(res[i].wc_time !== ''){
						pdpm += '<button class="button3" class="btn btn-primary" id="conbidbutton" onclick="alert("拍卖已截止");">'+'已成交    时间:'+ttt(res[i].wc_time)+'</button>&nbsp;';
					}
					else if (time > res[i].end) {
						pdpm += '<button class="button2" class="btn btn-primary" id="conbidbutton" onclick="alert("拍卖已截止");">拍卖已截止</button>&nbsp;';
						pdpm += '<button class="button3" class="btn btn-primary" id="conbidbutton" onclick="conbid(' + i + ');">确认完成拍卖</button><br>';
					}
					else {
						pdpm = '<button type="button1" class="button1" id="savebidbutton" onclick="bidinfo(' + i + ');">参与拍卖</button><br>';
					}


					cj = res[i].cjvalue / (10e17);
					if (i % 2 == 0) {  //0 2 4 6 8
						tempStr += '<div class="panel-body"> ';
					} else {		//1 3 4 5 6
						tempStr += '<div class="panel-footer">';
					}


					tempStr += '<div class="list">';
					tempStr += '<h5>[' +res[i].index +']  &nbsp;&nbsp;&nbsp;'+ res[i].name + '</h5>'




					tempStr += '<h6 style="display: initial">' + res[i].local + '</h6> <img src="' + res[i].img + '" class="img_zs" alt="">'
					tempStr += '<p><br>';
					tempStr += '<small><cite>' + '钱包地址:' + res[i].author + '</cite></small>';
					tempStr += '<br>';
					tempStr += '<small><cite>' + '发起时间:' + ttt(res[i].createdDate) + '</cite></small>';
					tempStr += '<br>';
					tempStr += '<small><cite>' + '终止时间:' + ttt(res[i].end) + '</cite></small>';
					tempStr += '<br>';
					tempStr += '<small><cite>' + '目前出价:' + cj + '</cite></small> <br>';
					tempStr += pdpm;
					tempStr += '</p>  ';


					// var jg = length - i;
					// if (jg == 1 && i + 1 == length) {
					// 	pdmore = '<button type="button1" class="button4" id="more" onclick="run();">加载更多</button>';
					// }
					// if (res.length == i + 1) {
					// 	pdmore = '<h5 class="nomore">没有更多信息了... </h5>';
					// }
					// tempStr += pdmore + '</div> <br><br>';
					
		
					tempStr += '</div> <br><br>';
				}
				$("#searchresult").html(tempStr);
			}
		});
	});



	//发起拍卖
	$("#create").click(function () {
		$("#detailTitle").text("发起拍卖")
		var ui = document.getElementById("loading");
		ui.style.display = "none";
		var tempStr = '';
		tempStr += '<div class="list">';
		tempStr += '<div class="panel-body"> ';
		tempStr += '<form role="form">';
		tempStr += '<div class="form-group">'; //秒数name  详细内容content  


		tempStr += '<h6><p class="star">*</p>物品名称</h6>';
		tempStr += '<input type="text" class="form-control" rows="1" id="name" placeholder="名称">';
		tempStr += '<br><br><br><h6><p class="star">*</p>物品详情</h6>';
		tempStr += '<textarea class="form-control1" rows="10" id="content" placeholder="请输入 物品介绍 ,卖家称呼..."></textarea>';
		tempStr += '<h6><p class="star">*</p>联系方式</h6>';
		tempStr += '<input type="text" class="form-control" rows="1" id="contact" placeholder="QQ:   微信:   电话:">';
		tempStr += '<h6>地址</h6>';
		tempStr += '<input type="text" class="form-control" rows="1" id="local" placeholder="xx市 xx区 xx街道">';
		tempStr += '<h6>物品图片URL</h6>';
		tempStr += '<input type="text" class="form-control" rows="1" id="img" placeholder="http://xxxx.cn/img6901.png">';

		tempStr += '<h6><p class="star">*</p>拍卖时长 (如果不需要请留空)</h6>';
		tempStr += '<input type="text" class="time" id="day" rows="1" id="time" placeholder="1"><p>天</p>';
		tempStr += '<input type="text" class="time" id="hour" rows="1" id="time" placeholder="0"><p>小时</p>';
		tempStr += '<input type="text" class="time" id="min" rows="1" id="time" placeholder="0"><p>分钟</p>  <br><br>';

		tempStr += '<button type="button" class="button1" id="savebutton" onclick="save();">发起拍卖</button>';
		tempStr += '</div>';
		tempStr += '</form>';
		tempStr += '</div> ';
		tempStr += '</div>';
		console.log(tempStr);
		$("#searchresult").html(tempStr);
	});
});


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


			//图片
			tempStr += '<div class="list"><img src="' + res[i].img + '" class="img_zs1" alt="">';
			tempStr += '<hr>';
			//商品序号
			tempStr += '<div class="xh">';
			tempStr += "商品序号：" + res[i].index + "<br> 名称:" + res[i].name + "<br> 详情:" + res[i].info;
			tempStr += '</div>';
			tempStr += '<br><br>';


			//商品信息
			tempStr += '<div class="info">';
			tempStr += '<small><cite>' + '联系方式:' + res[i].contact + '</cite></small>';
			tempStr += '<br>';
			tempStr += '<small><cite>' + '地址:' + res[i].local + '</cite></small>';
			tempStr += '<br>';
			tempStr += '<small><cite>' + '上架时间:' + ttt(res[i].createdDate) + '</cite></small>';
			tempStr += '<br>';
			tempStr += '<small><cite>' + '拍卖截止时间:' + ttt(res[i].end) + '</cite></small>';
			tempStr += '<br>';
			tempStr += '<small><cite>' + '目前最高出价:' + cj + '</cite></small>';
			tempStr += '<small>' +'卖家钱包:' + '</small> '+'<input type="text" id="txt" style="width: 30%;height: 30px;" value="'+res[i].author+'">'  +'<input type="button" class="button5" value="卖家详情" onclick="test()"/>  ';
			tempStr += '</div>';
			tempStr += '<hr>';


			//出价
			tempStr += '<div class="cj">';
			tempStr += '出价 (加价至少0.001)';
			tempStr += '<br><input type="text" class="form-control" rows="1" id="nidsmon"  placeholder="0.001" style="width:15%;">';
			tempStr += '<button type="button" class="btn btn-primary" id="savebidbutton" onclick="savebid(' + i + ');">参与拍卖</button>';
			tempStr += '</div>';
			tempStr += '</form>';
			tempStr += '</div></div> ';
			$("#searchresult").html(tempStr);
		}
	});
}


//js传值 到user.js
function test() {
	var s = document.getElementById("txt");
	location.href = "user.html?" + "txt=" + encodeURI(s.value);
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

	var name = $("#name").val();    //名称
	var content = $("#content").val();	//内容
	var contact = $("#contact").val();	//联系
	var local = $("#local").val();		//地址
	var img = $("#img").val();		//图片
	var day = $("#day").val();		//天数
	var hour = $("#hour").val();	//小时
	var min = $("#min").val();		//分钟

	if (name == "") {
		alert("请输入物品名称。");
		return;
	}
	if (content == "") {
		alert("请输入物品描述。");
		return;
	}
	if (contact == "") {
		alert("请输入您的联系方式。");
		return;
	}

	if ((day + hour + min) <= 0) {
		alert("请输入拍卖时长。");
		return;
	}
	if (isNaN(day + hour + min)) {
		alert("请在拍卖时长中 输入数字。");
		return;
	}
	if ((day + hour + min) >= 602359) {
		alert("输入的值不得超过 60天 23小时 59分。");
		return;
	}


	var days = day * 24 * 60 * 60;
	var hours = hour * 60 * 60;
	var mins = min * 60;
	var time = days + hours + mins;


	name = name.replace(/\n/g, "<br>");
	content = content.replace(/\n/g, "<br>");
	contact = contact.replace(/\n/g, "<br>");
	local = local.replace(/\n/g, "<br>");
	img = img.replace(/\n/g, "<br>");


	var to = dappAddress;
	var value = "0.00002000001";//保证金
	var callFunction = "savenew";
	var callArgs = '["' + name + '","' + content + '","' + contact + '","' + local + '","' + img + '",' + time + ']';
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




//搜索
function search() {
	$("#detailTitle").text("拍卖列表 - 搜索");
	var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
	var nebpay = new NebPay();
	var to = dappAddress;
	var value = "0";
	var callFunction = "getlist";
	var callArgs = "[]";
	var j = [];
	var search = $("#search").val();


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
			$("#search_click").html();


			for (var i = 0; i < res.length; i++) {
				var count = res[i].name.search(search, 'i');
				var pdpm = '';
				if (!count) {
					j.push(i);
				}
			}


			if (j.length !== 0) {
				for (var z = 0; z < j.length; z++) {
					var c = j[z];
					if(res[c].wc_time !== ''){
						pdpm += '<button class="button3" class="btn btn-primary" id="conbidbutton" onclick="alert("拍卖已截止");">'+'已成交    时间:'+ttt(res[i].wc_time)+'</button>&nbsp;';
					}
					else if (time > res[c].end) {
						pdpm += '<button class="button2" class="btn btn-primary" id="conbidbutton" onclick="alert("拍卖已截止");">拍卖已截止</button>&nbsp;';
						pdpm += '<button class="button3" class="btn btn-primary" id="conbidbutton" onclick="conbid(' + z + ');">确认完成拍卖</button><br>';
					}
					else {
						pdpm = '<button type="button1" class="button1" id="savebidbutton" onclick="bidinfo(' + z + ');">参与拍卖</button><br>';
					}

					

					cj = res[c].cjvalue / (10e17);
					if (i % 2 == 0) {  //0 2 4 6 8
						tempStr += '<div class="panel-body"> ';
					} else {		//1 3 4 5 6
						tempStr += '<div class="panel-footer">';
					}


					tempStr += '<div class="list">';
					tempStr += '<h5>[' +res[c].index +']  &nbsp;&nbsp;&nbsp;'+ res[c].name + '</h5>'
					tempStr += '<h6 style="display: initial">' + res[c].local + '</h6> <img src="' + res[c].img + '" class="img_zs" alt="">'
					tempStr += '<p><br>';
					tempStr += '<small><cite>' + '钱包地址:' + res[c].author + '</cite></small>';
					tempStr += '<br>';
					tempStr += '<small><cite>' + '发起时间:' + ttt(res[c].createdDate) + '</cite></small>';
					tempStr += '<br>';
					tempStr += '<small><cite>' + '终止时间:' + ttt(res[c].end) + '</cite></small>';
					tempStr += '<br>';
					tempStr += '<small><cite>' + '目前出价:' + cj + '</cite></small> <br>';
					tempStr += pdpm;
					tempStr += '</p>  ';
					tempStr += '</div> <br><br>';


					$("#searchresult").html(tempStr);
					pdpm = '';  //清空 防止调回
				}
			}
			else {
				tempStr += '<p>未搜索到结果</p>';
				$("#searchresult").html(tempStr);
			}

		}
	});
}




//转换 时间戳10位
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