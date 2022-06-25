import { ethers } from 'hardhat';

// (async () => {
//   const provider = new ethers.providers.JsonRpcProvider();

//   const signer = new ethers.Wallet(
//     '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
//     provider,
//   );
//   const Token = await ethers.getContractFactory('Token', signer);
//   const token = await Token.attach('0x40a42Baf86Fc821f972Ad2aC878729063CeEF403');

//   //   const iface = new ethers.utils.Interface(JSON.stringify(ABI.abi));
// const iface = new ethers.utils.Interface([
//   'function name() public view returns (string memory)',
//   'function symbol() public view returns (string memory)',
//   'function totalSupply() public view returns (uint256)',
//   'function balanceOf(address account) public view returns (string memory)',
//   'function transferFrom(address sender, address recipient, uint256 amount)',
//   'function transfer(address recipient, uint256 amount)',
// ]);
// router = new ethers.Contract('0x96f3ce39ad2bfdcf92c0f6e2c2cabf83874660fc', iface, signer);
// })();

// try swapethfortokens
const init = async function () {
  // testnet
  const addresses = {
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    me: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  };
  const provider = new ethers.providers.JsonRpcProvider();

  const account = new ethers.Wallet(
    '0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0',
    provider,
  );

  const router = new ethers.Contract(
    addresses.router,
    [
      'function getAmountsOut(uint amountIn, address[] memory path) public view returns(uint[] memory amounts)',
      `function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)`,
      'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
    ],
    account,
  );

  const wethContract = await new ethers.Contract(
    addresses.WETH,
    [
      'function name() public view returns (string memory)',
      'function symbol() public view returns (string memory)',
      'function totalSupply() public view returns (uint256)',
      'function balanceOf(address account) public view returns (uint256)',
      'function approve(address guy, uint wad) public returns (bool)',
      'function allowance(address owner, address spender) public view returns (uint256)',
      'function transferFrom(address sender,address recipient,uint256 amount) ',
    ],
    account,
  );

  // const uniContract = await new ethers.Contract(
  //   addresses.UNI,
  //   [
  //     'function name() public view returns (string memory)',
  //     'function symbol() public view returns (string memory)',
  //     'function totalSupply() public view returns (uint256)',
  //     'function balanceOf(address account) public view returns (uint256)',
  //     'function approve(address guy, uint wad) public returns (bool)',
  //     'function allowance(address owner, address spender) public view returns (uint256)',
  //     'function transferFrom(address sender,address recipient,uint256 amount) ',
  //   ],
  //   account,
  // );

  const amountIn = await ethers.utils.parseUnits('1', 'ether');
  const gas = {
    gasPrice: await ethers.utils.parseUnits('50', 'gwei'), // how?
    gasLimit: '500000',
  };

  const approveTx = await wethContract.approve(addresses.router, amountIn, gas);
  const approveRecipt = await approveTx.wait();
  console.log(approveRecipt.transactionHash);

  const amounts = await router.getAmountsOut(amountIn, [addresses.WETH, addresses.USDT]);

  const amountOutMin = amounts[1].sub(amounts[1].div(10));

  console.log('amounts: ', amounts, amountOutMin);

  const swapTx = await router.swapExactTokensForTokens(
    amountIn,
    amountOutMin,
    [addresses.WETH, addresses.USDT],
    addresses.me,
    Date.now() + 1000 * 60 * 10,
    gas,
  );

  // const swapTx = await router.swapExactETHForTokens(
  //   amountOutMin,
  //   [addresses.WETH, addresses.USDT],
  //   addresses.me,
  //   Date.now() + 1000 * 60 * 10,
  //   {
  //     gasLimit: 1000000,
  //     gasPrice: ethers.utils.parseUnits('50', 'gwei'),
  //     value: amountIn,
  //   },
  // );

  const swapReceipt = await swapTx.wait();

  console.log(swapReceipt);
  console.log('Swap success!!');
};

init();
