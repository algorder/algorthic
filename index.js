


async function checkAccounts() {
    var valid = await validateConfig();
    if(!valid){
        return;
    }
    await main();
    setTimeout(function(){ 
        checkAccounts();
    }, 100);
}

async function validateConfig() {
    var privateKey = await getPrivateKey();
    //Algorthic Account
    if(privateKey === undefined || privateKey === null || privateKey.length <= 0 ){
        console.error("Enter privatekey in config.json file");
        return false;
    }
    return true;
}
async function getPrivateKey() {
    const fs = require('fs');
    var data = fs.readFileSync('config.json', 'utf8')
    var config = JSON.parse(data);
    return config["algorthicPrivateKey"];
}

async function main()
{
    const Web3 = require('web3');
    var web3 = new Web3(new Web3.providers.HttpProvider('https://api.avax.network/ext/bc/C/rpc'));
    const algorderContractAddress = "0x95d294bc407beD9AD34F040405D6cDBe5f952DD4";
    const privateKey = await getPrivateKey();

    try {

        var algorderContract = new web3.eth.Contract(
           algorderContractABI(),
           algorderContractAddress
        );

        //Algorthic Account
        let account = await web3.eth.accounts.privateKeyToAccount(privateKey);
        web3.eth.accounts.wallet.add(privateKey);

        //Get Algorder Account List
        var accountList = await algorderContract.methods.getAccountList().call();

        console.log("\nChecking " + accountList.length + " Algorder accounts.");

        //Check each Algorder account
        var totalOrdersChecked = 0;
        for(var i= 0 ; i < accountList.length; i++){
            var accountAddress = accountList[i];
            process.stdout.write("Checked "+ i + "/" + accountList.length + " of Algorder accounts. Total checked orders: " + totalOrdersChecked + "\r");


            var algorderAccountContract = new web3.eth.Contract(
                algorderAccountContractABI(),
                accountAddress
            );
            try{
                //Get Algorder Account's orders
                var orderCount = await algorderAccountContract.methods.getOrdersLength().call();

                for(var y= 0 ; y < orderCount; y++){

                    try{
                        var orderItem = await algorderAccountContract.methods.getOrder(y).call();

                        //Check if order's condition is met.
                        var orderChecked = await algorderAccountContract.methods.checkOrder(orderItem.id).call();
                        
                        //If order's condition is met. Send the order.
                        if(orderChecked){
                            try{
                                const gasPrice = await web3.eth.getGasPrice();
                                var gasEstimate = await algorderAccountContract.methods.sendOrder(orderItem.id).estimateGas({ from: account.address.toUpperCase() });
                                await algorderAccountContract.methods.sendOrder(orderItem.id).send({ 
                                    from: account.address.toUpperCase()  , 
                                    value: Web3.utils.toWei('0', 'ether'),
                                    gas: gasEstimate,
                                    gasPrice: gasPrice
                                });
                                console.log("\nOrder sent.");
                            }catch(error){

                            }
                        }
                        totalOrdersChecked += 1;
                    }catch(error){
                        totalOrdersChecked += 1;
                        continue;
                    }

                    
                }
            }catch(error){
                continue;
            }
        }
        return;

    }catch(error){
        console.log(error);
    }
}


function algorderContractABI(){
    return [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "AccountCreate",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "createAccount",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getAccountContractAddress",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAccountList",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "creator",
                "type": "address"
            }
        ],
        "name": "setAccountCreatorAddress",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bool",
                "name": "flag",
                "type": "bool"
            }
        ],
        "name": "setCreateAccountFlag",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
];

}


function algorderAccountContractABI (){

    return [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "routerAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "routerFunction",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "factoryAddress",
                "type": "address"
            },
            {
                "internalType": "address[]",
                "name": "conditionPath",
                "type": "address[]"
            },
            {
                "internalType": "uint256",
                "name": "conditionValue",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "conditionOperator",
                "type": "uint256"
            },
            {
                "internalType": "address[]",
                "name": "swapPath",
                "type": "address[]"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "slippage",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "time",
                "type": "uint256"
            }
        ],
        "name": "createOrder",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "orderId",
                "type": "uint256"
            }
        ],
        "name": "deleteOrder",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "ownerAddress",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "time",
                "type": "uint256"
            }
        ],
        "name": "OrderCreate",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "time",
                "type": "uint256"
            }
        ],
        "name": "OrderDelete",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "time",
                "type": "uint256"
            }
        ],
        "name": "OrderSend",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "orderId",
                "type": "uint256"
            }
        ],
        "name": "sendOrder",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "withdraw",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "tokenAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "withdrawToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "orderId",
                "type": "uint256"
            }
        ],
        "name": "checkOrder",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "orderId",
                "type": "uint256"
            }
        ],
        "name": "checkOrderCondition",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "orderId",
                "type": "uint256"
            }
        ],
        "name": "getCheckOrderConditionPrice",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "getOrder",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "routerAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "routerFunction",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "factoryAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address[]",
                        "name": "conditionPath",
                        "type": "address[]"
                    },
                    {
                        "internalType": "uint256",
                        "name": "conditionValue",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "conditionOperator",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address[]",
                        "name": "swapPath",
                        "type": "address[]"
                    },
                    {
                        "internalType": "uint256",
                        "name": "value",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "slippage",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "time",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "createdDate",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct AlgorderAccount.Order",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getOrdersLength",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getOwner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
}


checkAccounts();