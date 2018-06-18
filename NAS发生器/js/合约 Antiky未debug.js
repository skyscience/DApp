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
var StartContract = function () {
	LocalContractStorage.defineMapProperty(this, "Map_wallet"); //第一次钱包信息
	LocalContractStorage.defineMapProperty(this, "Map_wallet_1"); //40S后钱包信息
	LocalContractStorage.defineMapProperty(this, "Map_sponsor"); //赞助信息
	LocalContractStorage.defineProperty(this, "list");  //赞助列表
	LocalContractStorage.defineProperty(this, "save"); //赞助商下限
	LocalContractStorage.defineProperty(this, "rec1"); //初次领取金额
    LocalContractStorage.defineProperty(this, "rec2"); //二次领取金额
    LocalContractStorage.defineProperty(this, "rec2max"); //二次领取分段余额
    LocalContractStorage.defineProperty(this, "rec2per"); //二次领取分段百分比
    LocalContractStorage.defineProperty(this, 'balance'); //合约余额
    LocalContractStorage.defineProperty(this, "owner"); //合约创建者
};

//========================我是一条华丽的分割线===============================
var obj1 = new obj_sponsor(); //赞助信息

StartContract.prototype = {
	init: function () {
		this.list = 0;  //初始化序号为0
		this.save = new BigNumber(0.005 * 1e18);
		this.rec1 = new BigNumber(0.000001 * 1e18);
		this.rec2 = new BigNumber(0.0001 * 1e18);
		this.rec2max = new BigNumber(0.5 * 1e18);
		this.rec2per = new BigNumber(0.0002);
		this.balance = new BigNumber(0);
		this.owner = Blockchain.transaction.from;
	},

	getst() {
        var state = {
            stlist: this.list,
            stsave: this.save,
            strec1: this.rec1,
            strec2: this.rec2,
            strec2max: this.rec2max,
            strec2per: this.rec2per,
            stbalance: this.balance,
            stowner: this.owner,
        };
        return state;
    },


	//初次领取    ====
	recieve1: function (author) {  //物品信息，  拍卖时间秒数
		var pd = JSON.parse(this.Map_wallet.get(author)); //获取钱包绑定的值
		if (pd !== null) {
			// return 'Z: ['+pd+']';
			// throw new Error("author failed."); //已经领取过啦
			return 'Author is rec1 !'
		}

		var result = Blockchain.transfer(author, this.rec1);
		if (!result) {
			// throw new Error("transfer failed.");
			return 'Transfer1 failed';
		}
		this.balance = new BigNumber(this.balance).sub(new BigNumber(this.rec1)); //更新余额

		this.Map_wallet.put(author, JSON.stringify('ok'));   //给领取过的钱包 绑定标识
		return 'OK1';
	},

	//40S后领取百倍    ====
	recieve2: function () {  //物品信息，  拍卖时间秒数
		var author = Blockchain.transaction.from; //钱包地址  当前
		var pd = JSON.parse(this.Map_wallet_1.get(author)); //获取钱包绑定的值
		if (pd !== null) {
			// return 'Z: ['+pd+']';
			throw new Error("author rec2."); //已经领取过啦
		}
		var money = this.rec2;//初始化领取金额
		if (this.rec2max.gt(this.balance)){//用了个.gt比大小
			money = this.balance * this.rec2per;
		}

		var result = Blockchain.transfer(author, money);
		if (!result) {
			throw new Error("Transfer2 failed.");
		}
		this.balance = new BigNumber(this.balance).sub(money); //更新余额

		this.Map_wallet_1.put(author, JSON.stringify('ok'));   //给领取过的钱包 绑定标识
		return 'OK2';
	},

	//发布赞助
	savenew: function (title, info, img, http) {  //名称 详情 图片 地址
		obj1.author = Blockchain.transaction.from; //赞助商 钱包地址
		obj1.value = Blockchain.transaction.value;	 //赞助金额
		obj1.time = Blockchain.transaction.timestamp;
		obj1.title = title;	//名称
		obj1.info = info;    //详情
		obj1.img = img; //图片
		obj1.http = http; //链接
		var key = this.list;	//列表
		obj1.index = key; 	 //序号
		this.list += 1;
		this.balance = new BigNumber(this.balance).plus(obj1.value);

		if (obj1.value < this.save) {
			throw new Error("NOT>");//未大于赞金额
		}
		this.Map_sponsor.put(key, JSON.stringify(obj1)); //保存赞助信息
		return "成功发布广告,赞助" + obj1.value * 1e-18 + "NAS,感谢支持!";
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
	pay: function () { 
		var value = Blockchain.transaction.value;//获取存入的钱
		this.balance = new BigNumber(this.balance).plus(value);
		return "成功存入" + value * 1e-18 + "NAS,感谢支持!";
	},

    //提币
    recieve: function(value) {
        var author = Blockchain.transaction.from;
        var money = new BigNumber(value * 1e18);
        if (author == this.owner) {
            if (money.gt(this.balance)) {
                throw new Error("奖池金额仅剩" + this.balance * 1e-18 + "NAS");
            } else {
                //更新钱包
                this.balance = new BigNumber(this.balance).sub(money);
                Blockchain.transfer(author, money);
                return "成功提取" + money * 1e-18 + "NAS";
            }
        } else {
            throw new Error("您没有权限提币");
        }
	},
	 //修改赞助下限
	ceditsave(value) {
        var author = Blockchain.transaction.from;
        var save = new BigNumber(value * 1e18);
        if (author == this.owner) {
            this.save = save;
        } else {
            throw new Error("您没有权限修改");
        }
    },
	 //初次领取金额
    editrec1(value) {
        var author = Blockchain.transaction.from;
        var rec1 = new BigNumber(value * 1e18);
        if (author == this.owner) {
            this.rec1 = rec1;
        } else {
            throw new Error("您没有权限修改");
        }
    },
    //修改二次领取金额
    editrec2(value) {
        var author = Blockchain.transaction.from;
        var rec2 = new BigNumber(value * 1e18);
        if (author == this.owner) {
            this.rec2 = rec2;
        } else {
            throw new Error("您没有权限修改");
        }
    },
    //修改二次领取金额断位
    editrec2max(value) {
        var author = Blockchain.transaction.from;
        var rec2max = new BigNumber(value * 1e18);
        if (author == this.owner) {
            this.rec2max = rec2max;
        } else {
            throw new Error("您没有权限修改");
        }
    },
    //修改二次领取金额百分比
    editrec2per(value) {
        var author = Blockchain.transaction.from;
        var rec2per = new BigNumber(value);
        if (author == this.owner) {
            this.rec2per = rec2per;
        } else {
            throw new Error("您没有权限修改");
        }
    },

};
module.exports = StartContract;

