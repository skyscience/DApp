"use strict";
//[ 6/6 22:22 ] 修正
//[ 测试网 ]  手续费: 0.00002 
//Hash:  
//合约:  n1mH3tZzXq3yq7PMBQU46tFU8hjvHYppZh9


//创建 加价信息类
var obj1Info = function (text) {
	if (text) {
		var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
		this.value = obj.value; // 历史拍卖出价
		this.author = obj.author; // 历史拍卖出价的作者
	} else {
		this.value = "";
		this.author = "";
	}
};
var obj2Info = function (text) {
	if (text) {
		var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
		this.value = obj.value; // 当前拍卖出价
		this.author = obj.author; // 当前拍卖的作者
	} else {
		this.value = "";
		this.author = "";
	}
};
//创建 存储类
var ConstantContract = function () {
	LocalContractStorage.defineMapProperty(this, "infoMap"); //商品信息
	LocalContractStorage.defineMapProperty(this, "moneyMap"); //拍卖价格
	LocalContractStorage.defineProperty(this, "list");  //列表
};
var obj = new Object(); //实例化默认obj
var obj1 = new obj1Info(); //历史 出价
var obj2 = new obj2Info(); //当前 出价




ConstantContract.prototype = {
	init: function () {
		this.list = 0;  //初始化序号为0
	},




	//拍卖发起
	savenew: function (info, time) {  //物品信息，  拍卖时间秒数
		info = info.trim();
		if (info === "") {
			throw new Error("Is None !");
		}
		var key = this.list;
		obj.index = key; 	 //序号
		obj.info = info;    //内容
		obj.author = Blockchain.transaction.from; //卖家 钱包地址
		obj.value = Blockchain.transaction.value; //获取存入智能合约代币数量
		obj.createdDate = Blockchain.transaction.timestamp;  //创建时的 时间戳
		obj.end = obj.createdDate + time;     //终止时间戳	


		var pd = obj.value / (10e17); //F 转换单位
		if (pd <= 0.00002) {
			throw new Error("NOT > BZZ !");//未大于保证金
		}


		var result = Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK', obj.value); // 将拍保证金转给我们的账户
		if (!result) {
			throw new Error("transfer failed.");
		}

		this.list += 1;
		obj1.value = 0.00000001;	//初始化 出价
		obj1.author = '';	   //初始化 出价钱包地址;
		obj.cjvalue = obj1.value;
		obj.cjauthor = obj1.author;
		this.moneyMap.put(key, JSON.stringify(obj1)); //保存出价金额
		this.infoMap.put(key, JSON.stringify(obj));    //保存物品信息
	},




	//拍卖列表
	getlist: function () {
		var listArr = [];
		for (var i = 0; i < this.list; i++) {
			var temp = JSON.parse(this.infoMap.get(i));
			listArr.push(temp);
		}
		return listArr;
	},




	//拍卖竞价
	bid: function (key1) {  // 商品序号		
		var cj = JSON.parse(this.infoMap.get(key1)); //获取物品信息
		var nowtime = Blockchain.transaction.timestamp;  //获取当前 时间戳
		obj2.value = Blockchain.transaction.value;//获取买家出价
		obj2.author = Blockchain.transaction.from; //买家钱包地址
		if (nowtime > cj.end) {
			throw new Error("Time is End !");  //出价时间应该在拍卖有效时间内
		}
		if (JSON.parse(this.infoMap.get(key1)) === "") {  //判断 竞拍的物品是否存在
			Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK', obj2.value); // 将拍卖出价转给我们的账户
			throw new Error("Error Empty!");  //为空
		}



		if (obj2.value <= cj.cjvalue) {   //拍卖价格 < 最高价格
			Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK', obj2.value); // 将拍卖出价转给我们的账户
			throw new Error("ERROR!Your money < Biggest money");//未大于 起拍价！
		}
		var c = obj2.value - cj.cjvalue;
		if (c <= 0.001) {
			Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK', obj2.value);// 将拍卖出价转给我们的账户
			throw new Error("ERROR!Your money - Biggest money < 0.001");//价格差过低
		}




		obj1.value = obj2.value;  //存入历史价格 
		obj1.author = obj2.author; //存入历史买家
		var amount = new BigNumber(obj2.value);  //获取当前最高价
		var fk = Blockchain.transfer(obj2.author, amount); //将当前的价 退还给当前出价的买家
		if (!fk) {
			throw new Error("ERROR FK!"); //退款失败
		}
		this.moneyMap.put(key1, obj1); //将最高价格 对应到商品key



		obj.value = cj.value;
		obj.index = cj.index;
		obj.info = cj.info;
		obj.author = cj.author;
		obj.createdDate = cj.createdDate;
		obj.end = cj.end;
		obj.cjvalue = obj1.value;  //最高价存到 obj的当前价格中
		obj.cjauthor = obj1.author;
		this.infoMap.put(key1, JSON.stringify(obj));    //保存物品信息
	},




	//完成拍卖
	confirm: function (key2) { //商品序号
		var pd = JSON.parse(this.infoMap.get(key2));  //获取商品信息
		if (pd === "") {
			throw new Error("Error Empty!");
		}


		var mjdz = pd.author; //获取卖家地址
		var endtime = pd.end; //获取终止的时间戳
		var author = Blockchain.transaction.from; //获取买家地址
		var nowtime = Blockchain.transaction.timestamp; //获取当前时间戳


		if (mjdz != author) {  //如果卖家地址不等于买家地址
			throw new Error("Not Local!");//地址匹配失败
		}
		var count = endtime - nowtime;
		if (count > 0) {
			throw new Error("End Time!");//您没有拍得该此拍卖或此拍卖尚未截止
		}

		var bzj = pd.value;  //保证金
		var money = pd.cjvalue;  //获取拍卖金额
		var bidmoney = money * 0.99 + bzj;// 拍卖金额*(1-手续费比例)＋保证金 
		var sxfmoney = money * 0.01;  //拍卖金额*手续费


		var result = Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK', sxfmoney); //将手续费转给 我们 sxfmoney
		if (!result) {
			throw new Error("transfer failed.");
		}

		var mresult =  Blockchain.transfer(mjdz, bidmoney); //转给卖家  bidmoney
		if (!mresult) {
			throw new Error("m_transfer failed.");
		}
		return nowtime;
	}
};
module.exports = ConstantContract;