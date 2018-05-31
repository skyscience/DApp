"use strict";
//记录合约Ver 1.0 By Antiky
var ConstantContract = function() {
	LocalContractStorage.defineMapProperty(this, "infoMap");
	LocalContractStorage.defineMapProperty(this, "collectMap");
	LocalContractStorage.defineProperty(this, "long");
};

ConstantContract.prototype = {
	init: function() {
		this.long = 0;
	},
	save: function(content) {//保存并发表永久合约
		content = content.trim();

		if (content === "") {
			throw new Error("Empty Contract");
		}

		
		var key = this.long;
		var obj = new Object();
		obj.index = key;
		obj.content = content;
		obj.author = Blockchain.transaction.from;
		obj.createdDate = Blockchain.transaction.timestamp;
		
		this.infoMap.set(key, JSON.stringify(obj));
		
		this.long += 1;
	},
	
	getAll: function() {//显示永久合约
		var from = Blockchain.transaction.from;
		var myArr = [];
		for(var i=0; i<this.long; i++){
			var tempObj = JSON.parse(this.infoMap.get(i));
			myArr.push(tempObj);
		}

		return myArr;
	},
	
	addLike: function(index){//收藏永久合约
		var from = Blockchain.transaction.from;
		var tempObj = this.collectMap.get(from);
		var myArr;
		if(tempObj == null){
			myArr = [];//如果是第一次收藏永久合约
			myArr.push(index);
		}else{
			myArr = JSON.parse(tempObj);
			if(myArr.indexOf(index) < 0){//如果没有收藏过此永久合约
				myArr.push(index);
			}
		}
		
		this.collectMap.set(from, JSON.stringify(myArr));		
	},
	removeLike: function(index){//收藏永久合约
		var from = Blockchain.transaction.from;
		var tempObj = this.collectMap.get(from);
		var myArr;
		if(tempObj == null){
			throw new Error("You doesn't add this Contract in your like list.");
		}else{
			myArr = JSON.parse(tempObj);
			var i = myArr.indexOf(index);
			if(i < 0){//如果没有收藏过此篇永久合约
				throw new Error("You doesn't add this Contract in your like list.");
			}else{
				myArr.splice(i, 1);//取消收藏永久合约
			}
		}
		
		this.collectMap.set(from, JSON.stringify(myArr));		
	},
	
	getMyLike: function(){//显示收藏的永久合约
		var from = Blockchain.transaction.from;
		var tempObj = this.collectMap.get(from);
		var myArr = [];
		if(tempObj == null){//没有收藏永久合约
			return myArr;
		}else{
			var myLikeArr = JSON.parse(tempObj);
			for(var i=0; i<myLikeArr.length; i++){
				var temp = JSON.parse(this.infoMap.get(myLikeArr[i]));
				myArr.push(temp);
			}
		}

		return myArr;
	}
};

module.exports = ConstantContract;