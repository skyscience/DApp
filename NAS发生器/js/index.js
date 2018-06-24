var dappAddress = "n1noUUpcEtYRcjET2iVjNktabBwsQKopZ4b";
var url_list = [];
var count = 0;
var zz_list = [];
var tempStr = '';
var lqc = '';

$(function () {
	var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
	var nebpay = new NebPay();
	



	//赞助列表
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

				
				for (var i = 0; i < res.length; i++) {
					
					tempStr += '<div class="col-md-3 text-center">';
					if (i % 2 == 0) { //0 2 4 6 8
						tempStr += '<span class="icons c3"><i class="fa fa-trophy"></i></span>';
					} else { //1 3 4 5 6
						tempStr += '<span class="icons c4"><i class="fa fa-picture-o"></i></span>';
					}
					
					tempStr += '<div class="box-area"><h3>';
					tempStr += res[i].title;
					tempStr += '</h3><p>';
					tempStr += res[i].info + '<br>';
					tempStr += '<small><cite>' + 'ID:' + res[i].author.substr(3, 6) + '</cite></small>';
					tempStr += '</p>';
					tempStr += '<input id="ck' + i + '" class="ck" onclick="ck(' + i + ')" value="查看" />';
					url_list.push(res[i].http);   
					tempStr += '</div></div> ';
				}
				

				$("#searchresult").html(tempStr);
			}
		});
	});






	//快速领取
	$("#up").click(function () {
		var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
		var nebpay = new NebPay();
		var address = $("#address").val(); //地址
		address = address.replace(/\n/g, "<br>");
		nebpay.call(dappAddress, "0", "receive_1", "[\"" + "\"]", {
			listener: function Push(resp) {
				// console.log("response of push: " + JSON.stringify(resp))
				var respString = JSON.stringify(resp);
				if (respString.search("rejected by user") !== -1) {
					alert("关闭交易,取消")
				} else if (respString.search("txhash") !== -1) {
					alert("上传Hash: " + resp.txhash + "请等待交易确认")
				}
			}
		})
	});




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
				// console.log("response of push: " + JSON.stringify(resp))
				var respString = JSON.stringify(resp);
				if (respString.search("rejected by user") !== -1) {
					alert("关闭交易,取消")
				} else if (respString.search("txhash") !== -1) {
					alert("上传Hash: " + resp.txhash + "请等待交易确认")
				}
			}
		})
	});



	//发布赞助
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
				// console.log("response of push: " + JSON.stringify(resp))
				var respString = JSON.stringify(resp);
				if (respString.search("rejected by user") !== -1) {
					alert("关闭交易,取消上传")
				} else if (respString.search("txhash") !== -1) {
					alert("上传Hash: " + resp.txhash + "请等待交易确认,如果上传失败请检查内容是否含有特殊字符")
				}
			}
		});
	});
});


//=====================我是一条华丽的分割线===================



//查看赞助 领取nas
function ck( i ){
	
	window.open(url_list[i]);

	if (count == 9){
		alert('抱歉，您已达到今天的领取上限');
		return;
	}
	for(var j = 0; j < zz_list.length; j++){
		if(zz_list[j] == i){
			alert('抱歉，您已经领取过这个赞助商的nas了，试试其它的吧~');
			return;
		}
	}

	count += 1;  //增加领取次数
	var cs = document.getElementById('lqcs');
	cs.value='已领取 '+ count +' / 10 次';
	
	zz_list.push(i);  //将领取过的赞助序号 放进数组方便判重


	var Obtn = document.getElementById('ck'+i+'');
	Obtn.value='已领取';
	Obtn.className = 'ck1';
	

	var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
	var nebpay = new NebPay();
	var address = $("#address").val(); //地址
	address = address.replace(/\n/g, "<br>");
	nebpay.call(dappAddress, "0", "receive_1", "[\"" + "\"]", {
		listener: function Push(resp) {
			// console.log("response of push: " + JSON.stringify(resp))
			var respString = JSON.stringify(resp);
			if (respString.search("rejected by user") !== -1) {
				alert("关闭交易,取消")
			} else if (respString.search("txhash") !== -1) {
				alert("上传Hash: " + resp.txhash + "请等待交易确认")
			}
		}
	})
	console.log('领取次数:  '+count);
	console.log('领取赞助列表:  '+zz_list);
}


//转换时间戳
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