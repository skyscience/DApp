"use strict";
//main 3a3acc9cd3f5a4a4c3e1bda6548313cd077efa4a9b2f200f244dffa664857869
//test bae169b873550cac59b7761d524b6c1bfd0d1c94cade5c7eeb2d3a522b548f0a
var config = {
		chainId:1,
		apiPrefix:"https://mainnet.nebulas.io",//https://testnet.nebulas.io  https://mainnet.nebulas.io
		contractAddr:"n1zsohpv63CnmUs7aeVBfgeQBozpK5bmTMk",//main n1zsohpv63CnmUs7aeVBfgeQBozpK5bmTMk test n1rdTjdiFbCvuR8u6p355Fzqn2xw3za1eAE
		gaslimit : 2000000,
		gasprice : 1000000,
		account:"account",
		balanceOf:"balanceOf",
		takeout:"takeout",
		share:"share",
		editShare:"editShare",
		resetShareStatus:"resetShareStatus",
		reply:"reply",
		reward:"reward",
		getShareList:"getShareList",
		getSelfShareList:"getSelfShareList",
		search:"search",
		checkTxhash:"https://explorer.nebulas.io/#/tx/"
};
var nebulas = require("nebulas"),
neb = new nebulas.Neb(),
api = neb.api,
nonce = 0;
neb.setRequest(new nebulas.HttpRequest(config.apiPrefix));
var NebPay = require("nebpay");
var nebPay = new NebPay();    
var serialNumber;
var defaultOptions = {
		goods: {        //Dapp端对当前交易商品的描述信息，app暂时不展示
			name: "",       //商品名称
			desc: "",       //描述信息
			orderId: "",    //订单ID
			ext: ""         //扩展字段
		},
		qrcode: {
			showQRCode: false,      //是否显示二维码信息
			container: undefined    //指定显示二维码的canvas容器，不指定则生成一个默认canvas
		},
		// callback 是记录交易返回信息的交易查询服务器地址，不指定则使用默认地址
		callback: undefined,
		// listener: 指定一个listener函数来处理交易返回信息（仅用于浏览器插件，App钱包不支持listener）
		listener: undefined,
		// if use nrc20pay ,should input nrc20 params like name, address, symbol, decimals
		nrc20: undefined
};
function query(curWallet,method,args,callback){
	if(typeof method != "undefined"){ 
		try{
			neb.setRequest(new nebulas.HttpRequest(config.apiPrefix));
			neb.api.getAccountState(curWallet).then(function (resp) {
				nonce = parseInt(resp.nonce || 0) + 1;
				neb.api.call({
					from: curWallet,
					to: config.contractAddr,
					value: 0,
					nonce: nonce,
					gasPrice: config.gasprice,
					gasLimit: config.gaslimit,
					contract: {
						"function": method,
						"args": args
					}
				}).then(function (resp) {
					callback(resp);
				}).catch(function (err) {
					callback(err);
					console.log(err);
				});
			}).catch(function (e) {
				callback(e);
				console.log(e);
			});
		}catch(e){
			callback(e);
		}
	}
}
Date.prototype.toLocaleString = function() {
    return this.getFullYear() + "/" + (this.getMonth() + 1) + "/" + this.getDate() + " " + this.getHours() + ":" + this.getMinutes();
};
function tips(text,isok){
	var modal = $('#modal1');
	$('#modal1').modal('show');
	modal.find('.modal-title').text('提示');
	if(isok){
		modal.find('.modal-body').html('<div class="alert alert-success" role="alert">'+text+'</div>');
	}else{
		modal.find('.modal-body').html('<div class="alert alert-warning" role="alert">'+text+'</div>');
	}
	setTimeout(function(){$('#modal1').modal('hide');},10000);
}
function randomColor(){
	var red = parseInt(Math.random()*257).toString(16);
	var blue = parseInt(Math.random()*257).toString(16);
	var green= parseInt(Math.random()*257).toString(16);
	var color = red+blue+green;
	return color;
}
function calcReward(profits){
	var count = new BigNumber(0);
	$.each(profits,function(key,item){
		count = count.plus(new BigNumber(item.value));
	});
	return count;
}