# Serena Workflow for xsfire-camp

Team operating standard for using Serena in `xsfire-camp`.

`xsfire-camp` 저장소에서 Serena를 사용할 때의 팀 표준 운영 문서입니다.

## Glossary
- `Goal`: One-sentence objective with verifiable completion criteria.
- `Rubric`: Evaluation criteria split into `Must` and `Should`.
- `R->P->M->W->A`: Read -> Plan -> Map -> Write -> Assess.
- `Quality Gate`: Required local checks before closing a task.
- `Evidence-backed Must`: each `Must` item cites at least one concrete source
  (repo file path, verification command output, or dated external primary source).

## Execution Contract Alignment (AGENTS.md)
### KR
- 사용자 목적은 고정 Goal로 취급하고, 완료 조건을 검증 가능하게 명시합니다.
- `Must` 항목은 최소 1개의 근거(파일/명령 출력/외부 1차 출처)와 연결합니다.
- 기본 루프는 `Research -> Rubric -> Plan -> Implement -> Verify -> Score -> Next Action`을 따릅니다.
- Serena 루프 `R->P->M->W->A` 매핑:
  - `Research`: `R + M`
  - `Rubric/Plan`: `P`
  - `Implement`: `W`
  - `Verify/Score/Next`: `A` + 보고 포맷
- 일반 진행에서는 handshake 질문(`continue?`, `should I proceed?`)을 하지 않습니다.
- 아래 하드 블로커에서만 1개의 간결한 질문을 합니다.
  - 파괴적/비가역 작업
  - 필수 권한/자격 증명 부재
  - 근거로 결정할 수 없는 제품 선택

### EN
- Treat user purpose as a fixed Goal with verifiable done criteria.
- Every `Must` item must cite at least one concrete source.
- Follow the default loop:
  `Research -> Rubric -> Plan -> Implement -> Verify -> Score -> Next Action`.
- Map the Serena loop as:
  `Research=R+M`, `Rubric/Plan=P`, `Implement=W`, `Verify/Score/Next=A + report format`.
- Avoid handshake questions in normal flow.
- Ask one concise question only for hard blockers:
  - destructive/irreversible actions
  - missing required credentials/permissions
  - unresolved product choices without evidence

## Quick Start (KR)
1. `activate_project`
2. `check_onboarding_performed`
3. `read_memory`:
  - `project_overview`
  - `suggested_commands`
  - `task_completion_checklist`
  - `style_conventions`
4. 작성 시작 전 `Goal`/`Rubric` 고정
5. 심볼 기반 탐색/수정 후 Quality Gate 실행

## Quick Start (EN)
1. Run `activate_project`.
2. Run `check_onboarding_performed`.
3. Read required memories:
  - `project_overview`
  - `suggested_commands`
  - `task_completion_checklist`
  - `style_conventions`
4. Lock `Goal` and `Rubric` before coding.
5. Use symbol-first edits, then run Quality Gate checks.

## Goal
### KR
- 모든 구현 작업은 시작 시 1문장 Goal을 고정하고, 검증 가능한 완료 조건을 포함합니다.

### EN
- Every implementation task starts with a one-sentence Goal that includes verifiable done criteria.

## Rubric
### KR
- `Must`: 하나라도 실패하면 완료로 선언하지 않습니다.
- `Should`: 품질/운영 효율 항목으로, 가능한 한 충족합니다.

### EN
- `Must`: If any item fails, the task is not done.
- `Should`: Quality/efficiency targets that should be met when feasible.

## Default Loop (R->P->M->W->A)
### KR
1. `R` (Read context)
- `activate_project` 실행
- `check_onboarding_performed` 확인
- 필요 메모리만 읽기: `project_overview`, `suggested_commands`, `task_completion_checklist`, `style_conventions`

2. `P` (Plan)
- Goal 1문장 작성
- Rubric를 `Must/Should`로 분리
- 이번 이터레이션 최소 변경 단위 정의

