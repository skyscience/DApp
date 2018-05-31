"use strict";
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
	/*
    = 交易对象：合约地址 
    = 交易金额：保证金0.5NAS
    = 参数：/拍卖时长/拍卖内容或卖家联系方式/   
    = bidlistmap保存的每个拍卖的信息:/拍卖序号/拍卖终止时间(拍卖时长换算成秒+拍卖发起时间戳)
    /拍卖内容或卖家联系方式/拍卖发起人钱包地址/每个历史参与出价的钱包地址/与之对应的出价金额/
    = 返回值:/是否成功发起拍卖/(当金额不足保证金时返回失败)若成功的话则保存进 bidlistmap,并且把拍卖序号的那个变量i++
	*/
	savenew: function(info,time,bzz) {  //截至时间  物品信息
		info = info.trim();
		if (info === "") {
			throw new Error("Empty");
		}

		var obj = new Object(); //实例化默认obj
		var key = this.list; //序号
        obj.index = key;  
		obj.info = info;    //内容
		obj.author = Blockchain.transaction.from; //作者 钱包地址
		obj.createdDate = Blockchain.transaction.timestamp;  //创建日期
		obj.end = Blockchain.transaction.timestamp + time; //终止时间戳
		obj.value = Blockchain.transaction.value; //获取存入智能合约代币数量
		if (value < bzz) {
			throw new Error("ERROR!");//未大于保证金
		}
		this.list += 1;
		var obj1 = new Object();  //存出价
		var obj2 = new Object(); //存历史
		obj1.value = 0.001;//无人出价
		obj1.author = ''; //无人钱包地址;
		this.infoMap.set(key, JSON.stringify(obj)); //物品信息
		this.moneyMap.set(key, JSON.stringify(obj1)); //出价金额
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
	/*
	交易对象：合约地址 
    交易金额：X(x＞竞价项目中已经有人出的最高价）
    参数：/拍卖发起人钱包地址/
    返回值:/是否成功参与拍卖/(当出价等于或低于目前最高价时失败,当出价=0时失败,
    当'当前时间'戳已经大于项目终止时间戳时失败)
    若成功:
        在bidlistmap中对应的 '拍卖发起人钱包地址' 里
        添加一行(/每个历史参与出价的钱包地址/与之对应的出价金额/)按时间顺序添加,排第一行的永远是最新的,出价最高的
    若失败:
        检查转账金额是否为0,不为零的话则转账给我们的团队账户(笑)
	*/
	bid: function(key1) {
		obj1.value = Blockchain.transaction.value;//获取拍卖出价
		obj1.author = Blockchain.transaction.from; //拍者钱包地址;

		if(JSON.parse(this.infoMap.get(key1))="") {
			Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK',obj1.value);
			throw new Error("Error Empty!")
			return obj;
		}
		var money = JSON.parse(this.moneyMap.get(key1));//获取最高价格
		if(obj1.value < money.value.value) {
			Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK',obj1.value);
			throw new Error("ERROR!Your money < Biggest money");//未大于 起拍价！
		}
		if(obj1.value - money.value.value < 0.001) {
			Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK',obj1.value);
			throw new Error("ERROR!Your money - Biggest money < 0.001");//价格差过低
		}
		amount = new BigNumber(obj2.value)
		var fk = Blockchain.transfer(obj2.author,amount);
		if(!fk) {
			throw new Error("ERROR FK!")
		}
		obj2.value = obj1.value;
		obj2.author = obj1.author;
		this.moneyMap.set(key1,obj2);
	},

	//完成拍卖
	confirm: function(key2) {
		if(JSON.parse(this.infoMap.get(key2))="") {
			throw new Error("Error Empty!")
		}
		var dz = JSON.parse(this.infoMap.get(key2).author); //获取项目地址
		var time = Blockchain.transaction.timestamp; //获取创建时的时间戳
		var author = Blockchain.transaction.from; //获取买家地址
		if(dz != author) {
			throw new Error("Not Local!")
		}
		var time1 = JSON.parse(this.infoMap.get(key2).end); //获取终止的时间戳
		var count = time1 - time
		if(count > 0) {
			throw new Error("not done!")
		}
		var bzz = JSON.parse(this.infoMap.get(key2).value)

		var bidmoney = JSON.parse(this.moneyMap.get(key2))*0.99+bzz//
		var sxfmoney = JSON.parse(this.moneyMap.get(key2))*0.01
		Blockchain.transfer(dz,bidmoney);
		Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK',sxfmoney);
	}
};


module.exports = ConstantContract;