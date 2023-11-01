import { ActionIcon, Button, Divider } from "@mantine/core";
import { IconShoppingCart, IconX } from "@tabler/icons-react";
import Drawer from "components/Drawer/Drawer";
import React, { useState } from "react";
import { useStore } from "store/seat";
import { CartItem, SeatNode } from "store/types";
import { magic } from "utils/magicSDK";
import { ethers } from "ethers";
import SeatedNFTabi from  "abi/contracts/SeatedNftContract.sol/SeatedNftContract.json";
import StandingNFTabi from "abi/contracts/StandingNftContract.sol/StandingNftContract.json"
import testNftAbi from "abi/contracts/testNFT.sol/testNFT.json"
import {USDCTyping} from "utils/generated-typings/USDCTyping"
import USDC from "utils/USDC.json"
// import tempAbi from  "abi/contracts/testNFT.sol/testNFT.json";


function Cart() {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const { cart, setSelectedNode } = useStore();
  
  const checkoutHandler = async () => {
    setLoading(true);
    try {
      let user = await magic?.wallet.connectWithUI() ?? [];
      
      let userPublicKey = user[0];
      console.log(userPublicKey);
      const provider = magic?.rpcProvider ? new ethers.BrowserProvider(magic?.rpcProvider) : null;

      if (provider == null) {
        throw new Error('Provider not available. Contract cannot be initialized.');
      };

      const signer = await provider?.getSigner();
      //Simple test NFT contract address
      const contractAddr = '0x499924EcDA9927f5fEd7040fc9A01A0C9A6c5FFb';

      // Get Session address
      
      
      // Get section address from session 
      
      // Create a contract interface of session using ethers



      //actual SeatedNFT contract address
      //0x4CBfc13d57f79895C0c1F74866cFF4F3551345f3

      const contract = new ethers.Contract(contractAddr, testNftAbi, signer);
      let nftContractAddr = await contract.getAddress();
      // const mintAmount = await contract.getStartPrice?.();
      // Will require minting to be done asap
      // const USDC_Contract = new ethers.Contract("0x52D800ca262522580CeBAD275395ca6e7598C014",USDC,signer) as unknown as USDCTyping;
      // await USDC_Contract.approve(nftContractAddr, mintAmount);
      console.log("approved")

      const estimatedGas = await contract.mint?.estimateGas?.(userPublicKey);
      // console.log("This is mint amount: " +mintAmount);
      console.log("This is estimated Gas: " + estimatedGas);
      // const gasPrice = ethers.parseUnits("40", "gwei");
      // console.log(gasPrice);
      const tx = await contract.mint?.(userPublicKey,{gasLimit: estimatedGas})
      const receipt = await tx.wait();
      // const transactionFee = receipt.gasPrice.mul(receipt.gasUsed);
      // const transactionFeeHuman = ethers.formatUnits(transactionFee, 18);
      // console.log(`You spent ${transactionFeeHuman} matic`)

      await magic?.wallet.showUI();
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Drawer opened={opened} zIndex={500}>
        <div className="flex h-full w-full flex-col gap-2 bg-gray-200">
          <div className="flex h-12 w-full items-center justify-end pr-4 ">
            <ActionIcon onClick={() => setOpened(false)}>
              <IconX />
            </ActionIcon>
          </div>
          <div className="mx-2 mb-4 mt-2 flex flex-col gap-2 md:mx-4">
            {cart.cartItems.map((c) => {
              return <CartItem item={c} />;
            })}
          </div>
          <Divider />
          <div className="mx-2 flex flex-col gap-8 pt-2 md:mx-4">
            <h2 className="font-bold uppercase tracking-wider text-gray-600">
              Cart Summary
            </h2>
            <div className="flex w-full flex-col items-end justify-end gap-4 ">
              <div className="flex w-[200px] justify-between">
                <span className="font-semibold uppercase tracking-tight text-gray-600">
                  Subtotal
                </span>
                <span>${cart.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex w-[200px] justify-between ">
                <span className="font-semibold uppercase tracking-tight text-gray-600">
                  Service Fees
                </span>
                <span>${0}</span>
              </div>
              <div className="flex w-[200px] justify-between">
                <span className="font-semibold uppercase tracking-tight text-gray-600">
                  Total
                </span>
                <span>${cart.totalPrice.toFixed(2)}</span>
              </div>
              <Button loading={loading} onClick={() => checkoutHandler()}>
                Checkout
              </Button>
            </div>
          </div>
        </div>
      </Drawer>
      <div
        className="absolute bottom-4 right-8 z-30 flex h-12 w-12 cursor-pointer items-center justify-center rounded-3xl bg-blue-400 hover:bg-blue-500"
        onClick={() => {
          setOpened(true);
          setSelectedNode(null);
        }}
      >
        <IconShoppingCart className="stroke-slate-100 hover:stroke-white" />
      </div>
    </div>
  );
}

export default Cart;

const CartItem = ({ item }: { item: CartItem }) => {
  const { nodes, cart, setNodes, setCart } = useStore();

  const onRemove = () => {
    const currentNode = nodes.find((n) => n.info.id === item.seatId);
    if (!currentNode) return;

    const newNode: SeatNode = {
      ...currentNode,
      info: {
        ...currentNode.info,
        numSeats: currentNode.info.numSeats + item.totalSeats,
      },
    };
    const newNodes = nodes.map((n) =>
      n.info.id !== item.seatId ? n : newNode
    );
    const cartItems = cart.cartItems.filter((c) => c.seatId != item.seatId);

    setNodes(newNodes);
    setCart({ ...cart, cartItems: cartItems });
  };

  return (
    <div className="flex h-[150px] w-full flex-col justify-between rounded-md bg-white px-4 py-4 shadow-sm">
      <div className="flex w-full justify-between">
        <span>
          Section {item.seatId} • Category {item.category}
        </span>
        <span className="pr-4">
          ${(item.totalSeats * item.price).toFixed(2)}
        </span>
      </div>
      <div className="flex w-full justify-between">
        <span>QTY: {item.totalSeats}</span>
        <Button
          variant="subtle"
          className="uppercase"
          onClick={() => onRemove()}
        >
          Remove
        </Button>
      </div>
    </div>
  );
};