3. `M` (Map code)
- 파일 전체 읽기 전에 `get_symbols_overview` 사용
- 대상 심볼은 `find_symbol`로 좁혀 조회
- 파급 범위는 `find_referencing_symbols`로 확인
- 텍스트/설정 탐색은 `search_for_pattern` 우선 사용

4. `W` (Write)
- 심볼 단위 변경 우선: `replace_symbol_body`, `insert_before_symbol`, `insert_after_symbol`
- 변경은 실패 Rubric 항목을 우선 타격하는 최소 수정으로 제한

5. `A` (Assess)
- 로컬 품질 게이트 실행
- 결과를 pass/fail 근거로 기록
- 남은 갭이 있으면 다음 이터레이션으로 진행

### EN
1. `R` (Read context)
- Run `activate_project`.
- Verify onboarding with `check_onboarding_performed`.
- Read only required memories.

2. `P` (Plan)
- Write one-sentence Goal.
- Split Rubric into `Must` and `Should`.
- Define smallest iteration unit.

3. `M` (Map code)
- Start with `get_symbols_overview` before full-file reads.
- Narrow targets with `find_symbol`.
- Check impact with `find_referencing_symbols`.
- Use `search_for_pattern` for text/config checks.

4. `W` (Write)
- Prefer symbol-level edits (`replace_symbol_body`, `insert_before_symbol`, `insert_after_symbol`).
- Keep changes minimal and tied to failed Rubric items.

5. `A` (Assess)
- Run Quality Gate checks.
- Record pass/fail evidence.
- Continue to next iteration if gaps remain.

## Tool Selection Matrix
| Situation | Preferred Tool |
| --- | --- |
| Large file structural scan (`src/thread.rs`) | `get_symbols_overview` |
| Function/type body lookup | `find_symbol(include_body=true)` |
| Reference/impact regression check | `find_referencing_symbols` |
| Keyword/policy scan | `search_for_pattern` |
| Function/type-level edits | `replace_symbol_body` |
| Insert declarations at top/bottom | `insert_before_symbol`, `insert_after_symbol` |
| Load project baseline context | `check_onboarding_performed` + `read_memory` |

## Quality Gate
### KR
- 로직 변경 시: `cargo test`
- 바이너리/런타임 경로 변경 시: `cargo build --release`
- npm 래퍼/플랫폼 감지 변경 시: `node npm/testing/test-platform-detection.js`

해당 범위의 게이트를 통과하지 못하면 완료로 닫지 않습니다.

### EN
- Logic changes: `cargo test`
- Binary/runtime-path changes: `cargo build --release`
- npm wrapper/platform detection changes: `node npm/testing/test-platform-detection.js`

Do not close a task if applicable gates fail.

## Recommended Report Format
### KR
모든 구현 작업 보고는 아래 순서를 고정합니다.
1. `Goal`
2. `Rubric (Must/Should)`
3. `Iteration N Result`
4. `Current Score / Remaining Gaps`
5. `Next Action or Done`

### EN
Use this fixed order in all implementation reports.
1. `Goal`
2. `Rubric (Must/Should)`
3. `Iteration N Result`
4. `Current Score / Remaining Gaps`
5. `Next Action or Done`

## Large File Rule (`src/thread.rs`)
### KR
- `cat`/전체 읽기보다 심볼 기반 접근을 기본값으로 사용합니다.
- 먼저 구조를 본 뒤 필요한 심볼만 본문 조회합니다.
- 참조 영향(`find_referencing_symbols`) 확인 없이 공개 동작을 변경하지 않습니다.

### EN
- Prefer symbol-first exploration over full-file reads.
- Scan structure first, then fetch only required symbol bodies.
- Do not change public behavior without reference-impact checks.

## Team Hygiene
### KR
- 작업 종료 전 `git status --short --branch`로 의도치 않은 변경 확인
- 새로 얻은 운영 지식은 Serena memory에 짧게 반영
- 비밀값/API 키는 커밋 금지, 환경변수 사용 유지

### EN
- Run `git status --short --branch` before closing tasks.
- Write newly learned operational knowledge into Serena memory.
- Never commit secrets/API keys; keep environment-variable usage.
