var dappAddress = "n1o2rHoUHnAVBGSvd73zzwZxesyRi7Nr21Q";
$(function () {
	var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
	var nebpay = new NebPay();


});




//==========================================================
//获取用户信息
function user_info() {
	var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
	var nebpay = new NebPay();


	var local = $("#local").val();
	if (local == "") {
		alert("请输入钱包地址。");
		return;
	}
	local = local.replace(/\n/g, "<br>");


	var to = dappAddress;
	var value = "0";
	var callFunction = "user_info";
	var callArgs = '["' + local + '"]';


	nebpay.simulateCall(to, value, callFunction, callArgs, {
		listener: function (resp) {
			if (resp.result == "") {
				alert("暂无用户信息");
				return;
			}
			var res = JSON.parse(resp.result);
			if (res.length == 0) {
				alert("暂无用户信息");
				return;
			}
			
			
			var tempStr = "";
			var photoStr = "";
			var contactStr = "";

			tempStr += '<h5>'+res.user+'</h5>';  //用户名
			tempStr += '<p>'+res.content+'</p>'; //简介
			photoStr += '<div class="photo1" style="background:url('+res.img+') #fff no-repeat center / cover;"></div>' //图片
			
			contactStr += '<a class="link fb" href="'+res.fb+'" target="_blank"><i class="fa fa-facebook"></i></a>';
			contactStr += '<a class="link tw" href="'+res.tw+'" target="_blank"><i class="fa fa-twitter"></i></a>';
			contactStr += '<a class="link cp" href="'+res.gh+'" target="_blank"><i class="fa fa-codepen"></i></a>';
			contactStr += '<a class="link pi" href="'+res.si+'" target="_blank"><i class="fa fa-weibo"></i></a>';
			contactStr += '<a class="link li" href="'+res.wc+'" target="_blank"><i class="fa fa-weixin"></i></a>';
			contactStr += '<a class="link yt" href="'+res.qq+'" target="_blank"><i class="fa fa-qq"></i></a>';
			contactStr += '<a class="link gp" href="'+res.gg+'" target="_blank"> <i class="fa fa-google-plus"></i> </a>';

			$("#user_info").html(tempStr);
			$("#img").html(photoStr);
			$("#contact").html(contactStr);
		}
	});
}




//查找用户信息
function search_info(local) {
	var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
	var nebpay = new NebPay();
	
	if (local == "") {
		alert("请输入钱包地址。");
		return;
	}
	local = local.replace(/\n/g, "<br>");


	var to = dappAddress;
	var value = "0";
	var callFunction = "user_info";
	var callArgs = '["' + local + '"]';


	nebpay.simulateCall(to, value, callFunction, callArgs, {
		listener: function (resp) {
			if (resp.result == "") {
				alert("暂无用户信息");
				return;
			}
			var res = JSON.parse(resp.result);
			if (res.length == 0) {
				alert("暂无用户信息");
				return;
			}
			
			
			var tempStr = "";
			var photoStr = "";
			var contactStr = "";

			tempStr += '<h5>'+res.user+'</h5>';  //用户名
			tempStr += '<p>'+res.content+'</p>'; //简介
			photoStr += '<div class="photo1" style="background:url('+res.img+') #fff no-repeat center / cover;"></div>' //图片
			
			contactStr += '<a class="link fb" href="'+res.fb+'" target="_blank"><i class="fa fa-facebook"></i></a>';
			contactStr += '<a class="link tw" href="'+res.tw+'" target="_blank"><i class="fa fa-twitter"></i></a>';
			contactStr += '<a class="link cp" href="'+res.gh+'" target="_blank"><i class="fa fa-codepen"></i></a>';
			contactStr += '<a class="link pi" href="'+res.si+'" target="_blank"><i class="fa fa-weibo"></i></a>';
			contactStr += '<a class="link li" href="'+res.wc+'" target="_blank"><i class="fa fa-weixin"></i></a>';
			contactStr += '<a class="link yt" href="'+res.qq+'" target="_blank"><i class="fa fa-qq"></i></a>';
			contactStr += '<a class="link gp" href="'+res.gg+'" target="_blank"> <i class="fa fa-google-plus"></i> </a>';

			$("#user_info").html(tempStr);
			$("#img").html(photoStr);
			$("#contact").html(contactStr);
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
	
	if ((day+hour+min) <= 0){
		alert("请输入拍卖时长。");
		return;
	}
	if (isNaN(day+hour+min)){
		alert("请在拍卖时长中 输入数字。");
		return;
	}
	if((day+hour+min) >= 602359){
		alert("输入的值不得超过 60天 23小时 59分。");
		return;
	}
	

	var days = day*24*60*60;
	var hours = hour*60*60;
	var mins = min*60; 
	var time = days+hours+mins;


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
				var count = res[i].info.search(search,'i');
				var pdpm = '';
				if (!count) {
					j.push(i);
				}
			}


			if (j.length !== 0) {
				for (var z = 0; z < j.length; z++) {
					var c = j[z];
					if (time > res[c].end) {
						pdpm += '<button class="button2" class="btn btn-primary" id="conbidbutton" onclick="alert("拍卖已截至");">拍卖已截至</button><br><br>';
						pdpm += '<button class="button3" class="btn btn-primary" id="conbidbutton" onclick="conbid(' + i + ');">确认完成拍卖</button>';
					}
					else {
						pdpm = '<button type="button1" class="button1" id="savebidbutton" onclick="bidinfo(' + i + ');">参与拍卖</button>';
					}


					cj = res[c].cjvalue / (10e17);
					if (i % 2 == 0) {  //0 2 4 6 8
						tempStr += '<div class="panel-body"> ';
					} else {		//1 3 4 5 6
						tempStr += '<div class="panel-footer">';
					}


					tempStr += '<p>';
					tempStr += res[c].index + " 内容:" + res[c].info;
					tempStr += '</p>';
					tempStr += '<p>';
					tempStr += '<small><cite>' + '昵称:' + res[c].author + '</cite></small>';
					tempStr += '<br>';
					tempStr += '<small><cite>' + '地址:' + res[c].author + '</cite></small>';
					tempStr += '<br>';
					tempStr += '<small><cite>' + '发起时间:' + ttt(res[c].createdDate) + '</cite></small>';
					tempStr += '<br>';
					tempStr += '<small><cite>' + '终止时间:' + ttt(res[c].end) + '</cite></small>';
					tempStr += '<br>';
					tempStr += '<small><cite>' + '目前出价:' + cj + '</cite></small> <br>';
					tempStr += pdpm;
					tempStr += '</p> </div><hr> ';
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