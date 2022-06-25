import fetch from 'node-fetch';
import yesno from 'yesno';
import { ethers } from 'ethers';

const chainId = 56;
const privateKey = '23b8393943f344bd2d4d192a820913840f8c24c67efa6b97d420c23bbe18c3c9';
const walletAddress = '0xB39364296D5Ed50D0f1e6aFA220EC420b2D981BF';

const swapParams = {
  fromTokenAddress: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', // cake
  toTokenAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // wbnb
  amount: ethers.utils.parseEther('0.1'),
  fromAddress: walletAddress,
  slippage: 1,
  disableEstimate: false,
  allowPartialFill: false,
};

const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org');
const account = new ethers.Wallet(privateKey, provider);

const apiBaseUrl = 'https://api.1inch.io/v4.0/' + chainId;

function apiRequestUrl(methodName: string, queryParams = {}) {
  return apiBaseUrl + methodName + '?' + new URLSearchParams(queryParams).toString();
}

async function signAndSendTransaction(transaction = {}) {
  console.log('==========> before swap: ', transaction);
  const rawTransaction = await account.sendTransaction(transaction);
  console.log(await rawTransaction.wait());
  // return await broadCastRawTransaction(rawTransaction);
}

async function checkAllowance(tokenAddress: string, walletAddress: string) {
  return fetch(apiRequestUrl('/approve/allowance', { tokenAddress, walletAddress }))
    .then((res) => res.json())
    .then((res: any) => res.allowance);
}

async function buildTxForApproveTradeWithRouter(tokenAddress: string, amount?: number) {
  const url = apiRequestUrl('/approve/transaction', amount ? { tokenAddress, amount } : { tokenAddress });

  const transaction: any = await fetch(url).then((res) => res.json());
  console.log('========> Tx:', transaction);

  const gasLimit = await account.estimateGas({
    ...transaction,
    from: walletAddress,
  });
  console.log('========> Gas estimate', gasLimit);

  return {
    ...transaction,
    maxFeePerGas: ethers.utils.parseUnits('50', 'gwei'),
    // gasPrice: gasLimit,
  };
}

async function getQuote(swapParams = {}) {
  const url = apiRequestUrl('/quote', swapParams);

  const data: any = await fetch(url).then((res) => res.json());

  console.log('====> quote:', data);
  return data.tx;
}

// ------------------------------------
// INTIATE SWAP
// ------------------------------------
async function buildTxForSwap(swapParams = {}) {
  const url = apiRequestUrl('/swap', swapParams);

  const data: any = await fetch(url).then((res) => res.json());

  return data.tx;
}

async function startSwap() {
  // ------------------------------------
  // CHECK ALLOWANCE
  // ------------------------------------
  const allowance = await checkAllowance(swapParams.fromTokenAddress, walletAddress);
  console.log('Allowance: ', allowance);

  // ------------------------------------
  // INTIATE APPROVAL FOR SWAP
  // ------------------------------------

  if (allowance <= 0) {
    // First, let's build the body of the transaction
    const transactionForSign = await buildTxForApproveTradeWithRouter(swapParams.fromTokenAddress);
    console.log('Transaction for approve: ', transactionForSign);

    const ok = await yesno({
      question: 'Do you want to send a transaction to approve trade with 1inch router?',
    });

    // Before signing a transaction, make sure that all parameters in it are specified correctly
    if (!ok) {
      throw Error('Approval cancelled by user!');
    }

    // Send a transaction and get its hash
    const approveTxHash = await signAndSendTransaction(transactionForSign);

    console.log('Approve tx hash: ', approveTxHash);
  }

  // ------------------------------------
  // START SWAP
  // ------------------------------------

  await getQuote(swapParams);

  // First, let's build the body of the transaction
  const swapTransaction = await buildTxForSwap(swapParams);
  console.log('Transaction for swap: ', swapTransaction);

  const ok = await yesno({
    question: 'Do you want to send a transaction to exchange with 1inch router?',
  });

  // Before signing a transaction, make sure that all parameters in it are specified correctly
  if (!ok) {
    throw Error('Swap cancelled by user!');
  }

  // rename 'gasLimit' with 'gas'
  const gas = swapTransaction.gas;
  delete swapTransaction.gas;

  // Send a transaction and get its hash
  const swapTxHash = await signAndSendTransaction({
    ...swapTransaction,
    gasLimit: gas,
    value: '0x0',
    gasPrice: ethers.utils.hexValue(ethers.utils.parseUnits(swapTransaction.gasPrice, 'wei')),
  });
  console.log('Swap transaction hash: ', swapTxHash);
}

(async function () {
  await startSwap();
})();
