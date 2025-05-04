---
title: Azure Static Web App 구조 오류 분석 및 개선 계획
date: 2025-05-04
category: 결과보고서
tags: [azure, staticwebapp, 오류분석]
---

## 문제 파악 및 원인 분석

Azure Static Web Apps 배포에서 발생한 주요 문제점들:

1. **경로 설정 오류**: 
   - `app_location`과 `output_location` 경로 불일치
   - 상대 경로/절대 경로 혼용으로 인한 빌드 결과물 찾기 실패

2. **GitHub Actions 워크플로우 삭제**:
   - `.github/workflows/azure-static-web-apps-taxcredit-visual.yml` 파일이 삭제됨
   - 자동 배포 파이프라인 중단 상태

3. **구조적 불일치**:
   - React 앱은 `my-app/` 폴더에 위치하나 경로 설정 오해
   - 빌드 결과물(`build/`)은 `app_location` 기준 상대 경로로 인식되어야 함

## 개선 계획

1. **워크플로우 파일 재생성**: 
   - 올바른 경로 설정으로 GitHub Actions 워크플로우 재구성
   - `app_location: "my-app"`, `output_location: "build"` 설정 적용

2. **구조 정책 명확화**:
   - `output_location`은 항상 `app_location` 기준 상대 경로로 설정
   - 루트에서 `my-app/` 내부로 빌드 명령 실행 경로 조정

3. **설정 파일 검증**:
   - `staticwebapp.config.json` 파일 위치 확인 및 필요시 수정
   - 토큰 및 인증 설정 검증

## 다음 단계

1. GitHub Actions 워크플로우 파일 재생성
2. 경로 설정 검증 및 수정
3. 빌드/배포 테스트 실행
4. 지속적인 모니터링 체계 구축
