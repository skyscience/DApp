"use strict";


var nebulas = require("nebulas"),
    Transaction = nebulas.Transaction,
    Utils = nebulas.Utils,
    Unit = nebulas.Unit,
    neb = new nebulas.Neb(),
    validateAll = uiBlock.validate(),
    gLastGenerateInfo = {},
    gAccount, gTx;

neb.setRequest(new nebulas.HttpRequest(localSave.getItem("apiPrefix") || "https://testnet.nebulas.io/"));




// ##
$("#generate").on("click", onClickGenerate);  //转账 
$("#modal-confirm .s").on("click", onClickModalConfirmS);  //生成交易
$("#send_transaction").on("click", onClickSendTransaction); //发送交易




uiBlock.insert({

    footer: ".footer",
    header: ".header",
    iconAddress: ".icon-address",
    logoMain: ".logo-main",
    numberComma: ".number-comma",
    selectWalletFile: [".select-wallet-file", onUnlockFile]

});
// ===================开始==================================================






//解锁本地
function onUnlockFile(swf, fileJson, account, password) {  //TODO: 对外函数不要用简称
    var address;
    

    try {
        gAccount = account.fromKey(fileJson, password);
        address = 'n1ajY2LW1ERFANwNrukmaFVEwqip1j9A2Zi';
        

        $(".icon-address.from input").val(address).trigger("input"); // gen icon from addr, needs trigger 'input' event if via set o.value
        $("#unlock").hide();
        $("#send").show();


        //=====================跟下面没关系
        neb.api.getAccountState(address)
            .then(function (resp) {
                var nas = Unit.fromBasic(resp.balance, "nas").toNumber();

                $("#balance").val(nas).trigger("input"); // add comma & unit from value, needs trigger 'input' event if via set o.value
                $("#nonce").val(parseInt(resp.nonce || 0) + 1);
            })
            .catch(function (e) {


                bootbox.dialog({
                    backdrop: true,
                    onEscape: true,
                    message: i18n.apiErrorToText(e.message),
                    size: "large",
                    title: "Error"
                });
            });
    } catch (e) {
        // this catches e thrown by nebulas.js!account

        bootbox.dialog({
            backdrop: true,
            onEscape: true,
            message: localSave.getItem("lang") == "en" ? e : "keystore 文件错误, 或者密码错误",
            size: "large",
            title: "Error"
        });
    }
}



//#   ====  转账 ====
function onClickGenerate() {
    var fromAddress, toAddress, balance, amount, gaslimit, gasprice, nonce, bnAmount;
    if (validateAll()) {
        fromAddress = $(".icon-address.from input").val();
        toAddress = $(".icon-address.to input").val();
        balance = $("#balance").val();
        amount = $("#amount").val();
        gaslimit = $("#limit").val();
        gasprice = $("#price").val();
        nonce = $("#nonce").val();



        if (gLastGenerateInfo.fromAddress != fromAddress ||
            gLastGenerateInfo.toAddress != toAddress ||
            gLastGenerateInfo.balance != balance ||
            gLastGenerateInfo.amount != amount ||
            gLastGenerateInfo.gaslimit != gaslimit ||
            gLastGenerateInfo.gasprice != gasprice ||
            gLastGenerateInfo.nonce != nonce) try {  //TODO: 加括号


                var tmp = Unit.fromBasic(Utils.toBigNumber(gaslimit)
                    .times(Utils.toBigNumber(gasprice)), "nas");
                if (Utils.toBigNumber(balance).lt(Utils.toBigNumber(amount).plus(tmp))) //TODO: 加括号； tmp-->max gas used
                    if (Utils.toBigNumber(balance).lt(tmp))
                        bnAmount = Utils.toBigNumber(0); //TODO: 逻辑是否必须有
                    else
                        bnAmount = Utils.toBigNumber(balance).minus(Utils.toBigNumber(tmp));
                        




                gTx = new Transaction(1001, gAccount, toAddress, Unit.nasToBasic(Utils.toBigNumber(amount)), parseInt(nonce), gasprice, gaslimit);
                gTx.signTransaction();


                $("#raw").val(gTx.toString());
                $("#signed").val(gTx.toProtoString());
                $("<div id=addressqr></div>")
                    .qrcode(gTx.toProtoString())
                    .replaceAll('#addressqr');
                $("#transaction").show();
                gLastGenerateInfo.fromAddress = fromAddress;
                gLastGenerateInfo.toAddress = toAddress;
                gLastGenerateInfo.balance = balance;
                gLastGenerateInfo.amount = amount;
                gLastGenerateInfo.gaslimit = gaslimit;
                gLastGenerateInfo.gasprice = gasprice;
                gLastGenerateInfo.nonce = nonce;
            } catch (e) {
                bootbox.dialog({
                    backdrop: true,
                    onEscape: true,
                    message: e,
                    size: "large",
                    title: "Error"
                });
            }
    }
}








// ==========================下面的没用了==========================
function onClickSendTransaction() {

    $("#for_addr").val($(".icon-address.from input").val());
    $("#to_addr").val($(".icon-address.to input").val());
    $("#value").val($("#amount").val()).trigger("input");
}




function onClickModalConfirmS() {
    var mTxHash;

    gTx && neb.api.sendRawTransaction(gTx.toProtoString()) //TODO: GTX为空是 抛异常
        .then(function (resp) {

            mTxHash = resp.txhash;
            return neb.api.getTransactionReceipt(mTxHash);
        }).then(function (resp) {
            $("#receipt").text(mTxHash).prop("href", "check.html?" + mTxHash);
            $("#receipt_state").val(JSON.stringify(resp));
            $("#receipt_div").show();

            // TODO: 重新点击需要reset页面状态，清理setTimeout    （ 是否需要 ，如果需要的话给用户认知 ）
            setTimeout(function () {
                neb.api.getAccountState($(".icon-address.from input").val())
                    .then(function (resp) {
                        // console.log("getAccountState resp: " + JSON.stringify(resp));
                        var balanceNas = Unit.fromBasic(resp.balance, "nas");
                        $("#balance").val(balanceNas);
                        $("#nonce").val(resp.nonce);
                    }).catch(function (err) {
                        // TODO error
                    });
            }, 60 * 1000);
        }).catch(function (o) {
            bootbox.dialog({
                backdrop: true,
                onEscape: true,
                message: i18n.apiErrorToText(o.message),
                size: "large",
                title: "Error"
            });
        });
}