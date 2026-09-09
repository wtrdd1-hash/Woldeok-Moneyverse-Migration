# 스택 단일화와 apps 평탄화

**상태:** 완료 · 2026-09-09

## 무엇이 바뀌었나

`wtrdd1-hash/kuber-infrastructure`에서 (커밋 `c7b5ddc5`):

- `apps/minipc/*` → `apps/*`. 이 리포는 minipc 하나만 다루므로 클러스터별 층이
  아무것도 구분하지 않고 있었다
- `apps/example-app`, `clusters/example` 삭제. 후자는 example-app이 사라지자
  `./apps`, 즉 이 클러스터의 운영 워크로드를 가리키게 됐다
- `apps/minipc/wdmv-test` 삭제 — 격리 테스트 스택 제거
- `clusters/minipc/apps.yaml`의 `path`를 `./apps`로

## prune 안전 확인

Kustomization이 `prune: true`라 푸시 전에 양쪽을 렌더해서 오브젝트를 대조했다.

```
old=60  new=50
사라지는 것 10개: Namespace/wdmv-test 와 그 안의 Deployment 2, StatefulSet 1,
                  Service 3, Ingress 1, LimitRange 1, ResourceQuota 1
새로 생기는 것: 0
```

나머지 50개는 바이트 단위로 동일. 반영 후 확인: Kustomization 5개 Ready,
러닝 파드 36개 유지, 공개 서비스 전부 200.

## 이 리포에서 맞춘 것

문서 여섯 곳이 `apps/minipc/`와 `wdmv-test`를 계속 가리키고 있었다. 그대로 두면
어제 정리한 것과 같은 종류의 어긋남이 다시 생긴다.

- [x] `docs/INFRASTRUCTURE.md` — 표를 운영 단일로, 경로 수정, 테스트 스택 제거 기록
- [x] `AGENTS.md §7` — 동일
- [x] `docs/RELEASING.md` / `.ko.md` — 런타임 계약 표에서 테스트 행 제거,
      「격리 테스트 게이트」 절 삭제, 이후 절 번호 조정(3~8 → 2~7)
- [x] `docs/operations/production-deployment.md` — 테스트 게이트 단계 제거, 번호 조정
- [x] `docs/architecture/deployment-flow.md` — 테스트 네임스페이스·테스트 게이트
      제거, "reviewed PR"을 main 직행으로, 경로 수정, 번호 조정

## 남는 사실

**커밋을 미리 굴려 볼 곳이 이제 없다.** CI와 승격 전 점검이 게이트의 전부다.
문서 세 곳에 그렇게 적었다 — 없는 게이트를 있다고 적어두는 것보다 낫다.

`test.easy-scraping.com`은 404를 반환한다. Cloudflare DNS/터널 항목은 그대로
남아 있으므로, 쓰지 않을 것이면 떼는 편이 낫다.
