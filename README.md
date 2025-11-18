# LALAL.AI Clone - AI 음원 분리 서비스

실제 AI 기반 음원 분리 기능을 제공하는 LALAL.AI 클론 애플리케이션입니다.

## 주요 기능

- 🎵 AI 기반 음원 분리 (Demucs 모델 사용)
- 🎤 보컬, 악기, 드럼, 베이스 등 다양한 스템 추출
- 📤 드래그 앤 드롭 파일 업로드
- ⚡ 실시간 처리 진행 상황 표시
- 🔊 분리된 음원 미리듣기 및 다운로드
- 💾 Vercel Blob을 이용한 파일 저장

## 설치 방법

### 1. Node.js 의존성 설치

\`\`\`bash
npm install
\`\`\`

### 2. Python 환경 설정

Python 3.8 이상이 필요합니다.

\`\`\`bash
# Python 의존성 설치
pip install -r requirements.txt
\`\`\`

**중요**: Demucs 모델은 PyTorch와 torchaudio를 사용합니다. GPU 지원을 원하면 CUDA 버전의 PyTorch를 설치하세요:

\`\`\`bash
# CUDA 11.8 예시
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu118
\`\`\`

### 3. 환경 변수 설정

Vercel Blob 통합이 이미 연결되어 있어야 합니다. `BLOB_READ_WRITE_TOKEN` 환경 변수가 설정되어 있는지 확인하세요.

## 실행 방법

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 http://localhost:3000 을 열어 애플리케이션을 확인하세요.

## 사용 방법

1. **파일 업로드**: 음원 파일을 드래그 앤 드롭하거나 클릭하여 선택
2. **스템 선택**: 추출하고 싶은 음원 요소 선택 (보컬, 악기, 드럼 등)
3. **처리 시작**: "Process Audio" 버튼 클릭
4. **결과 확인**: 처리 완료 후 각 스템 미리듣기 및 다운로드

## 기술 스택

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **AI Model**: Demucs (Hybrid Transformer Demucs)
- **Storage**: Vercel Blob
- **Audio Processing**: PyTorch, torchaudio

## 지원 파일 형식

- MP3
- WAV
- FLAC
- OGG
- M4A

## 추출 가능한 스템

- **Vocals**: 보컬 트랙
- **Instrumental**: 모든 악기 (보컬 제외)
- **Drums**: 드럼
- **Bass**: 베이스
- **Other**: 기타 악기들

## 성능 최적화

- GPU를 사용하면 처리 속도가 크게 향상됩니다
- 첫 실행 시 Demucs 모델을 다운로드하므로 시간이 걸릴 수 있습니다
- 긴 음원은 처리 시간이 더 오래 걸립니다 (약 3-5분)

## 프로덕션 배포

프로덕션 환경에서는:
- 작업 상태를 데이터베이스에 저장 (현재는 메모리 사용)
- 백그라운드 작업 큐 시스템 구현 (Redis Queue 등)
- 파일 크기 및 처리 시간 제한 설정
- 에러 처리 및 로깅 강화

## 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.
