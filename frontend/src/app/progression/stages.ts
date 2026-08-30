import { groupDigits } from '@/lib/money';

/**
 * The growth stages, and the Korean they are read in.
 *
 * `GET /api/v1/progression` answers with the stage *code* and nothing else.
 * The names live in `progression_stages`
 * (packages/database/migrations/076-progression-and-credit-schema.sql), they
 * are English -- 'Starter', 'Early growth' -- and no SECURITY DEFINER
 * function exposes that table, so the words a member reads are written here
 * rather than fetched.
 *
 * The list mirrors the seeded order because the page draws the whole ladder,
 * not just the rung the member is on: seeing that there are four and which
 * one is next is most of what the screen is for. A code this build does not
 * know is still rendered -- as itself -- so a migration that adds a fifth
 * stage leaves the page saying something true rather than claiming the member
 * is nowhere.
 */
export interface Stage {
  readonly code: string;
  readonly label: string;
}

export const STAGES: readonly Stage[] = [
  { code: 'starter', label: '첫걸음' },
  { code: 'early', label: '성장 초기' },
  { code: 'middle', label: '성장 중기' },
  { code: 'advanced', label: '성장 후기' },
];

/**
 * `public.progression_my_status` RETURNS TABLE, as it arrives over the wire:
 * packages/database/migrations/078-loan-maturity-and-read-models.sql.
 *
 * `reached_at` is a `timestamptz` and reaches the browser as an ISO string.
 * `next_stage_code` and `next_requirements` are both null at the last stage,
 * where the function's LEFT JOIN finds no stage above this one.
 */
export interface ProgressionStatus {
  readonly stage_code: string;
  readonly reached_at: string;
  readonly next_stage_code: string | null;
  readonly next_requirements: Readonly<Record<string, number>> | null;
}

/** The stage's Korean name, or the code itself when this build has not heard of it. */
export function stageLabel(code: string): string {
  return STAGES.find((stage) => stage.code === code)?.label ?? code;
}

/**
 * Where the stage sits on the ladder, or -1 for one this build does not know.
 *
 * The page hides the ladder entirely on -1. Drawing four steps with none of
 * them marked would read as "you are before the first one", which is a
 * different and wrong statement.
 */
export function stageIndex(code: string | null): number {
  if (code === null) return -1;
  return STAGES.findIndex((stage) => stage.code === code);
}

/** One line of "what the next stage asks for", ready to render. */
export interface RequirementLine {
  readonly key: string;
  readonly label: string;
  readonly value: string;
}

interface RequirementWords {
  readonly label: string;
  readonly unit: string;
}

const REQUIREMENT_LABELS: Readonly<Record<string, RequirementWords>> = {
  workCompletions: { label: '완료한 작업', unit: '회' },
  jobLevel: { label: '직업 레벨', unit: '레벨' },
  businesses: { label: '보유한 사업', unit: '개' },
};

/**
 * The unlock requirements, in the order and the words a member reads.
 *
 * Every value here is a count -- finished tasks, a job level, owned
 * businesses -- and never an amount of WLD, which is why a number is the
 * right type for one. `groupDigits` still formats it, so 1,000 completed
 * tasks would read the way every other figure on the screen does.
 *
 * A requirement of zero is dropped: 'starter' asks for zero completions, and
 * printing "완료한 작업 0회" as a condition to meet says nothing. An
 * unrecognised key survives under its own name rather than disappearing --
 * a requirement the member cannot see is one they cannot meet.
 */
export function requirementLines(
  requirements: Readonly<Record<string, number>> | null,
): readonly RequirementLine[] {
  if (!requirements) return [];

  return Object.entries(requirements)
    .filter(([, value]) => typeof value === 'number' && Number.isFinite(value) && value > 0)
    .map(([key, value]) => {
      const known = REQUIREMENT_LABELS[key];
      const figure = groupDigits(String(value));
      return known === undefined
        ? { key, label: key, value: figure }
        : { key, label: known.label, value: `${figure}${known.unit}` };
    });
}
