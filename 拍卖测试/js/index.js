var dappAddress = "n1sE95n8nz8ySQzAVCMXSLo9aBUL7858rUE";
$(function() {
	
	
		var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
		var nebpay = new NebPay();
	$("#allstars").click(function() {
		$("#detailTitle").text("全部拍卖");

		var to = dappAddress;
		var value = "0";
		var callFunction = "getlist";
		var callArgs = "[]";
		nebpay.simulateCall(to, value, callFunction, callArgs, {
			listener: function(resp) {
				//console.log(JSON.stringify(resp.result));
				if(resp.result == ""){
					$("#searchresult").html('<div class="panel-body" >暂无记录</div>');
					return;
				}
				var res = JSON.parse(resp.result);
				if(res.length == 0){
					$("#searchresult").html('<div class="panel-body">暂无记录</div>');
					return;
				}

				var tempStr = "";

				for (var i = 0; i < res.length; i++) {
					if (i % 2 == 0) {
						tempStr += '<div class="panel-body"> ';
					} else {
						tempStr += '<div class="panel-footer">';
					}

					//					
					tempStr += '<p>';
					tempStr += res[i].index + " 内容:" + res[i].info;
					tempStr += '</p>';
					tempStr += '<p>';
					tempStr += '<small><cite>' + '记录地址:' + res[i].author + '</cite></small>';
					tempStr += '<br>';
					tempStr += '<small><cite>' + '记录时间:' + res[i].createdDate + '</cite></small>';
					tempStr += '<br>';
					tempStr += '<small><cite>' + '终止:' + res[i].end + '</cite></small>';
					tempStr += '</p> </div> ';
				}
				console.log(tempStr);
				$("#searchresult").html(tempStr);
			}
		});

	});
	$("#allstars").click();

	$("#Mystars").click(function() {
		$("#detailTitle").text("竞拍出价");

		var tempStr = '';
		tempStr += '<div class="panel-body"> ';
		tempStr += '<form role="form">';
		tempStr += '<div class="form-group">';
		tempStr += '<p>参与拍卖 加价至少0.001</p>';
		tempStr += '<p>商品序号</p>';
		tempStr += '<textarea class="form-control" rows="1" id="nids" >0</textarea>';
		tempStr += '<button type="button" class="btn btn-primary" id="savebid" onclick="savebid();">参与拍卖</button>';		
		tempStr += '</div>';
		tempStr += '</form>';
		tempStr += '</div> ';
		console.log(tempStr);

		$("#searchresult").html(tempStr);
	});



	$("#create").click(function() {
		$("#detailTitle").text("发起拍卖")

		var tempStr = '';
		tempStr += '<div class="panel-body"> ';
		tempStr += '<form role="form">';
		tempStr += '<div class="form-group">';
		tempStr += '<p>发起拍卖 保证金至少0.000002</p>';
		tempStr += '<p>持续时间秒数</p>';
		tempStr += '<textarea class="form-control" rows="1" id="name" >300</textarea>';
		tempStr += '<p>Info 详细内容</p>';
		tempStr += '<textarea class="form-control" rows="10" id="content" >将我替换详细描述</textarea>';
		tempStr += '<button type="button" class="btn btn-primary" id="savebutton" onclick="save();">发起拍卖</button>';		
		tempStr += '</div>';
		tempStr += '</form>';
		tempStr += '</div> ';
		console.log(tempStr);

		$("#searchresult").html(tempStr);
	});

});


function save(){
	var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
	var nebpay = new NebPay();
		var content = $("#content").val();
		var name = $("#name").val();
		if (content == "") {
			alert("请输入描述。");
			return;
		}
		if (name == "") {
			alert("请输入星名。");
			return;
		}
		
		content= content.replace(/\n/g,"<br>"); 
		name= name.replace(/\n/g,"<br>"); 
		var to = dappAddress;
		var value = "0";
		var callFunction = "savenew";
		var callArgs = '["' + content + '",' + name + ']';
		nebpay.call(to, value, callFunction, callArgs, {
			listener: function Push(resp) {
				console.log("response of push: " + JSON.stringify(resp))
				var respString = JSON.stringify(resp);
				if(respString.search("rejected by user") !== -1){
					alert("关闭交易,取消上传")
				}else if(respString.search("txhash") !== -1){
					alert("上传Hash: " + resp.txhash+"请等待交易确认,如果上传失败请检查内容是否含有特殊字符")
				}
			}
		});
	

};


function savebid(){
	var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
	var nebpay = new NebPay();
		var nids = $("#nids").val();

		if (nids == "") {
			alert("请输入描述。");
			return;
		}

		
		nids= nids.replace(/\n/g,"<br>"); 

		var to = dappAddress;
		var value = "0.001";
		var callFunction = "bid";
		var callArgs = '["' + nids + '"]';
		nebpay.call(to, value, callFunction, callArgs, {
			listener: function Push(resp) {
				console.log("response of push: " + JSON.stringify(resp))
				var respString = JSON.stringify(resp);
				if(respString.search("rejected by user") !== -1){
					alert("关闭交易,取消上传")
				}else if(respString.search("txhash") !== -1){
					alert("上传Hash: " + resp.txhash+"请等待交易确认,如果上传失败请检查内容是否含有特殊字符")
				}
			}
		});
	

};