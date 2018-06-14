"use strict";
//[ 6/14 12:28 ] 修正
//[ 主网 ]  手续费: 0.00002 
//地址:  n1iyjYxP3vUgRKs5wcoky4cpeVhGeCCs121


//创建 历史价格类
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

//创建 个人信息类
var obj_user = function (text) {
	if (text) {
		var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
		this.user = obj.user; // 用户名
		this.content = obj.content; // 内容
		this.img = obj.img;
		this.fb = obj.fb;
		this.tw = obj.tw;
		this.gh = obj.gh;
		this.si = obj.si;
		this.wc = obj.wc;
		this.qq = obj.qq;
		this.gg = obj.gg;
	} else {
		this.user = "";
		this.content = "";
		this.img = "";
		this.fb = "";
		this.tw = "";
		this.gh = "";
		this.si = "";
		this.wc = "";
		this.qq = "";
		this.gg = "";
	}
};




//创建 存储类
var ConstantContract = function () {
	LocalContractStorage.defineMapProperty(this, "infoMap"); //商品信息
	LocalContractStorage.defineMapProperty(this, "moneyMap"); //拍卖价格
	LocalContractStorage.defineMapProperty(this, "userMap"); //个人信息
	LocalContractStorage.defineProperty(this, "list");  //列表
};
var obj = new Object(); //实例化默认obj
var obj1 = new obj1Info(); //历史 出价
var obj_user = new obj_user();//个人信息




