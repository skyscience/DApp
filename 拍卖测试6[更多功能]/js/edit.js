var dappAddress = "n1o2rHoUHnAVBGSvd73zzwZxesyRi7Nr21Q";
$(function () {
	var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
	var nebpay = new NebPay();


});




//==========================================================
//==========================================================




//保存 信息
function save() {
	var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
	var nebpay = new NebPay();

	var user = $("#user").val();    //名称
	var content = $("#content").val();  //简介
	var img = $("#img").val();	//图片 
	var fb = $("#fb").val();
	var tw = $("#tw").val();
	var gh = $("#gh").val();
	var si = $("#si").val();
	var wc = $("#wc").val();
	var qq = $("#qq").val();
	var gg = $("#gg").val();



	if (user == "") {
		alert("请输入物品昵称。");
		return;
	}
	if (content == "") {
		alert("请输入简介。");
		return;
	}


	user = user.replace(/\n/g, "<br>");
	content = content.replace(/\n/g, "<br>");
	img = img.replace(/\n/g, "<br>");
	fb = fb.replace(/\n/g, "<br>");
	tw = tw.replace(/\n/g, "<br>");
	gh = gh.replace(/\n/g, "<br>");
	si = si.replace(/\n/g, "<br>");
	wc = wc.replace(/\n/g, "<br>");
	qq = qq.replace(/\n/g, "<br>");
	gg = gg.replace(/\n/g, "<br>");




	var to = dappAddress;
	var value = "0";
	var callFunction = "save_user";
	var callArgs = '["' + user + '","' + content + '","' + img + '","' + fb + '","' + tw + '","' + gh + '","' + si + '","' + wc + '","' + qq + '","' + gg + '"]';
	nebpay.call(to, value, callFunction, callArgs, {
		listener: function Push(resp) {
			console.log("response of push: " + JSON.stringify(resp))
			var respString = JSON.stringify(resp);
			if (respString.search("rejected by user") !== -1) {
				alert("取消上传")
			} else if (respString.search("txhash") !== -1) {
				alert("上传Hash: " + resp.txhash + "如果上传失败请检查内容是否含有特殊字符")
			}
		}
	});
};
