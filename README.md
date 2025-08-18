# JeonseVault 🏠

> **혁신적인 전세 보증금 스마트 컨트랙트 플랫폼**

JeonseVault는 한국의 전세 시스템을 위한 블록체인 기반 에스크로 플랫폼입니다. 스마트 컨트랙트 기술로 전세 보증금을 안전하게 보호하고, 투자 기회를 제공하여 900조원 규모의 전세 시장을 혁신합니다.

## 🎯 프로젝트 개요

- **해커톤**: Korea Stablecoin Hackathon by Kaia, Tether, KakaoPay, LINE NEXT
- **카테고리**: Korean Won Stablecoin Ideathon  
- **배포**: Kaia 테스트넷 (Kairos)
- **대상 사용자**: 한국 세입자, 임대인, 부동산 투자자
- **시장 규모**: KRW 900-1,000조 전세 보증금

## 🚀 주요 기능

### 🔒 스마트 컨트랙트 에스크로
- 전세 보증금을 블록체인에 안전하게 보관
- 자동화된 계약 조건 실행
- 투명하고 검증 가능한 거래

### 💰 투자 기회 제공
- 보증금의 일부를 활용한 분산 투자
- 연 6% 안정적인 수익률 제공
- 소액 투자자도 부동산 시장 참여 가능

### 🛡️ 보안 및 컴플라이언스
- 한국 KYC/AML 규정 준수
- 실명 인증 시스템
- OpenZeppelin 보안 표준 적용

### 📱 PWA 모바일 앱
- 모바일 최적화 사용자 경험
- 오프라인 기능 지원
- 네이티브 앱과 유사한 성능

## 🏗️ 기술 스택

### 블록체인 & 스마트 컨트랙트
```
- Kaia 블록체인 (EVM 호환)
- Solidity ^0.8.19
- OpenZeppelin 계약 v4.9.0
- Hardhat 개발 환경
- Kaia Web3 SDK
```

### 프론트엔드
```
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Wagmi v2 (Web3 연결)
- Viem (블록체인 상호작용)
- React Query (데이터 페칭)
- Framer Motion (애니메이션)
- 한국어 지원 (i18n)
```

### Kaia 특화 통합
```
- Kaia 테스트넷 RPC
- 체인 ID: 1001 (Kairos)
- 가스비 위임 기능
- Kaia Wallet 통합
- KaikasWallet 지원
```

## 📋 스마트 컨트랙트 아키텍처

### 핵심 계약들

1. **JeonseVault.sol** - 메인 에스크로 계약
2. **InvestmentPool.sol** - 분산 투자 풀
3. **PropertyOracle.sol** - 부동산 검증
4. **ComplianceModule.sol** - KYC/AML 컴플라이언스

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone https://github.com/your-org/jeonse-vault
cd jeonse-vault
```

### 2. 종속성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
cp env.example .env.local
# .env.local 파일을 편집하여 필요한 값들을 설정
```

### 4. 스마트 컨트랙트 컴파일
```bash
npm run compile
```

### 5. 로컬 개발 서버 시작
```bash
npm run dev
```

## 🏗️ 배포

### 스마트 컨트랙트 배포 (Kaia 테스트넷)
```bash
# 환경 변수 설정
export PRIVATE_KEY="your_private_key"

# Kaia 테스트넷에 배포
npm run deploy:kairos

# 계약 검증
npm run verify
```

### 프론트엔드 배포
```bash
# 빌드
npm run build

# Vercel/Netlify에 배포
npm run deploy
```

## 📊 시장 분석

- **전세 시장 규모**: 900-1,000조원
- **연간 전세 사기**: 4,000건 이상
- **문제점**: 투명성 부족, 보안 취약, 수익 기회 없음
- **해결책**: 블록체인 에스크로, 분산 투자, 완전한 투명성

## 💡 혁신성

1. **한국 최초** 전세 시스템 블록체인 솔루션
2. **분산 투자** 기능으로 새로운 수익 모델 창출
3. **완전 자동화** 된 에스크로 시스템
4. **규제 준수** 한국 금융 규정 완벽 대응

## 🛡️ 보안

- **스마트 컨트랙트**: OpenZeppelin 보안 표준
- **감사**: 다중 보안 감사 예정
- **KYC/AML**: 한국 규정 준수
- **모니터링**: 24/7 실시간 보안 모니터링

## 📈 수익 모델

1. **에스크로 수수료**: 0.1%
2. **투자 관리 수수료**: 0.5%
3. **조기 해지 수수료**: 1%
4. **플랫폼 수수료**: 거래량 기반

## 🎯 로드맵

### Phase 1 (현재)
- [x] MVP 개발
- [x] Kaia 테스트넷 배포
- [x] 기본 기능 구현

### Phase 2 (2024 Q1)
- [ ] 메인넷 배포
- [ ] 보안 감사
- [ ] 베타 테스트

### Phase 3 (2024 Q2)
- [ ] 공식 런칭
- [ ] 파트너십 확장
- [ ] 기능 고도화

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

- **팀**: JeonseVault Team
- **이메일**: support@jeonsevault.com
- **웹사이트**: https://jeonsevault.com
- **트위터**: [@jeonsevault](https://twitter.com/jeonsevault)

## 🏆 해커톤 제출

이 프로젝트는 Korea Stablecoin Hackathon에 제출되었습니다:
- **카테고리**: Korean Won Stablecoin Ideathon
- **제출 날짜**: 2025년 8월 27일
- **데모**: [라이브 데모 링크]
- **발표 자료**: [피치 덱 링크]

---

## 🌟 특별 감사

- **Kaia Foundation**: 블록체인 인프라 제공
- **Tether**: 스테이블코인 기술 지원
- **KakaoPay**: 한국 결제 시스템 연동
- **LINE NEXT**: Web3 생태계 지원

---

**JeonseVault - 전세 시장의 새로운 혁신** 🚀
