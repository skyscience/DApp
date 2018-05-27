"use strict";
var commonClass=new CommonClass();
var dappContactAddress = commonClass.GetAddress;
var nebulas = require("nebulas"), Account = Account, neb = new nebulas.Neb();
neb.setRequest(new nebulas.HttpRequest(commonClass.GetNetName));
var NebPay = require("nebpay");
var nebPay = new NebPay();
var serialNumber;
var AllCount=0;//总数量

//初始化加载信息
async function GetAllData() {
  console.log("loadInfo");
  var from = dappContactAddress;
  var value = "0";
  var nonce = "0";
  var gas_price = "1000000";
  var gas_limit = "2000000";
  var callFunction = "sizeLength"; //所有问题数量
  var callArgs = "";
  var contract = {
    "function": callFunction,
    "args": callArgs
  }

   neb.api.call(from, dappContactAddress, value, nonce, gas_price, gas_limit, contract).then(async function (resp) {
    var result = resp.result;
    if (result === 'null') {
      console.log("Null result");
      AllCount=0;
      return;
    }
    AllCount=parseInt(result);
    var x= await loadListInfo();
    return x;
  }).catch(function (err) {
    console.log("error :" + err.message);
  })
}

//加载所有数据
 function loadListInfo() {
  var from = dappContactAddress;
  var value = "0";
  var nonce = "0";
  var gas_price = "1000000";
  var gas_limit = "2000000";
  var callFunction = "GetAll"; 
  console.log(AllCount);
  var callArgs = "[\""+AllCount+"\",\"0\"]";
  var contract = {
    "function": callFunction,
    "args": callArgs
  }

  neb.api.call(from, dappContactAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
    var result = resp.result;
    if (result === 'null') {
      console.log("Null result");
      return;
    }
   // console.log(result);
    var result=result.replace(/\\/g,'');
  
    result=result.substring(1,result.length-1);
   // console.log(result);
    var res = JSON.parse(result);
    return res;
    // for(var p in res){
    //   console.log(res[p].index + " " + res[p].key);}

  }).catch(function (err) {
    console.log("error :" + err.message);
  })
}