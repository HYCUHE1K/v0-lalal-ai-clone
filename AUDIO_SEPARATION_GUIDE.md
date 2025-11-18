# 음원 분리 기능 상세 가이드

## Demucs 모델 소개

이 애플리케이션은 Meta (Facebook Research)에서 개발한 **Hybrid Demucs** 모델을 사용합니다. 이는 현재 가장 우수한 성능을 보이는 음원 분리 모델 중 하나입니다.

## 처리 과정

1. **파일 업로드**: 사용자가 음원 파일을 업로드하면 Vercel Blob에 저장됩니다
2. **전처리**: 
   - 샘플링 레이트 변환 (44.1kHz로 통일)
   - 모노 → 스테레오 변환 (필요시)
3. **AI 분리**: Demucs 모델이 4개의 기본 스템으로 분리
   - Drums (드럼)
   - Bass (베이스)
   - Other (기타 악기)
   - Vocals (보컬)
4. **후처리**: 요청된 스템 조합 생성
   - Instrumental = Drums + Bass + Other
5. **업로드**: 분리된 스템을 Vercel Blob에 저장
6. **전달**: 사용자에게 다운로드 링크 제공

## 스템 매핑

| 사용자 요청 | 모델 출력 | 설명 |
|-----------|---------|------|
| Vocals | Vocals | 보컬 트랙 |
| Instrumental | Drums + Bass + Other | 보컬 제외 모든 악기 |
| Drums | Drums | 드럼만 |
| Bass | Bass | 베이스만 |
| Guitar/Piano/Other | Other | 기타 악기들 |

## 성능 벤치마크

**CPU 처리 시간** (Intel i7):
- 3분 음원: 약 2-3분
- 5분 음원: 약 4-6분

**GPU 처리 시간** (NVIDIA RTX 3080):
- 3분 음원: 약 30-45초
- 5분 음원: 약 60-90초

## 품질 설정

현재는 **HDEMUCS_HIGH_MUSDB_PLUS** 모델을 사용합니다:
- 최고 품질의 분리 결과
- 처리 시간이 다소 소요됨
- 대부분의 음악 장르에서 우수한 성능

## 제한사항

1. **파일 크기**: 최대 100MB 권장
2. **처리 시간**: 긴 파일은 시간이 오래 걸릴 수 있음
3. **동시 처리**: 서버 리소스에 따라 제한됨
4. **모델 다운로드**: 첫 실행 시 약 2GB 모델 다운로드 필요

## 트러블슈팅

### 문제: "Python script failed"
**해결**: Python 3.8+ 및 필요한 패키지가 설치되어 있는지 확인

\`\`\`bash
python3 --version
pip install -r requirements.txt
\`\`\`

### 문제: "CUDA out of memory"
**해결**: GPU 메모리 부족. CPU 모드로 실행되거나 더 짧은 파일 사용

### 문제: 처리가 너무 느림
**해결**: 
1. GPU가 있다면 CUDA 버전의 PyTorch 설치
2. 파일 길이를 5분 이하로 제한
3. 더 작은 모델 사용 고려

## API 엔드포인트

### POST /api/upload
파일을 업로드하고 Blob URL을 반환합니다.

**Request Body**: FormData with 'file'

**Response**:
\`\`\`json
{
  "url": "https://blob.vercel-storage.com/...",
  "filename": "audio.mp3"
}
\`\`\`

### POST /api/process
음원 분리 작업을 시작합니다.

**Request Body**:
\`\`\`json
{
  "jobId": "unique-job-id",
  "fileUrl": "https://blob.vercel-storage.com/...",
  "stems": ["vocals", "instrumental"]
}
\`\`\`

**Response**:
\`\`\`json
{
  "jobId": "unique-job-id",
  "status": "processing"
}
\`\`\`

### GET /api/process?jobId={id}
작업 상태를 조회합니다.

**Response**:
\`\`\`json
{
  "status": "completed",
  "progress": 100,
  "results": [
    {
      "stem": "vocals",
      "url": "https://blob.vercel-storage.com/..."
    },
    {
      "stem": "instrumental",
      "url": "https://blob.vercel-storage.com/..."
    }
  ]
}
\`\`\`

## 향후 개선사항

- [ ] 다중 파일 배치 처리
- [ ] 처리 큐 시스템 (Redis Queue)
- [ ] 실시간 진행률 업데이트 (WebSocket)
- [ ] 더 많은 스템 옵션 (10-stem 분리)
- [ ] 음질 선택 옵션
- [ ] 처리 기록 저장
