"use strict";
//[ 6/17 13:54 ] 修正
//[ 测试网 ] 
//Hash:  
//合约:  n1t7CvSXrB6P9zMvoETjd26B2uUkRGyH5Z4




//创建 赞助信息类
var obj_sponsor = function (text) {
	if (text) {
		var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
		this.title = obj.title;		//标题
		this.info = obj.info;	//描述
		this.img = obj.img;		//图片URL
		this.http = obj.http;	//链接
		this.author = obj.author; // 赞助商地址
		this.index = obj.index; //序号
	} else {
		this.title = "";
		this.info = "";
		this.img = "";
		this.http = "";
		this.author = "";
		this.index = "";
	}
};


//创建 存储类
var ConstantContract = function () {
	LocalContractStorage.defineMapProperty(this, "Map_wallet"); //第一次钱包信息
	LocalContractStorage.defineMapProperty(this, "Map_wallet_1"); //40S后钱包信息
	LocalContractStorage.defineMapProperty(this, "Map_sponsor"); //赞助信息
	LocalContractStorage.defineProperty(this, "list");  //赞助列表
};




//========================我是一条华丽的分割线===============================
var obj1 = new obj_sponsor(); //赞助信息

ConstantContract.prototype = {
	init: function () {
		this.list = 0;  //初始化序号为0
	},




	//初次领取    ====
	receive: function (author) {  //物品信息，  拍卖时间秒数
		var pd = JSON.parse(this.Map_wallet.get(author)); //获取钱包绑定的值
		if (pd !== null) {
			// return 'Z: ['+pd+']';
			// throw new Error("author failed."); //已经领取过啦
			return 'Author is receive !'
		}


		var money = 0.000001 * (10e17); //F 转换单位
		var result = Blockchain.transfer(author, money);
		if (!result) {
			// throw new Error("transfer failed.");
			return 'Aransfer failed';
		}


		this.Map_wallet.put(author, JSON.stringify('ok'));   //给领取过的钱包 绑定标识
		return 'OK';
	},




	//40S后领取百倍    ====
	receive_1: function () {  //物品信息，  拍卖时间秒数
		var author = Blockchain.transaction.from; //钱包地址  当前
		var pd = JSON.parse(this.Map_wallet_1.get(author)); //获取钱包绑定的值
		if (pd !== null) {
			// return 'Z: ['+pd+']';
			throw new Error("author failed."); //已经领取过啦
		}


		var money = 0.0001 * (10e17); //F 转换单位
		var result = Blockchain.transfer(author, money);
		if (!result) {
			throw new Error("transfer failed.");
		}


		this.Map_wallet_1.put(author, JSON.stringify('ok'));   //给领取过的钱包 绑定标识
		return 'OK_1';
	},




	//发布赞助
	savenew: function (title, info, img, http) {  //名称	详情    图片    	地址
		obj1.author = Blockchain.transaction.from; //赞助商 钱包地址
		obj1.value = Blockchain.transaction.value;	 //赞助金额
		obj1.title = title;	//名称
		obj1.info = info;    //详情
		obj1.img = img; //图片
		obj1.http = http; //链接
		var key = this.list;	//列表
		obj1.index = key; 	 //序号
		this.list += 1;


		var pd = obj1.value / (10e17); //F 转换单位
		if (pd < 0.01) {
			throw new Error("NOT > 0.01 !");//未大于赞金额
		}
		this.Map_sponsor.put(key, JSON.stringify(obj1)); //保存赞助信息
	},




	//赞助商列表
	getlist: function () {
		var listArr = [];
		for (var i = 0; i < this.list; i++) {
			var temp = JSON.parse(this.Map_sponsor.get(i));
			listArr.push(temp);
		}
		return listArr;
	},




	//往合约中存钱
	savemoney: function () { 
		var value = Blockchain.transaction.value;//获取存入的钱
		return value;
	},




	//取走合约中的钱
	getmoney: function(author,money) {
		var zh_money = money / (10e17); //F 转换单位
		var result = Blockchain.transfer(author, zh_money);
		if (!result) {
			return 'Aransfer failed_1';
		}
	}
};
module.exports = ConstantContract;

