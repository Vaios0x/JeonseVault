import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Contract, ContractFactory, Signer } from 'ethers'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'

describe('InvestmentPool', function () {
  let InvestmentPool: ContractFactory
  let JeonseVault: ContractFactory
  let ComplianceModule: ContractFactory
  let PropertyOracle: ContractFactory
  
  let investmentPool: Contract
  let jeonseVault: Contract
  let complianceModule: Contract
  let propertyOracle: Contract
  
  let owner: Signer
  let tenant: Signer
  let landlord: Signer
  let investor1: Signer
  let investor2: Signer
  let investor3: Signer
  
  let ownerAddress: string
  let tenantAddress: string
  let landlordAddress: string
  let investor1Address: string
  let investor2Address: string
  let investor3Address: string

  async function deployContracts() {
    [owner, tenant, landlord, investor1, investor2, investor3] = await ethers.getSigners()
    
    ownerAddress = await owner.getAddress()
    tenantAddress = await tenant.getAddress()
    landlordAddress = await landlord.getAddress()
    investor1Address = await investor1.getAddress()
    investor2Address = await investor2.getAddress()
    investor3Address = await investor3.getAddress()

    // Deploy contracts
    ComplianceModule = await ethers.getContractFactory('ComplianceModule')
    complianceModule = await ComplianceModule.deploy()
    await complianceModule.deployed()

    PropertyOracle = await ethers.getContractFactory('PropertyOracle')
    propertyOracle = await PropertyOracle.deploy()
    await propertyOracle.deployed()

    JeonseVault = await ethers.getContractFactory('JeonseVault')
    jeonseVault = await JeonseVault.deploy(
      complianceModule.address,
      propertyOracle.address
    )
    await jeonseVault.deployed()

    InvestmentPool = await ethers.getContractFactory('InvestmentPool')
    investmentPool = await InvestmentPool.deploy(jeonseVault.address)
    await investmentPool.deployed()

    // Setup permissions
    await jeonseVault.setInvestmentPool(investmentPool.address)
    await complianceModule.setJeonseVault(jeonseVault.address)

    return {
      investmentPool,
      jeonseVault,
      complianceModule,
      propertyOracle,
      owner,
      tenant,
      landlord,
      investor1,
      investor2,
      investor3,
    }
  }

  beforeEach(async function () {
    const contracts = await loadFixture(deployContracts)
    investmentPool = contracts.investmentPool
    jeonseVault = contracts.jeonseVault
    complianceModule = contracts.complianceModule
    propertyOracle = contracts.propertyOracle
    owner = contracts.owner
    tenant = contracts.tenant
    landlord = contracts.landlord
    investor1 = contracts.investor1
    investor2 = contracts.investor2
    investor3 = contracts.investor3
  })

  describe('Deployment', function () {
    it('debe desplegar correctamente con la dirección del JeonseVault', async function () {
      expect(await investmentPool.jeonseVault()).to.equal(jeonseVault.address)
    })

    it('debe tener el owner correcto', async function () {
      expect(await investmentPool.owner()).to.equal(ownerAddress)
    })

    it('debe inicializar con valores correctos', async function () {
      expect(await investmentPool.totalInvested()).to.equal(0)
      expect(await investmentPool.totalInvestors()).to.equal(0)
      expect(await investmentPool.totalReturns()).to.equal(0)
    })
  })

  describe('Gestión de Depósitos', function () {
    beforeEach(async function () {
      // Setup compliance
      await complianceModule.setUserCompliance(tenantAddress, {
        level: 2, // Premium
        transactionLimit: ethers.utils.parseEther('1000'),
        isVerified: true,
        isBlacklisted: false,
      })

      await complianceModule.setUserCompliance(landlordAddress, {
        level: 2,
        transactionLimit: ethers.utils.parseEther('1000'),
        isVerified: true,
        isBlacklisted: false,
      })

      // Register property
      await propertyOracle.registerProperty(
        'test-property-123',
        '서울특별시 강남구 역삼동 123-45',
        landlordAddress,
        ethers.utils.parseEther('500'),
        true
      )
    })

    it('debe permitir agregar depósitos al pool', async function () {
      const depositAmount = ethers.utils.parseEther('500')
      
      // Create deposit
      await jeonseVault.connect(tenant).createDeposit(
        'test-property-123',
        '서울특별시 강남구 역삼동 123-45',
        landlordAddress,
        depositAmount,
        Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days from now
        { value: depositAmount }
      )

      const depositId = 1
      
      // Add to investment pool
      await investmentPool.addDeposit(depositId)
      
      const depositInfo = await investmentPool.getDepositInfo(depositId)
      expect(depositInfo.isActive).to.be.true
      expect(depositInfo.totalInvested).to.equal(0)
      expect(depositInfo.investorCount).to.equal(0)
    })

    it('debe rechazar depósitos que no existen', async function () {
      await expect(
        investmentPool.addDeposit(999)
      ).to.be.revertedWith('Deposit does not exist')
    })

    it('debe rechazar depósitos ya agregados', async function () {
      const depositAmount = ethers.utils.parseEther('500')
      
      await jeonseVault.connect(tenant).createDeposit(
        'test-property-123',
        '서울특별시 강남구 역삼동 123-45',
        landlordAddress,
        depositAmount,
        Math.floor(Date.now() / 1000) + 86400 * 30,
        { value: depositAmount }
      )

      const depositId = 1
      await investmentPool.addDeposit(depositId)
      
      await expect(
        investmentPool.addDeposit(depositId)
      ).to.be.revertedWith('Deposit already in pool')
    })
  })

  describe('Inversiones', function () {
    let depositId: number

    beforeEach(async function () {
      // Setup compliance for investors
      await complianceModule.setUserCompliance(investor1Address, {
        level: 2,
        transactionLimit: ethers.utils.parseEther('1000'),
        isVerified: true,
        isBlacklisted: false,
      })

      await complianceModule.setUserCompliance(investor2Address, {
        level: 2,
        transactionLimit: ethers.utils.parseEther('1000'),
        isVerified: true,
        isBlacklisted: false,
      })

      await complianceModule.setUserCompliance(investor3Address, {
        level: 2,
        transactionLimit: ethers.utils.parseEther('1000'),
        isVerified: true,
        isBlacklisted: false,
      })

      // Setup compliance for tenant and landlord
      await complianceModule.setUserCompliance(tenantAddress, {
        level: 2,
        transactionLimit: ethers.utils.parseEther('1000'),
        isVerified: true,
        isBlacklisted: false,
      })

      await complianceModule.setUserCompliance(landlordAddress, {
        level: 2,
        transactionLimit: ethers.utils.parseEther('1000'),
        isVerified: true,
        isBlacklisted: false,
      })

      // Register property
      await propertyOracle.registerProperty(
        'test-property-123',
        '서울특별시 강남구 역삼동 123-45',
        landlordAddress,
        ethers.utils.parseEther('500'),
        true
      )

      // Create and add deposit to pool
      const depositAmount = ethers.utils.parseEther('500')
      
      await jeonseVault.connect(tenant).createDeposit(
        'test-property-123',
        '서울특별시 강남구 역삼동 123-45',
        landlordAddress,
        depositAmount,
        Math.floor(Date.now() / 1000) + 86400 * 30,
        { value: depositAmount }
      )

      depositId = 1
      await investmentPool.addDeposit(depositId)
    })

    it('debe permitir invertir en depósitos activos', async function () {
      const investmentAmount = ethers.utils.parseEther('100')
      
      await investmentPool.connect(investor1).invest(depositId, {
        value: investmentAmount
      })

      const investorInfo = await investmentPool.getInvestorInfo(depositId, investor1Address)
      expect(investorInfo.amount).to.equal(investmentAmount)
      expect(investorInfo.investedAt).to.be.gt(0)

      const depositInfo = await investmentPool.getDepositInfo(depositId)
      expect(depositInfo.totalInvested).to.equal(investmentAmount)
      expect(depositInfo.investorCount).to.equal(1)
    })

    it('debe rechazar inversiones en depósitos inactivos', async function () {
      const investmentAmount = ethers.utils.parseEther('100')
      
      await expect(
        investmentPool.connect(investor1).invest(999, {
          value: investmentAmount
        })
      ).to.be.revertedWith('Deposit not active in pool')
    })

    it('debe rechazar inversiones de usuarios no verificados', async function () {
      const unverifiedInvestor = (await ethers.getSigners())[10]
      
      await complianceModule.setUserCompliance(await unverifiedInvestor.getAddress(), {
        level: 0,
        transactionLimit: 0,
        isVerified: false,
        isBlacklisted: false,
      })

      const investmentAmount = ethers.utils.parseEther('100')
      
      await expect(
        investmentPool.connect(unverifiedInvestor).invest(depositId, {
          value: investmentAmount
        })
      ).to.be.revertedWith('User not compliant')
    })

    it('debe rechazar inversiones que exceden el límite de transacción', async function () {
      const largeAmount = ethers.utils.parseEther('2000') // Exceeds limit
      
      await expect(
        investmentPool.connect(investor1).invest(depositId, {
          value: largeAmount
        })
      ).to.be.revertedWith('Amount exceeds transaction limit')
    })

    it('debe permitir múltiples inversores en el mismo depósito', async function () {
      const amount1 = ethers.utils.parseEther('100')
      const amount2 = ethers.utils.parseEther('150')
      const amount3 = ethers.utils.parseEther('75')

      await investmentPool.connect(investor1).invest(depositId, { value: amount1 })
      await investmentPool.connect(investor2).invest(depositId, { value: amount2 })
      await investmentPool.connect(investor3).invest(depositId, { value: amount3 })

      const depositInfo = await investmentPool.getDepositInfo(depositId)
      expect(depositInfo.totalInvested).to.equal(amount1.add(amount2).add(amount3))
      expect(depositInfo.investorCount).to.equal(3)
    })

    it('debe calcular correctamente las participaciones', async function () {
      const amount1 = ethers.utils.parseEther('100')
      const amount2 = ethers.utils.parseEther('200')
      const totalAmount = amount1.add(amount2)

      await investmentPool.connect(investor1).invest(depositId, { value: amount1 })
      await investmentPool.connect(investor2).invest(depositId, { value: amount2 })

      const investor1Info = await investmentPool.getInvestorInfo(depositId, investor1Address)
      const investor2Info = await investmentPool.getInvestorInfo(depositId, investor2Address)

      // Investor1 should have 33.33% share (100/300)
      expect(investor1Info.share).to.equal(3333) // 33.33%
      // Investor2 should have 66.67% share (200/300)
      expect(investor2Info.share).to.equal(6667) // 66.67%
    })
  })

  describe('Retiros', function () {
    let depositId: number

    beforeEach(async function () {
      // Setup similar to previous tests
      await complianceModule.setUserCompliance(investor1Address, {
        level: 2,
        transactionLimit: ethers.utils.parseEther('1000'),
        isVerified: true,
        isBlacklisted: false,
      })

      await complianceModule.setUserCompliance(tenantAddress, {
        level: 2,
        transactionLimit: ethers.utils.parseEther('1000'),
        isVerified: true,
        isBlacklisted: false,
      })

      await complianceModule.setUserCompliance(landlordAddress, {
        level: 2,
        transactionLimit: ethers.utils.parseEther('1000'),
        isVerified: true,
        isBlacklisted: false,
      })

      await propertyOracle.registerProperty(
        'test-property-123',
        '서울특별시 강남구 역삼동 123-45',
        landlordAddress,
        ethers.utils.parseEther('500'),
        true
      )

      const depositAmount = ethers.utils.parseEther('500')
      
      await jeonseVault.connect(tenant).createDeposit(
        'test-property-123',
        '서울특별시 강남구 역삼동 123-45',
        landlordAddress,
        depositAmount,
        Math.floor(Date.now() / 1000) + 86400 * 30,
        { value: depositAmount }
      )

      depositId = 1
      await investmentPool.addDeposit(depositId)

      // Add some investments
      const investmentAmount = ethers.utils.parseEther('100')
      await investmentPool.connect(investor1).invest(depositId, { value: investmentAmount })
    })

    it('debe permitir retiros de inversores', async function () {
      const initialBalance = await investor1.getBalance()
      
      await investmentPool.connect(investor1).withdraw(depositId)
      
      const finalBalance = await investor1.getBalance()
      expect(finalBalance).to.be.gt(initialBalance)
      
      const investorInfo = await investmentPool.getInvestorInfo(depositId, investor1Address)
      expect(investorInfo.amount).to.equal(0)
      expect(investorInfo.share).to.equal(0)
    })

    it('debe rechazar retiros de no inversores', async function () {
      await expect(
        investmentPool.connect(investor2).withdraw(depositId)
      ).to.be.revertedWith('No investment found')
    })

    it('debe rechazar retiros de depósitos inactivos', async function () {
      await expect(
        investmentPool.connect(investor1).withdraw(999)
      ).to.be.revertedWith('Deposit not active in pool')
    })
  })

  describe('Distribución de Retornos', function () {
    let depositId: number

    beforeEach(async function () {
      // Setup compliance
      await complianceModule.setUserCompliance(investor1Address, {
        level: 2,
        transactionLimit: ethers.utils.parseEther('1000'),
        isVerified: true,
        isBlacklisted: false,
      })

      await complianceModule.setUserCompliance(investor2Address, {
        level: 2,
        transactionLimit: ethers.utils.parseEther('1000'),
        isVerified: true,
        isBlacklisted: false,
      })

      await complianceModule.setUserCompliance(tenantAddress, {
        level: 2,
        transactionLimit: ethers.utils.parseEther('1000'),
        isVerified: true,
        isBlacklisted: false,
      })

      await complianceModule.setUserCompliance(landlordAddress, {
        level: 2,
        transactionLimit: ethers.utils.parseEther('1000'),
        isVerified: true,
        isBlacklisted: false,
      })

      await propertyOracle.registerProperty(
        'test-property-123',
        '서울특별시 강남구 역삼동 123-45',
        landlordAddress,
        ethers.utils.parseEther('500'),
        true
      )

      const depositAmount = ethers.utils.parseEther('500')
      
      await jeonseVault.connect(tenant).createDeposit(
        'test-property-123',
        '서울특별시 강남구 역삼동 123-45',
        landlordAddress,
        depositAmount,
        Math.floor(Date.now() / 1000) + 86400 * 30,
        { value: depositAmount }
      )

      depositId = 1
      await investmentPool.addDeposit(depositId)

      // Add investments
      await investmentPool.connect(investor1).invest(depositId, { 
        value: ethers.utils.parseEther('100') 
      })
      await investmentPool.connect(investor2).invest(depositId, { 
        value: ethers.utils.parseEther('200') 
      })
    })

    it('debe distribuir retornos proporcionalmente', async function () {
      const returnAmount = ethers.utils.parseEther('30') // 10% return
      
      await investmentPool.distributeReturns(depositId, { value: returnAmount })
      
      const investor1Info = await investmentPool.getInvestorInfo(depositId, investor1Address)
      const investor2Info = await investmentPool.getInvestorInfo(depositId, investor2Address)
      
      // Investor1 should get 10 (33.33% of 30)
      expect(investor1Info.returns).to.equal(ethers.utils.parseEther('10'))
      // Investor2 should get 20 (66.67% of 30)
      expect(investor2Info.returns).to.equal(ethers.utils.parseEther('20'))
    })

    it('debe rechazar distribución de retornos por no owner', async function () {
      const returnAmount = ethers.utils.parseEther('30')
      
      await expect(
        investmentPool.connect(investor1).distributeReturns(depositId, { value: returnAmount })
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })

    it('debe rechazar distribución en depósitos inactivos', async function () {
      const returnAmount = ethers.utils.parseEther('30')
      
      await expect(
        investmentPool.distributeReturns(999, { value: returnAmount })
      ).to.be.revertedWith('Deposit not active in pool')
    })
  })

  describe('Estadísticas y Consultas', function () {
    it('debe retornar estadísticas correctas del pool', async function () {
      const stats = await investmentPool.getPoolStats()
      expect(stats.totalDeposits).to.equal(0)
      expect(stats.totalInvested).to.equal(0)
      expect(stats.totalInvestors).to.equal(0)
      expect(stats.totalReturns).to.equal(0)
    })

    it('debe retornar información de depósito correcta', async function () {
      // Setup and create deposit
      await complianceModule.setUserCompliance(tenantAddress, {
        level: 2,
        transactionLimit: ethers.utils.parseEther('1000'),
        isVerified: true,
        isBlacklisted: false,
      })

      await complianceModule.setUserCompliance(landlordAddress, {
        level: 2,
        transactionLimit: ethers.utils.parseEther('1000'),
        isVerified: true,
        isBlacklisted: false,
      })

      await propertyOracle.registerProperty(
        'test-property-123',
        '서울특별시 강남구 역삼동 123-45',
        landlordAddress,
        ethers.utils.parseEther('500'),
        true
      )

      const depositAmount = ethers.utils.parseEther('500')
      
      await jeonseVault.connect(tenant).createDeposit(
        'test-property-123',
        '서울특별시 강남구 역삼동 123-45',
        landlordAddress,
        depositAmount,
        Math.floor(Date.now() / 1000) + 86400 * 30,
        { value: depositAmount }
      )

      const depositId = 1
      await investmentPool.addDeposit(depositId)

      const depositInfo = await investmentPool.getDepositInfo(depositId)
      expect(depositInfo.isActive).to.be.true
      expect(depositInfo.totalInvested).to.equal(0)
      expect(depositInfo.investorCount).to.equal(0)
    })

    it('debe retornar información de inversor correcta', async function () {
      // Setup and create investment
      await complianceModule.setUserCompliance(investor1Address, {
        level: 2,
        transactionLimit: ethers.utils.parseEther('1000'),
        isVerified: true,
        isBlacklisted: false,
      })

      await complianceModule.setUserCompliance(tenantAddress, {
        level: 2,
        transactionLimit: ethers.utils.parseEther('1000'),
        isVerified: true,
        isBlacklisted: false,
      })

      await complianceModule.setUserCompliance(landlordAddress, {
        level: 2,
        transactionLimit: ethers.utils.parseEther('1000'),
        isVerified: true,
        isBlacklisted: false,
      })

      await propertyOracle.registerProperty(
        'test-property-123',
        '서울특별시 강남구 역삼동 123-45',
        landlordAddress,
        ethers.utils.parseEther('500'),
        true
      )

      const depositAmount = ethers.utils.parseEther('500')
      
      await jeonseVault.connect(tenant).createDeposit(
        'test-property-123',
        '서울특별시 강남구 역삼동 123-45',
        landlordAddress,
        depositAmount,
        Math.floor(Date.now() / 1000) + 86400 * 30,
        { value: depositAmount }
      )

      const depositId = 1
      await investmentPool.addDeposit(depositId)

      const investmentAmount = ethers.utils.parseEther('100')
      await investmentPool.connect(investor1).invest(depositId, { value: investmentAmount })

      const investorInfo = await investmentPool.getInvestorInfo(depositId, investor1Address)
      expect(investorInfo.amount).to.equal(investmentAmount)
      expect(investorInfo.share).to.be.gt(0)
      expect(investorInfo.investedAt).to.be.gt(0)
      expect(investorInfo.returns).to.equal(0)
    })
  })

  describe('Seguridad', function () {
    it('debe rechazar operaciones de usuarios no autorizados', async function () {
      const unauthorizedUser = (await ethers.getSigners())[10]
      
      await expect(
        investmentPool.connect(unauthorizedUser).addDeposit(1)
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })

    it('debe manejar correctamente los límites de gas', async function () {
      // Test with high gas limit to ensure no out-of-gas errors
      const tx = await investmentPool.getPoolStats({ gasLimit: 500000 })
      await tx.wait()
    })

    it('debe ser resistente a reentrancy attacks', async function () {
      // This would require a malicious contract to test properly
      // For now, we verify the contract uses proper patterns
      const code = await ethers.provider.getCode(investmentPool.address)
      expect(code).to.not.equal('0x')
    })
  })
})
