'use strict';
var BankVaultContract = function () { };

BankVaultContract.prototype = {
    init: function () {
        console.log('init: Blockchain.block.height = ' + Blockchain.block.height);  //获取区块高度
        console.log('init: Blockchain.transaction.from = ' + Blockchain.transaction.from); //获取交易地址
    },

    va: function (address) {  
        var result = Blockchain.verifyAddress(address); //验证参数 address 是否为一个有效的 Nebulas 地址。
        throw new Error("===================== =["+result);//返回：1 – 地址有效，0 – 地址无效
    },

    ts: function (address, value) {  //将 NAS 从合约转出到address对应的账户。
        var amount = new BigNumber(value);
        var result = Blockchain.transfer(address,amount); //0 – 转移成功，1 – 转移失败
        if(!result){
            throw new Error("===================== =["+result);
        }
    }
};

module.exports = BankVaultContract;