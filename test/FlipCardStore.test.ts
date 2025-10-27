import { expect } from "chai";
import { ethers, deployments } from "hardhat";

describe("FlipCardStore", function () {
  beforeEach(async () => {
    await deployments.fixture(["FHECounter", "FlipCardStore"]);
  });

  it("buy small pack, open, sell and withdraw", async function () {
    const [deployer] = await ethers.getSigners();
  const deployed = await deployments.get("FlipCardStore");
  const flip = await ethers.getContractAt("FlipCardStore", deployed.address, deployer);

  const PACK_SMALL = await flip.getPackPrice(0);

  // fund the contract so it can pay out card sells (tests only)
  await deployer.sendTransaction({ to: flip.target, value: ethers.parseEther("1") });

    // buy and open
    const tx = await flip.buyAndOpen(0, { value: PACK_SMALL });
    const rc = await tx.wait();

  // lastOpened should be set
  const opened = await flip.lastOpened(deployer.address);
  expect(opened.exists).to.equal(true);

    // sell the opened card
    await flip.sellLastOpened();

    const bal = await flip.balanceOf(deployer.address);
    expect(bal).to.be.gt(0);

    // withdraw
    const provider = ethers.provider;
    const before = await provider.getBalance(deployer.address);
    const w = await flip.withdraw();
    await w.wait();
    const after = await provider.getBalance(deployer.address);

    expect(after).to.be.gt(before);
  });
});
