BEGIN;

INSERT INTO public.feature_switches (
  feature_key,
  state,
  title,
  activation_preconditions,
  reason
)
VALUES (
  'work',
  'enabled',
  '작업 · 직업',
  '[]'::jsonb,
  'work is enabled by default; administrators may pause or disable it from the control plane'
)
ON CONFLICT (feature_key) DO NOTHING;

-- The application role may only read the effective state through the
-- SECURITY DEFINER accessor created in migration 059. Direct table access
-- stays revoked.
GRANT EXECUTE ON FUNCTION public.feature_switch_state(text) TO moneyverse_app;

COMMIT;
