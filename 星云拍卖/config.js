//6/2 0:14 修正
//0.2手续费主网TX Hash	44d07614fa94d59943097161de1aa3f1a803043e99468e5f5904ed850271a310
//Contract address	n1mgivTPnpv82JE7oXvuVaZnarqHJuTwqmB
//0.000002主网f4b8f6c721f96e51877942a23f419b3083b06b10a14dbcc6e9313068c445378e
//Contract address	n1sE95n8nz8ySQzAVCMXSLo9aBUL7858rUE
"use strict";

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



var ConstantContract = function() {
	LocalContractStorage.defineMapProperty(this, "infoMap"); //商品信息
	LocalContractStorage.defineMapProperty(this, "moneyMap"); //拍卖价格
	LocalContractStorage.defineProperty(this, "list");  //列表
};



ConstantContract.prototype = {
	init: function() {
		this.list = 0;  //初始化序号为0
    },
	//拍卖发起
	savenew: function(info,time) {  //物品信息，  拍卖时间秒数
		info = info.trim();
		if (info === "") {
			throw new Error("Is None !");
		}
		var obj = new Object(); //实例化默认obj
		var key = this.list; 
        obj.index = key; 	 //序号
		obj.info = info;    //内容
		obj.author = Blockchain.transaction.from; //卖家 钱包地址
		obj.value = Blockchain.transaction.value; //获取存入智能合约代币数量
		obj.createdDate = Blockchain.transaction.timestamp;  //创建时的 时间戳
		obj.end = obj.createdDate + time;     //终止时间戳	
		if (obj.value >= 0.000002) {
			throw new Error("NOT > BZZ !");//未大于保证金
		}
		this.list += 1;	


		
		var obj1 = new obj1Info(); //历史
		obj1.value = 0;		//初始化 出价
		obj1.author = '';	   //初始化 出价钱包地址;
		this.infoMap.put(key,JSON.stringify(obj));    //保存物品信息
		this.moneyMap.put(key,JSON.stringify(obj1)); //保存出价金额
	},
	
	


	//拍卖列表
	getlist: function() {
		var listArr = [];
		for(var i=0; i<this.list; i++){
			var temp = JSON.parse(this.infoMap.get(i));
			listArr.push(temp);
		}
		return listArr;
	},




	//拍卖竞价
	bid: function(key1) {  // 商品序号
		var obj1 = new obj1Info(); //历史 出价
		var obj2 = new obj2Info(); //当前 出价
		obj2.value = Blockchain.transaction.value;//获取拍卖出价
		obj2.author = Blockchain.transaction.from; //买家钱包地址
		

		
		if(JSON.parse(this.infoMap.get(key1))==="") {
			Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK',obj2.value); // 将拍卖出价转给我们的账户
			throw new Error("Error Empty!");  //为空
		}
		if(obj2.value < obj1.value) {   //拍卖价格 < 最高价格
			Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK',obj2.value); // 将拍卖出价转给我们的账户
			throw new Error("ERROR!Your money < Biggest money");//未大于 起拍价！
		}
		var c = obj2.value - obj1.value;
		if(c < 0.001) {
			Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK',obj2.value);// 将拍卖出价转给我们的账户
			throw new Error("ERROR!Your money - Biggest money < 0.001");//价格差过低
		}
		
		

		obj1.value = obj2.value;  //存入历史价格
		obj1.author = obj2.author; //存入历史买家
		var amount = new BigNumber(obj2.value);  //获取当前最高价
		var fk = Blockchain.transfer(obj2.author,amount); //将当前的价 退还给当前出价的买家
		if(!fk) {
			throw new Error("ERROR FK!"); //退款失败
		}
		this.moneyMap.put(key1,obj1); //将最高价格 对应到商品key
	},




	//完成拍卖
	confirm: function(key2) { //商品序号
		if(JSON.parse(this.infoMap.get(key2))==="") {
			throw new Error("Error Empty!");
		}
		

		var mjdz = JSON.parse(this.infoMap.get(key2).author); //获取卖家地址
		var author = Blockchain.transaction.from; //获取买家地址
		var nowtime = Blockchain.transaction.timestamp; //获取当前时间戳
		var endtime = JSON.parse(this.infoMap.get(key2).end); //获取终止的时间戳
		


		if(mjdz != author) {  //如果卖家地址不等于买家地址
			throw new Error("Not Local!");//地址匹配失败
		}	
		var count = endtime - nowtime;
		if(count > 0) {
			throw new Error("End Time!");//您没有拍得该此拍卖或此拍卖尚未截止
		}



		var money = JSON.parse(this.moneyMap.get(key2).value); //获取拍卖金额
		var bidmoney = money*0.99+0.000002;// 拍卖金额*(1-手续费比例)＋保证金 
		var sxfmoney = money*0.01;  //拍卖金额*手续费
		Blockchain.transfer(mjdz,bidmoney); //转给卖家
		Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK',sxfmoney); //将手续费转给 我们
	}
};




module.exports = ConstantContract;