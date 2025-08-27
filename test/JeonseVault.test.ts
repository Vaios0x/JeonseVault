import { expect } from "chai";
import hre from "hardhat";
import { JeonseVault, PropertyOracle, ComplianceModule, InvestmentPool } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

const { ethers } = hre;

describe("JeonseVault", function () {
  let jeonseVault: JeonseVault;
  let propertyOracle: PropertyOracle;
  let complianceModule: ComplianceModule;
  let investmentPool: InvestmentPool;
  let deployer: SignerWithAddress;
  let tenant: SignerWithAddress;
  let landlord: SignerWithAddress;
  let investor: SignerWithAddress;

  const DEPOSIT_AMOUNT = ethers.parseEther("1000000"); // 1M KRW (valor razonable para tests)
  const PROPERTY_ID = "test-property-001";
  const PROPERTY_ADDRESS = "서울특별시 강남구 테스트동 123호";

  beforeEach(async function () {
    [deployer, tenant, landlord, investor] = await ethers.getSigners();

    // Deploy PropertyOracle
    const PropertyOracleFactory = await ethers.getContractFactory("PropertyOracle");
    propertyOracle = await PropertyOracleFactory.deploy();
    await propertyOracle.waitForDeployment();

    // Deploy ComplianceModule
    const ComplianceModuleFactory = await ethers.getContractFactory("ComplianceModule");
    complianceModule = await ComplianceModuleFactory.deploy();
    await complianceModule.waitForDeployment();

    // Deploy InvestmentPool
    const InvestmentPoolFactory = await ethers.getContractFactory("InvestmentPool");
    investmentPool = await InvestmentPoolFactory.deploy();
    await investmentPool.waitForDeployment();

    // Deploy JeonseVault
    const JeonseVaultFactory = await ethers.getContractFactory("JeonseVault");
    jeonseVault = await JeonseVaultFactory.deploy(
      await propertyOracle.getAddress(),
      await complianceModule.getAddress(),
      await investmentPool.getAddress()
    );
    await jeonseVault.waitForDeployment();

    // Setup roles
    const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
    const VERIFIER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VERIFIER_ROLE"));
    const COMPLIANCE_OFFICER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("COMPLIANCE_OFFICER_ROLE"));
    const VAULT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VAULT_ROLE"));

    await propertyOracle.grantRole(ORACLE_ROLE, deployer.address);
    await propertyOracle.grantRole(VERIFIER_ROLE, deployer.address);
    await complianceModule.grantRole(VERIFIER_ROLE, deployer.address);
    await complianceModule.grantRole(COMPLIANCE_OFFICER_ROLE, deployer.address);
    await investmentPool.grantRole(VAULT_ROLE, await jeonseVault.getAddress());

    // Register and verify property
    await propertyOracle.registerProperty(
      PROPERTY_ID,
      PROPERTY_ADDRESS,
      landlord.address,
      DEPOSIT_AMOUNT,
      0 // Apartment type
    );
    await propertyOracle.verifyProperty(PROPERTY_ID);

    // Verify users
    await complianceModule.verifyUser(
      tenant.address,
      "김세입자",
      ethers.keccak256(ethers.toUtf8Bytes("123456-1111111")),
      "010-1111-1111",
      "테스트은행 111-111-111",
      2 // Premium level
    );

    await complianceModule.verifyUser(
      landlord.address,
      "이임대인",
      ethers.keccak256(ethers.toUtf8Bytes("123456-2222222")),
      "010-2222-2222",
      "테스트은행 222-222-222",
      2 // Premium level
    );
  });

  describe("Deployment", function () {
    it("Should deploy with correct initial values", async function () {
      expect(await jeonseVault.totalValueLocked()).to.equal(0);
      expect(await jeonseVault.getTotalDeposits()).to.equal(0);
    });

    it("Should have correct contract addresses", async function () {
      expect(await jeonseVault.propertyOracle()).to.equal(await propertyOracle.getAddress());
      expect(await jeonseVault.complianceModule()).to.equal(await complianceModule.getAddress());
      expect(await jeonseVault.investmentPool()).to.equal(await investmentPool.getAddress());
    });
  });

  describe("Deposit Creation", function () {
    it("Should create a deposit with correct parameters", async function () {
      const endDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60); // 1 year from now

      await expect(
        jeonseVault.connect(tenant).createDeposit(
          landlord.address,
          endDate,
          PROPERTY_ID,
          PROPERTY_ADDRESS,
          false, // No investment
          { value: DEPOSIT_AMOUNT }
        )
      ).to.emit(jeonseVault, "DepositCreated");

      const deposit = await jeonseVault.getDeposit(1);
      expect(deposit.tenant).to.equal(tenant.address);
      expect(deposit.landlord).to.equal(landlord.address);
      expect(deposit.amount).to.equal(DEPOSIT_AMOUNT);
      expect(deposit.propertyId).to.equal(PROPERTY_ID);
      expect(deposit.status).to.equal(0); // Active status
    });

    it("Should reject deposit with insufficient amount", async function () {
      const endDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
      const insufficientAmount = ethers.parseEther("500000"); // 500K KRW (below minimum)

      await expect(
        jeonseVault.connect(tenant).createDeposit(
          landlord.address,
          endDate,
          PROPERTY_ID,
          PROPERTY_ADDRESS,
          false,
          { value: insufficientAmount }
        )
      ).to.be.revertedWith("Invalid deposit amount");
    });

    it("Should reject deposit from non-compliant user", async function () {
      const [, , , nonCompliantUser] = await ethers.getSigners();
      const endDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);

      await expect(
        jeonseVault.connect(nonCompliantUser).createDeposit(
          landlord.address,
          endDate,
          PROPERTY_ID,
          PROPERTY_ADDRESS,
          false,
          { value: DEPOSIT_AMOUNT }
        )
      ).to.be.revertedWith("Tenant not compliant");
    });

    it("Should update total value locked", async function () {
      const endDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);

      await jeonseVault.connect(tenant).createDeposit(
        landlord.address,
        endDate,
        PROPERTY_ID,
        PROPERTY_ADDRESS,
        false,
        { value: DEPOSIT_AMOUNT }
      );

      expect(await jeonseVault.totalValueLocked()).to.equal(DEPOSIT_AMOUNT);
    });
  });

  describe("Deposit Release", function () {
    beforeEach(async function () {
      const endDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
      await jeonseVault.connect(tenant).createDeposit(
        landlord.address,
        endDate,
        PROPERTY_ID,
        PROPERTY_ADDRESS,
        false,
        { value: DEPOSIT_AMOUNT }
      );
    });

    it("Should allow landlord to release deposit after end date", async function () {
      // Fast forward time to after end date
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);

      const initialBalance = await ethers.provider.getBalance(tenant.address);

      await expect(jeonseVault.connect(landlord).releaseDeposit(1))
        .to.emit(jeonseVault, "DepositReleased");

      const deposit = await jeonseVault.getDeposit(1);
      expect(deposit.status).to.equal(1); // Completed status

      const finalBalance = await ethers.provider.getBalance(tenant.address);
      const expectedFee = (DEPOSIT_AMOUNT * BigInt(10)) / BigInt(10000); // 0.1% fee
      const expectedAmount = DEPOSIT_AMOUNT - expectedFee;
      
      expect(finalBalance - initialBalance).to.equal(expectedAmount);
    });

    it("Should reject early release by non-landlord", async function () {
      await expect(
        jeonseVault.connect(tenant).releaseDeposit(1)
      ).to.be.revertedWith("Not authorized: only landlord");
    });

    it("Should reject release before end date", async function () {
      await expect(
        jeonseVault.connect(landlord).releaseDeposit(1)
      ).to.be.revertedWith("Contract not yet ended");
    });
  });

  describe("Investment Integration", function () {
    it("Should enable investment for deposits", async function () {
      const endDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);

      await jeonseVault.connect(tenant).createDeposit(
        landlord.address,
        endDate,
        PROPERTY_ID,
        PROPERTY_ADDRESS,
        true, // Enable investment
        { value: DEPOSIT_AMOUNT }
      );

      const deposit = await jeonseVault.getDeposit(1);
      expect(deposit.isInvestmentEnabled).to.be.true;
      expect(deposit.investmentPoolShare).to.be.gt(0);
    });
  });

  describe("Dispute Handling", function () {
    beforeEach(async function () {
      const endDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
      await jeonseVault.connect(tenant).createDeposit(
        landlord.address,
        endDate,
        PROPERTY_ID,
        PROPERTY_ADDRESS,
        false,
        { value: DEPOSIT_AMOUNT }
      );
    });

    it("Should allow tenant to dispute deposit", async function () {
      await expect(
        jeonseVault.connect(tenant).disputeDeposit(1, "부당한 계약 조건")
      ).to.emit(jeonseVault, "DepositDisputed");

      const deposit = await jeonseVault.getDeposit(1);
      expect(deposit.status).to.equal(2); // Disputed status
    });

    it("Should allow admin to resolve disputes", async function () {
      await jeonseVault.connect(tenant).disputeDeposit(1, "부당한 계약 조건");

      // Admin resolves dispute in favor of tenant (refund)
      await jeonseVault.connect(deployer).resolveDispute(1, 0);

      const deposit = await jeonseVault.getDeposit(1);
      expect(deposit.status).to.equal(3); // Refunded status
    });
  });

  describe("Security Features", function () {
    it("Should pause and unpause contract", async function () {
      await jeonseVault.connect(deployer).pause();
      
      const endDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
      
      await expect(
        jeonseVault.connect(tenant).createDeposit(
          landlord.address,
          endDate,
          PROPERTY_ID,
          PROPERTY_ADDRESS,
          false,
          { value: DEPOSIT_AMOUNT }
        )
      ).to.be.revertedWith("Pausable: paused");

      await jeonseVault.connect(deployer).unpause();
      
      await expect(
        jeonseVault.connect(tenant).createDeposit(
          landlord.address,
          endDate,
          PROPERTY_ID,
          PROPERTY_ADDRESS,
          false,
          { value: DEPOSIT_AMOUNT }
        )
      ).to.not.be.reverted;
    });

    it("Should allow only admin to perform emergency withdrawal", async function () {
      const endDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
      await jeonseVault.connect(tenant).createDeposit(
        landlord.address,
        endDate,
        PROPERTY_ID,
        PROPERTY_ADDRESS,
        false,
        { value: DEPOSIT_AMOUNT }
      );

      await expect(
        jeonseVault.connect(tenant).emergencyWithdraw(1, tenant.address)
      ).to.be.reverted;

      await expect(
        jeonseVault.connect(deployer).emergencyWithdraw(1, tenant.address)
      ).to.emit(jeonseVault, "EmergencyWithdrawal");
    });
  });

  describe("Statistics and Queries", function () {
    beforeEach(async function () {
      const endDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
      
      // Create multiple deposits
      await jeonseVault.connect(tenant).createDeposit(
        landlord.address,
        endDate,
        PROPERTY_ID,
        PROPERTY_ADDRESS,
        false,
        { value: DEPOSIT_AMOUNT }
      );

      await jeonseVault.connect(tenant).createDeposit(
        landlord.address,
        endDate,
        PROPERTY_ID + "2",
        PROPERTY_ADDRESS + " 2호",
        true,
        { value: DEPOSIT_AMOUNT }
      );
    });

    it("Should return correct user deposits", async function () {
      const userDeposits = await jeonseVault.getUserDeposits(tenant.address);
      expect(userDeposits.length).to.equal(2);
      expect(userDeposits[0]).to.equal(1);
      expect(userDeposits[1]).to.equal(2);
    });

    it("Should return deposits by status", async function () {
      const activeDeposits = await jeonseVault.getDepositsByStatus(0); // Active
      expect(activeDeposits.length).to.equal(2);
    });

    it("Should track total value locked correctly", async function () {
      expect(await jeonseVault.totalValueLocked()).to.equal(DEPOSIT_AMOUNT * BigInt(2));
    });
  });
});
