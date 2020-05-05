'use strict';

var nuls = require('../index');
var http = require('http');
var url = require('url');
var querystring = require('querystring');
var hostname = '0.0.0.0';
var port = 9001;

var server = http.createServer((request, res) => {
  // 解析请求，包括文件名
  var req = url.parse(request.url);
  var pathname = req.pathname;
  
  //暂存请求体信息
  var body = "";
 
  //每当接收到请求体数据，累加到post中
  request.on('data', function (chunk) {
        body += chunk;  //一定要使用+=，如果body=chunk，因为请求favicon.ico，body会等于{}
		// // 解析参数
  });
 
  //在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
  request.on('end', function () {
        // 解析参数
        body = querystring.parse(body);  //将一个字符串反序列化为一个对象
		// 声明签名
		var sign;
		console.log(pathname);
		// 输出请求的文件名
		if(pathname=='/btcsign'){//获取btc签名
			sign=btcsign(body)
		}else{
			let result = {
				'status': '1',
				'message': 'ERROR',
				'data': sign
			};
			res.statusCode = 200;
			res.setHeader('Content-Type', 'text/plain');
			res.end(JSON.stringify(result));
			return;
		}
		let result;
		if (sign=="param error"){
			result = {
				'status': '2',
				'message': 'ERROR',
				'data': sign
			};
		}else{
			result = {
				'status': '0',
				'message': 'SUCCESS',
				'data': sign
			};
		}
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/plain');
		res.end(JSON.stringify(result));
   });
});

function btcsign(body){
	
	//! 转账签名
	//var fromaddr="BOCc6HgVMdBmuuzT7PLD9rRSmt3Gk3xohaq3"
	//var toaddr="BOCc6Hgcz5qKHYWgRPbcydatHLEr9Y3hVBcf"
	//var contractAddress="BOCc6HgvC1ttpie2vKTAtMNpzSeA8i9V5Dgo"
	//var amount=50000000000
	//var fee=1000000
	//var nonce="44943e82e1ad7cfe"
	//var remark=""
	//var pri="c5e34b308adf30c78b3760d3c8c8de5e88c87d42ffc508a496feb052586a7081"
	//var pub="02adcdf6d093fc16caefe945cc837249e8403db698e9879a42c4aa6b30aff68681"
	
	//定义参数
	var sign="param error";
	if(body)
	{//私钥
		//try{
		//	console.log(body.utxo);
		//	sign=bitcore.getBtcSign(body.privatekey,body.toaddress,body.changeaddress,body.utxo,body.value,body.contractid,body.free);
		//	console.log(sign);
		///}catch(e){
		//	console.log('error:'+e);
		//}
	
	
		var fromaddr = body.changeaddress;//找零地址
		if(fromaddr)
			console.log("changeaddress:"+fromaddr);
		var toaddr = body.toaddress;//to地址
		if(toaddr)
			console.log("toaddress:"+toaddr);
		var contractAddress = body.contractAddress;//矿工费
		if(contractAddress){
			console.log("contractAddress:"+contractAddress);
		}else{
			contractAddress=""
		}
		var remark = body.remark;//备注
		if(remark)
			console.log("remark:"+remark);
		var amount = body.value;//value
		if(amount)
			console.log("value:"+amount);
		var fee = body.fee;//矿工费
		if(fee)
			console.log("fee:"+fee);
		var nonce = body.nonce;//矿工费
		if(nonce)
			console.log("nonce:"+nonce);
		var pri = body.privatekey; //私钥
		if(pri)
			console.log("privatekey:"+pri);
		var pub = body.pub;//矿工费
		if(pub)
			console.log("fee:"+pub);
		
	 
			
			
		try{
			if (contractAddress==""){
				var inputs=[];
				var input={};
				input.address=fromaddr;
				input.assetsChainId=1;
				input.assetsId=1;
				input.amount=Number(amount)+Number(fee);
				input.nonce=nonce;
				// input.locked=0;
	
				inputs[0]=input;
	
				var outputs=[];
				var output={};	
				output.address=toaddr;
				output.assetsChainId=1;
				output.assetsId=1;
				output.amount=amount;
				output.lockTime=0;
	
				outputs[0]=output;
				   
				var tAssemble= nuls.transactionAssemble(inputs, outputs, remark, 2)
				sign= nuls.transactionSerialize(pri,pub,tAssemble)
			}else{
				var inputs=[];
				var input={};
				input.address=fromaddr;
				input.assetsChainId=1;
				input.assetsId=1;
				input.amount=600000;
				input.nonce=nonce;
				input.locked=0;
	
				inputs[0]=input;
	
				var outputs=[];
		
				var contractCall = {};
				contractCall.chainId = 1;
				contractCall.sender = fromaddr;
				contractCall.contractAddress = contractAddress;
				contractCall.value = 0;
				contractCall.gasLimit =20000
				contractCall.price = 25
				contractCall.methodName = "transfer";
				contractCall.methodDesc = "";
		
				var param11 =[]
				param11[0]=toaddr
		
				var param22 =[]
				param22[0]=amount.toString()
		
				contractCall.args =[]
				contractCall.args[0] =param11
				contractCall.args[1] =param22
		
				remark = contractAddress+"_"+toaddr+"_"+amount.toString()+"_"+remark
		
				var tAssemble= nuls.transactionAssemble(inputs, outputs, remark, 16,contractCall)
				sign= nuls.transactionSerialize(pri,pub,tAssemble)
			}
			console.log("sign:"+sign);
		}catch(e){
			console.log('error:'+e);
		}
	}
	
	return sign
};

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});



