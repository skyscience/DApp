//Hash:  
<<<<<<< HEAD
//合约地址:   n1n5s91dTLFqfnMHuERESqXAjXwYMeTPz9r
=======
//合约地址:   n1hz65bwcx5dLizyKkjvFhRfSvZwdDqHTHZ
>>>>>>> dda58d35e7a6f80e0213f8e41b623b63d9495369


"use strict";
var Info1 = function (text1) {  //定义obj1信息类
	var jx1 = JSON.parse(text1);
	this.author = jx1.author;  //出价的钱包
	this.value = jx1.value;     //出价的钱
}


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
<<<<<<< HEAD
	savenew: function(info,time) {  //物品信息，  拍卖时间秒数， 保证金
=======
	savenew: function(info,time,bzz) {  //物品信息，  拍卖时间秒数， 保证金
>>>>>>> dda58d35e7a6f80e0213f8e41b623b63d9495369
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
		obj.createdDate = new Date().getTime();
		// obj.createdDate = Blockchain.transaction.timestamp;  //创建时的 时间戳
		obj.end = obj.createdDate + time;
		// obj.end = Blockchain.transaction.timestamp + time; //终止时间戳



		
<<<<<<< HEAD
		if (obj.value >= 0.001) {
=======
		if (obj.value < bzz) {
>>>>>>> dda58d35e7a6f80e0213f8e41b623b63d9495369
			throw new Error("NOT > BZZ !");//未大于保证金
		}
		this.list += 1;	
		// var obj1 = new Object();  //存出价
		// var obj2 = new Object(); //存历史
		var obj1 = new Info1();
		obj1.value = 0.001;		//无人出价
		obj1.author = '';	   //无人钱包地址;
		this.infoMap.set(key,JSON.stringify(obj));    //保存物品信息
		this.moneyMap.set(key,JSON.moneyMap(obj1)); //保存出价金额
	},
	
	
	//拍卖列表
	/*
	交易对象：合约地址
    交易金额：0 
    返回值：按顺序排列的全部拍卖(/拍卖终止时间/拍卖内容或卖家联系方式/拍卖发起人钱包地址
    /每个历史参与出价的钱包地址/与之对应的出价金额/)
	*/
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
	bid: function(key1) {  // 卖家钱包地址
		var obj1 = new Info1();
		obj1.value = Blockchain.transaction.value;//获取拍卖出价
		obj1.author = Blockchain.transaction.from; //买家钱包地址;

		if(JSON.parse(this.infoMap.get(key1))==="") {
			Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK',obj1.value); // 将拍卖出价转给我们的账户
			throw new Error("Error Empty!");  //为空
		}
		var money = JSON.parse(this.moneyMap.get(key1));//获取最高价格
		if(obj1.value < money.value.value) {   //拍卖价格 < 最高价格
			Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK',obj1.value); // 将拍卖出价转给我们的账户
			throw new Error("ERROR!Your money < Biggest money");//未大于 起拍价！
		}
		var c = obj1.value - money.value.value;
		if(c < 0.001) {
			Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK',obj1.value);// 将拍卖出价转给我们的账户
			throw new Error("ERROR!Your money - Biggest money < 0.001");//价格差过低
		}
		
		// obj2.value = obj1.value;
		// obj2.author = obj1.author;
		var amount = new BigNumber(obj1.value);  //将当前最高价 存入历史
		var fk = Blockchain.transfer(obj1.author,amount); //将当前的价 退还给买家
		if(!fk) {
			throw new Error("ERROR FK!"); //退款失败
		}
		this.moneyMap.set(key1,obj1);
	},

	//完成拍卖
	/*
	交易对象：合约地址 
    交易金额：0  
    数据：/key2/
    网页通过钱包api发起交易

智能合约执行确认当 发指令地址=拍卖项目对应结束后拍得项目地址 并且  当前时间戳大于对应拍卖终止时间戳 时
    将 拍卖金额*(1-手续费比例)＋保证金 转给项目发起者
    将 拍卖金额*手续费 转给我们的团队账户(笑)
    返回值:成功完成拍卖
    
智能合约执行确认当 发指令地址 不等于 拍卖项目对应结束后拍得项目地址 或者 当前时间戳小于对应拍卖终止时间戳 时
    返回值:您没有拍得该此拍卖或此拍卖尚未截止
	*/
	confirm: function(key2) { //商品序号
		if(JSON.parse(this.infoMap.get(key2))==="") {
			throw new Error("Error Empty!");
		}
		var dz = JSON.parse(this.infoMap.get(key2).author); //获取卖家地址
		var author = Blockchain.transaction.from; //获取买家地址

		var time = Blockchain.transaction.timestamp; //获取当前时间戳
		var time1 = JSON.parse(this.infoMap.get(key2).end); //获取终止的时间戳
		var count = time1 - time;

		if(dz != author) {  //如果卖家地址不等于买家地址
			throw new Error("Not Local!");//地址匹配失败
		}
		
		if(count > 0) {
			throw new Error("not done!");//您没有拍得该此拍卖或此拍卖尚未截止
		}
		var bzz = JSON.parse(this.infoMap.get(key2).value); //获取物品保证金

		var bidmoney = JSON.parse(this.moneyMap.get(key2))*0.99+bzz;// 拍卖金额*(1-手续费比例)＋保证金 
		var sxfmoney = JSON.parse(this.moneyMap.get(key2))*0.01;  //拍卖金额*手续费
		Blockchain.transfer(dz,bidmoney); //转给卖家
		Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK',sxfmoney); //转给 我们
	}
};


module.exports = ConstantContract;