ConstantContract.prototype = {
	init: function () {
		this.list = 0;  //初始化序号为0
	},




	//拍卖发起
	savenew: function (name, info, contact, local, img, time) {  //名称	详情	联系	地址	图片	时间
		info = info.trim();
		//判断物品信息是否存在
		if (info === "") {
			throw new Error("Is None !");
		}


		var key = this.list;	//列表
		this.list += 1;
		obj.index = key; 	 //序号
		obj.name = name;	//名称
		obj.info = info;    //详情
		obj.contact = contact; //联系
		obj.local = local; //地址
		obj.img = img; //图片
		obj.author = Blockchain.transaction.from; //卖家 钱包地址
		obj.value = Blockchain.transaction.value;	 //获取保证金
		obj.createdDate = Blockchain.transaction.timestamp;  //创建时的 时间戳
		obj.end = obj.createdDate + time;     //终止时间戳	


		var pd = obj.value / (10e17); //F 转换单位
		if (pd <= 0.00002) {
			throw new Error("NOT > BZZ !");//未大于保证金
		}


		obj1.value = 0.00000001;	//初始化 出价
		obj1.author = null;	   //初始化 出价钱包地址;
		obj.cjvalue = obj1.value;  //将出价 添加到物品信息
		obj.cjauthor = obj1.author;

		obj.wc_time = '';


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
		var hm = JSON.parse(this.moneyMap.get(key1)); //获取历史价格


		var mavalue = Blockchain.transaction.value;//获取买家出价   当前
		var maauthor = Blockchain.transaction.from; //买家钱包地址  当前
		var nowtime = Blockchain.transaction.timestamp;  //获取当前 时间戳 


		//判断有效时间
		if (nowtime > cj.end) {
			throw new Error("Time is End !");  //出价时间应该在拍卖有效时间内
		}
		//判断物品是否存在
		if (JSON.parse(this.infoMap.get(key1)) === "") {  //判断 竞拍的物品是否存在
			Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK', mavalue); // 将拍卖出价转给我们的账户
			throw new Error("Error Empty!");  //为空
		}
		//拍卖价格 < 最高价格
		if (mavalue <= cj.cjvalue) {
			Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK', mavalue); // 将拍卖出价转给我们的账户
			throw new Error("ERROR!Your money < Biggest money");//未大于 起拍价！
		}
		var c = mavalue - cj.cjvalue;
		//判断差价
		if (c <= 0.001) {
			Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK', mavalue);// 将拍卖出价转给我们的账户
			throw new Error("ERROR!Your money - Biggest money < 0.001");//价格差过低
		}


		//如果 后来的价格 大于先前历史出价的人 ，那么把先前出价的人的前退给他
		if (mavalue > hm.value && hm.author !== null) {
			var amount = new BigNumber(hm.value);  //获取当前最高价
			var fk = Blockchain.transfer(hm.author, amount); //将当前的价 退还给当前出价的买家
			if (!fk) {
				throw new Error("ERROR FK!"); //退款失败
			}
		}


		obj1.value = mavalue;  //存入历史价格 
		obj1.author = maauthor; //存入历史买家
		this.moneyMap.put(key1, JSON.stringify(obj1));  //保存历史价格


		obj.index = cj.index;//序号
		obj.name = cj.name; //名称
		obj.info = cj.info;//详情
		obj.contact = cj.contact;//联系
		obj.local = cj.local;//地址
		obj.img = cj.img;//图片
		obj.author = cj.author;//卖家钱包
		obj.createdDate = cj.createdDate;//创建时间
		obj.end = cj.end;//结束时间
		obj.wc_time = cj.wc_time;  //成交时间
		obj.cjvalue = mavalue;  //存入历史价格 
		obj.cjauthor = maauthor; //存入历史买家
		this.infoMap.put(key1, JSON.stringify(obj));    //保存物品信息
	},
	/*
			obj.index //序号
			obj.name;	//名称
			obj.info = //详情
			obj.contact =  //联系
			obj.local =; //地址
			obj.img = ; //图片
			obj.author = //卖家 钱包地址
			obj.value =  //获取保证金
			obj.createdDate = //创建时的 时间戳
			obj.end =  //终止时间戳	
	*/



	//完成拍卖
	confirm: function (key2) { //商品序号
		var pd = JSON.parse(this.infoMap.get(key2));  //获取商品信息
		//判断商品信息是否存在
		if (pd === "") {
			throw new Error("Error Empty!");
		}


		var mjdz = pd.author; //获取卖家地址
		var endtime = pd.end; //获取终止的时间戳
		var author = Blockchain.transaction.from; //获取买家地址
		var nowtime = Blockchain.transaction.timestamp; //获取当前时间戳


		if (mjdz === author || author !== pd.cjauthor) {  //判断 买家不能等于卖家     必须是买家而不是其它人
			throw new Error("Not Local!");//地址匹配失败
		}
		var count = endtime - nowtime;
		if (count > 0) {
			throw new Error("End Time!");//您没有拍得该此拍卖或此拍卖尚未截止
		}




		var money = pd.cjvalue;  //获取拍卖金额
		var sxfmoney = money * 0.01;  //拍卖金额*手续费
		var bidmoney = money * 0.99;// 拍卖金额*(1-手续费比例)＋保证金   




		//将手续费转给 我们 sxfmoney
		var result = Blockchain.transfer('n1JJ8FKGy1kNvna4RTuQyVRcaeV5KLgD8rK', sxfmoney);
		if (!result) {
			throw new Error("transfer failed.");
		}
	

		//转给卖家  bidmoney
		var mresult = Blockchain.transfer(mjdz, bidmoney);
		if (!mresult) {
			throw new Error("m_transfer failed.");
		}



		
		obj.index = pd.index;//序号
		obj.name = pd.name; //名称
		obj.info = pd.info;//详情
		obj.contact = pd.contact;//联系
		obj.local = pd.local;//地址
		obj.img = pd.img;//图片
		obj.author = pd.author;//卖家钱包
		obj.createdDate = pd.createdDate;//创建时间
		obj.end = pd.end;//结束时间
		obj.wc_time = nowtime;  //成交时间

		obj.cjvalue = money;  //存入历史价格 
		obj.cjauthor = mjdz; //存入历史买家
		this.infoMap.put(key2, JSON.stringify(obj));    //保存物品信息
		return nowtime;
	},







//===================   个人信息   ===========================
	//储存信息
	save_user: function (user,content,img,fb,tw,gh,si,wc,qq,gg) {  //用户名  简介  图片  


		obj_user.author = Blockchain.transaction.from; //用户 钱包地址
		obj_user.createdDate = Blockchain.transaction.timestamp;  //创建时的 时间戳
		

		obj_user.user = user;
		obj_user.content = content;
		obj_user.img = img;
		obj_user.fb = fb;
		obj_user.tw = tw;
		obj_user.gh = gh;
		obj_user.si = si;
		obj_user.wc = wc;
		obj_user.qq = qq;
		obj_user.gg = gg;
		this.userMap.put(obj_user.author, JSON.stringify(obj_user));    //保存个人信息
	},




	//获取用户信息
	user_info: function (local) {  // 钱包地址
		var user = JSON.parse(this.userMap.get(local)); //获取用户信息
		return user;
	}

};




module.exports = ConstantContract;