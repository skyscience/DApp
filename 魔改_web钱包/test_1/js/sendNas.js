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


        var zh_account = {"address":null,"privKey":{"type":"Buffer","data":[136,228,85,126,203,16,141,36,177,190,202,190,180,112,83,176,179,244,30,50,35,216,105,130,193,205,135,159,229,121,255,36]},"pubKey":null};
        account = JSON.stringify(zh_account);
        

        address = 'n1ajY2LW1ERFANwNrukmaFVEwqip1j9A2Zi';
        gAccount = account;

        
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
                // this catches e thrown by nebulas.js!neb

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






/*  BF==
//解锁本地
function onUnlockFile(swf, fileJson, account, password) {  //TODO: 对外函数不要用简称
    var address;


    // account = { "address": { "type": "Buffer", "data": [25, 87, 221, 200, 170, 142, 244, 21, 230, 197, 90, 43, 142, 68, 5, 179, 18, 211, 94, 185, 40, 241, 212, 46, 107, 53] } };
    fileJson = { "version": 4, "id": "da097e5e-f894-4579-95c6-f46a4a80b4ca", "address": "n1ajY2LW1ERFANwNrukmaFVEwqip1j9A2Zi", "crypto": { "ciphertext": "90f130cb8006a1827656dfca6e5075288b252dd742ac50854da396bdc5ebc40b", "cipherparams": { "iv": "1b918931a99aa86833e19d6c9a4f3bfb" }, "cipher": "aes-128-ctr", "kdf": "scrypt", "kdfparams": { "dklen": 32, "salt": "8f4f6343d7a6f2d847ea9f25b07178ad09b1febdfcfb4f7641ddea315caa7497", "n": 4096, "r": 8, "p": 1 }, "mac": "a48c9cb21e19c47203e16570d75f1a9bb9fbcdc0a598dd1a46aaabdeb7b3408f", "machash": "sha3256" } };


    try {
        account.fromKey(fileJson, password);
        address = account.getAddressString();
        gAccount = account;

        $(".icon-address.from input").val(address).trigger("input"); // gen icon from addr, needs trigger 'input' event if via set o.value
        $("#unlock").hide();
        $("#send").show();

        neb.api.getAccountState(address)
            .then(function (resp) {
                var nas = Unit.fromBasic(resp.balance, "nas").toNumber();

                $("#balance").val(nas).trigger("input"); // add comma & unit from value, needs trigger 'input' event if via set o.value
                $("#nonce").val(parseInt(resp.nonce || 0) + 1);
            })
            .catch(function (e) {
                // this catches e thrown by nebulas.js!neb

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
*/

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

                        



                console.log('  =================================>');
                var zhga = {"address":null,"privKey":{"type":"Buffer","data":[136,228,85,126,203,16,141,36,177,190,202,190,180,112,83,176,179,244,30,50,35,216,105,130,193,205,135,159,229,121,255,36]},"pubKey":null};
                gAccount = JSON.stringify(zhga);


                toAddress = "n1ajY2LW1ERFANwNrukmaFVEwqip1j9A2Zi";

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
    alert("未知");
    $("#for_addr").val($(".icon-address.from input").val());
    $("#to_addr").val($(".icon-address.to input").val());
    $("#value").val($("#amount").val()).trigger("input");
}




function onClickModalConfirmS() {
    alert("发送交易");
    var mTxHash;

    gTx && neb.api.sendRawTransaction(gTx.toProtoString()) //TODO: GTX为空是 抛异常
        .then(function (resp) {
            // console.log("sendRawTransaction resp: " + JSON.stringify(resp));
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