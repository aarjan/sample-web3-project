import { ethers } from 'hardhat';

async function main() {
  // provider = new ethers.providers.JsonRpcProvider('https://bsc.getblock.io/mainnet/?api_key=8042d8c8-a768-4b59-91fc-7edf73d309e0');
  const provider = new ethers.providers.JsonRpcProvider();
  const signer = provider.getSigner();
  await provider.listAccounts();
  await signer.getBalance();
  await signer.getAddress();
  await provider.getBalance('0xdD2FD4581271e230360230F9337D5c0430Bf44C0');
  await ethers.utils.parseEther('1.0'); // => 1 eth
  await ethers.utils.formatEther('100000000000000'); // => 1eth (1^18 dai)

  const Token = await ethers.getContractFactory('Token');
  const token = await Token.attach('0x40a42Baf86Fc821f972Ad2aC878729063CeEF403');

  // get all transfers from address
  token.filters.Transfer('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', null);
  // get all transfers to 'address'
  token.filters.Transfer(null, '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');

  // abicoder
  const abiCoder = new ethers.utils.AbiCoder();
  abiCoder.decode(['string'], abiCoder.encode(['string'], ['aarjan']));

  // estimate gas
  await signer.estimateGas({
    to: '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
    data: await ethers.utils.id('Transfer(address,uint256)'),
    value: ethers.utils.parseEther('100.0'),
  });

  // token
  // approve 12 tokens to be spent by the account:0xdD2FD4581271e230360230F9337D5c0430Bf44C0
  await token.approve('0xdD2FD4581271e230360230F9337D5c0430Bf44C0', 12);
  // check allowance of 0xdD2FD4581271e230360230F9337D5c0430Bf44C0 in the account:0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  await token.allowance(
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
  );
  // transfer from
  await token.transferFrom(
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
    12,
  );

  //   const iface = new ethers.utils.Interface(JSON.stringify(ABI.abi));
  const iface = new ethers.utils.Interface([
    'function name() public view returns (string memory)',
    'function symbol() public view returns (string memory)',
    'function totalSupply() public view returns (uint256)',
    'function approve(address guy, uint wad) public returns (bool)',
    'function allowance(address owner, address spender) public view returns (uint256)',
    'function balanceOf(address account) public view returns (string memory)',
    'function transferFrom(address sender, address recipient, uint256 amount)',
    'function transfer(address recipient, uint256 amount)',
  ]);
  const router = new ethers.Contract('0x40a42Baf86Fc821f972Ad2aC878729063CeEF403', iface, signer);
  router.name(); // run contract functions from the interface functions provided

  iface.decodeFunctionData(
    'transferFrom',
    '0x23b872dd000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000dd2fd4581271e230360230f9337d5c0430bf44c0000000000000000000000000000000000000000000000000000000000000000c',
  );

  const tx = await provider.getTransaction(
    '0x841349fdeea6f6c85534dd6bacc0c36fc288a115f1dd631be09fb5c9002494f4',
  );

  const decodedInput = iface.parseTransaction({ data: tx.data, value: tx.value });
  console.log(decodedInput);

  // sign using another private key
  const signer2 = new ethers.Wallet(
    '0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0',
    provider,
  );
  const Token2 = await ethers.getContractFactory('Token', signer2);
  const token2 = await Token2.attach('0x40a42Baf86Fc821f972Ad2aC878729063CeEF403');

  await token2.mint(50); // Fail if it is not the owner
}

main();
