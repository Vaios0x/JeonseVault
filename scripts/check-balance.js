#!/usr/bin/env node

/**
 * Script para verificar el balance de la cuenta deployer
 * 
 * @author JeonseVault Team
 * @version 1.0.0
 */

const { ethers } = require('hardhat');

async function main() {
  try {
    // Obtener el signer
    const [deployer] = await ethers.getSigners();
    
    // Obtener el balance
    const balance = await deployer.provider.getBalance(deployer.address);
    const balanceInEth = ethers.formatEther(balance);
    
    console.log(`👤 Dirección del deployer: ${deployer.address}`);
    console.log(`💰 Balance: ${balanceInEth} ETH (${balance} wei)`);
    
    // Verificar si tiene suficiente balance para el despliegue
    const estimatedGas = 5000000n; // Estimación conservadora
    const gasPrice = await deployer.provider.getFeeData();
    const estimatedCost = estimatedGas * gasPrice.gasPrice;
    const estimatedCostInEth = ethers.formatEther(estimatedCost);
    
    console.log(`⛽ Gas Price: ${ethers.formatUnits(gasPrice.gasPrice, 'gwei')} Gwei`);
    console.log(`💸 Costo estimado del despliegue: ${estimatedCostInEth} ETH`);
    
    if (balance > estimatedCost) {
      console.log('✅ Balance suficiente para el despliegue');
    } else {
      console.log('❌ Balance insuficiente para el despliegue');
      console.log(`   Necesitas al menos ${estimatedCostInEth} ETH`);
    }
    
    return balanceInEth;
    
  } catch (error) {
    console.error('❌ Error verificando balance:', error.message);
    throw error;
  }
}

// Ejecutar script
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main };
