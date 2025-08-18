# 🚀 JeonseVault 배포 가이드

이 가이드는 JeonseVault 프로젝트를 Kaia 테스트넷에 배포하는 방법을 단계별로 설명합니다.

## 📋 사전 준비사항

### 1. 필수 도구 설치
```bash
# Node.js (v18 이상)
node --version

# npm 또는 yarn
npm --version

# Git
git --version
```

### 2. Kaia 테스트넷 준비
- **Kaia 지갑** 설정 (MetaMask 또는 Kaikas)
- **테스트넷 KAIA** 토큰 확보 ([Kaia Faucet](https://faucet.kaia.io))
- **네트워크 설정**:
  - RPC URL: `https://public-en-kairos.node.kaia.io`
  - Chain ID: `1001`
  - Currency Symbol: `KAIA`

## 🏗️ 프로젝트 설정

### 1. 저장소 클론 및 설정
```bash
# 저장소 클론
git clone <repository-url>
cd jeonse-vault

# 종속성 설치
npm install

# 환경 변수 설정
cp env.example .env.local
```

### 2. 환경 변수 구성
`.env.local` 파일을 편집하여 다음 값들을 설정하세요:

```bash
# 블록체인 설정
PRIVATE_KEY=your_wallet_private_key_here
NEXT_PUBLIC_KAIA_RPC_URL=https://public-en-kairos.node.kaia.io
NEXT_PUBLIC_CHAIN_ID=1001

# 애플리케이션 설정
NEXT_PUBLIC_APP_NAME=JeonseVault
NEXT_PUBLIC_APP_DESCRIPTION=혁신적인 전세 보증금 스마트 컨트랙트 플랫폼

# 개발 설정
NODE_ENV=development
REPORT_GAS=true
```

## 📝 스마트 컨트랙트 배포

### 1. 컨트랙트 컴파일
```bash
# Solidity 컨트랙트 컴파일
npm run compile

# 컴파일 결과 확인
ls artifacts/contracts/
```

### 2. 테스트 실행
```bash
# 로컬 테스트 실행
npm test

# 가스 리포트와 함께 테스트
REPORT_GAS=true npm test
```

### 3. Kaia 테스트넷 배포
```bash
# Kairos 테스트넷에 배포
npm run deploy:kairos

# 배포 결과 확인
ls deployments/
```

배포가 완료되면 다음과 같은 출력을 확인할 수 있습니다:
```
✅ PropertyOracle deployed to: 0x...
✅ ComplianceModule deployed to: 0x...
✅ InvestmentPool deployed to: 0x...
✅ JeonseVault deployed to: 0x...
```

### 4. 컨트랙트 검증 (선택사항)
```bash
# 배포된 컨트랙트 검증
npm run verify

# 개별 컨트랙트 검증
npx hardhat verify --network kairos <CONTRACT_ADDRESS>
```

## 🌐 프론트엔드 배포

### 1. 컨트랙트 주소 업데이트
배포된 컨트랙트 주소를 `.env.local`에 추가:

```bash
# 배포된 컨트랙트 주소 (배포 후 업데이트)
NEXT_PUBLIC_JEONSE_VAULT_ADDRESS=0x...
NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS=0x...
NEXT_PUBLIC_PROPERTY_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS=0x...
```

### 2. 로컬 개발 서버 시작
```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 확인
open http://localhost:3000
```

### 3. 프로덕션 빌드 및 배포

#### Vercel 배포
```bash
# Vercel CLI 설치
npm install -g vercel

# Vercel에 배포
vercel

# 환경 변수 설정
vercel env add NEXT_PUBLIC_JEONSE_VAULT_ADDRESS
vercel env add NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS
# ... 기타 환경 변수들
```

#### Netlify 배포
```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 빌드
npm run build

# Netlify에 배포
netlify deploy --prod --dir=.next
```

#### 자체 서버 배포
```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm start
```

## 🔧 데모 데이터 설정

### 1. 테스트 부동산 등록
```bash
# Hardhat 콘솔 실행
npx hardhat console --network kairos

# 부동산 등록 스크립트 실행
const oracle = await ethers.getContractAt("PropertyOracle", "ORACLE_ADDRESS");
await oracle.registerProperty(
  "demo-property-001",
  "서울특별시 강남구 역삼동 101호",
  "LANDLORD_ADDRESS",
  ethers.parseEther("500000000"), // 500M KRW
  0 // Apartment type
);
```

### 2. 테스트 사용자 KYC 인증
```bash
# ComplianceModule을 통한 사용자 인증
const compliance = await ethers.getContractAt("ComplianceModule", "COMPLIANCE_ADDRESS");
await compliance.verifyUser(
  "USER_ADDRESS",
  "테스트 사용자",
  ethers.keccak256(ethers.toUtf8Bytes("test-id")),
  "010-1234-5678",
  "테스트은행 123-456-789",
  2 // Premium level
);
```

## 📊 배포 검증

### 1. 기능 테스트
- [ ] 지갑 연결 기능
- [ ] 보증금 예치 기능
- [ ] 투자 풀 참여 기능
- [ ] 대시보드 접근 기능
- [ ] 모바일 반응형 확인

### 2. 성능 테스트
```bash
# Lighthouse 성능 측정
npx lighthouse https://your-domain.com --output html

# Core Web Vitals 확인
npm run build && npm run start
```

### 3. 보안 검증
- [ ] 환경 변수 보안 확인
- [ ] 스마트 컨트랙트 권한 검증
- [ ] API 엔드포인트 보안 확인

## 🚨 문제 해결

### 자주 발생하는 문제들

#### 1. 배포 실패
```bash
# 가스비 부족
Error: insufficient funds for gas

# 해결방법: 테스트넷 KAIA 토큰 충전
```

#### 2. 컨트랙트 상호작용 실패
```bash
# 네트워크 불일치
Error: network mismatch

# 해결방법: 지갑 네트워크를 Kaia 테스트넷으로 변경
```

#### 3. 빌드 오류
```bash
# 타입 오류
Error: Property 'xxx' does not exist

# 해결방법: TypeScript 타입 정의 확인
npm run compile
```

## 📋 배포 체크리스트

### 배포 전 확인사항
- [ ] 모든 테스트 통과
- [ ] 환경 변수 설정 완료
- [ ] 컨트랙트 컴파일 성공
- [ ] 테스트넷 토큰 충분
- [ ] 지갑 네트워크 설정 확인

### 배포 후 확인사항
- [ ] 컨트랙트 배포 성공
- [ ] 프론트엔드 접속 가능
- [ ] 지갑 연결 작동
- [ ] 기본 기능 테스트 완료
- [ ] 모바일 접근성 확인

## 🔄 업데이트 배포

### 스마트 컨트랙트 업데이트
```bash
# 새 버전 배포
npm run deploy:kairos

# 프론트엔드 컨트랙트 주소 업데이트
# .env.local 파일 수정 후 재배포
```

### 프론트엔드 업데이트
```bash
# Git 변경사항 배포
git add .
git commit -m "feat: 새 기능 추가"
git push origin main

# Vercel 자동 배포 또는 수동 배포
vercel --prod
```

## 📞 지원

배포 과정에서 문제가 발생하면:

1. **문서 확인**: [Kaia 공식 문서](https://docs.kaia.io)
2. **커뮤니티**: [Kaia Discord](https://discord.gg/kaia)
3. **이슈 리포트**: [GitHub Issues](https://github.com/your-org/jeonse-vault/issues)
4. **이메일**: support@jeonsevault.com

---

**성공적인 배포를 위해 단계별로 천천히 진행하세요! 🚀**
