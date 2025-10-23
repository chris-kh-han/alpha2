# Linear.app 테마 - 크롤링 및 디자인 시스템

Linear.app 웹사이트에서 추출한 디자인 시스템과 테마 데이터입니다.

## 📁 파일 구조

```
├── linear-theme.json          # 완전한 테마 데이터 (JSON 형식)
├── tailwind-linear.config.js  # Tailwind CSS 설정 파일
├── styles/linear-theme.css    # CSS 변수 및 글로벌 스타일
└── components/LinearComponents.jsx  # React 컴포넌트 예시
```

## 🎨 테마 특징

### 색상 시스템
- **Primary Scale**: 다크 테마 기반 그레이스케일 (50~950)
- **Accent Colors**: Linear의 시그니처 퍼플/블루 컬러
- **Semantic Colors**: 성공, 경고, 에러, 정보 색상
- **Background**: 다층 배경 시스템 (primary ~ quaternary)

### 타이포그래피
- **Primary Font**: Inter Variable + SF Pro Display
- **Monospace**: Berkeley Mono
- **크기**: xs (11px) ~ 8xl (72px)
- **가중치**: Light (300) ~ Bold (680)

### 디자인 토큰
- **간격**: 0px ~ 160px (체계적인 스케일)
- **모서리**: 4px ~ 30px + full (9999px)
- **그림자**: 4단계 + 스택형 그림자
- **애니메이션**: 이징 함수 및 지속 시간

## 🚀 사용 방법

### 1. Tailwind CSS 설정

```bash
# 기존 tailwind.config.js를 백업하고 대체
cp tailwind.config.ts tailwind.config.backup.ts
cp tailwind-linear.config.js tailwind.config.js
```

### 2. CSS 변수 사용

```css
/* globals.css에 추가 */
@import './styles/linear-theme.css';
```

### 3. React 컴포넌트 사용

```jsx
import { 
  LinearButton, 
  LinearCard, 
  LinearInput,
  LinearNavbar,
  StatusBadge 
} from './components/LinearComponents';

function App() {
  return (
    <div className="bg-background-primary min-h-screen">
      <LinearNavbar>
        <h1 className="text-text-primary font-semibold">My App</h1>
      </LinearNavbar>
      
      <div className="pt-16 p-6">
        <LinearCard>
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Welcome
          </h2>
          
          <LinearInput 
            label="Email"
            placeholder="Enter your email"
          />
          
          <div className="mt-4 space-x-2">
            <LinearButton variant="primary">
              Get Started
            </LinearButton>
            <LinearButton variant="secondary">
              Learn More
            </LinearButton>
          </div>
          
          <StatusBadge status="success" className="mt-4">
            Active
          </StatusBadge>
        </LinearCard>
      </div>
    </div>
  );
}
```

## 🎯 주요 컴포넌트

### LinearButton
- `variant`: primary, secondary, ghost
- `size`: sm, md, lg
- 자동 포커스 링 및 호버 효과

### LinearCard
- 다크 테마 배경
- 그림자 및 테두리 효과
- 반응형 패딩

### LinearInput
- 라벨 및 에러 상태 지원
- 포커스 애니메이션
- 플레이스홀더 스타일링

### StatusBadge
- success, warning, error, info, neutral 상태
- 반투명 배경 및 테두리

## 🌙 다크 테마

이 테마는 Linear.app의 다크 모드를 기반으로 제작되었습니다:

- **배경**: 매우 어두운 그레이 (#08090a)
- **텍스트**: 높은 대비의 밝은 색상
- **액센트**: 보라/파란 계열 색상
- **글래스모피즘**: 반투명 효과 및 블러

## 📱 반응형 디자인

```css
/* 브레이크포인트 */
sm: 640px   /* 모바일 */
md: 768px   /* 태블릿 */
lg: 1024px  /* 데스크톱 */
xl: 1280px  /* 대형 화면 */
2xl: 1536px /* 초대형 화면 */
```

## ✨ 특수 효과

### 글래스모피즘
```css
.glass {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### 그림자 스택
```css
.shadow-stack {
  box-shadow: 
    rgba(0, 0, 0, 0) 0px 8px 2px 0px,
    rgba(0, 0, 0, 0.01) 0px 5px 2px 0px,
    rgba(0, 0, 0, 0.04) 0px 3px 2px 0px,
    rgba(0, 0, 0, 0.07) 0px 1px 1px 0px,
    rgba(0, 0, 0, 0.08) 0px 0px 1px 0px;
}
```

## 🔧 커스터마이징

### 색상 변경
`linear-theme.json` 파일에서 원하는 색상 값을 수정하고, CSS 변수를 업데이트하세요.

### 새로운 컴포넌트 추가
`LinearComponents.jsx`를 참고하여 동일한 디자인 패턴을 따르는 새 컴포넌트를 만드세요.

### 애니메이션 추가
CSS 변수의 이징 함수를 사용하여 일관된 애니메이션을 적용하세요.

## 📊 추출된 데이터

이 테마는 Playwright를 사용해 Linear.app 웹사이트에서 실제 CSS 속성을 추출한 데이터를 기반으로 합니다:

- ✅ 색상 팔레트 (45+ 색상 추출)
- ✅ 폰트 시스템 (Inter Variable + Berkeley Mono)
- ✅ 간격 시스템 (50+ 값 추출)
- ✅ 그림자 효과 (5가지 스타일)
- ✅ 애니메이션 곡선
- ✅ CSS 변수 (200+ 변수 추출)

## 🤝 기여하기

버그를 발견하거나 개선 사항이 있다면 이슈를 등록하거나 PR을 보내주세요.

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. Linear.app의 디자인을 참고했으나, 독립적인 구현입니다.