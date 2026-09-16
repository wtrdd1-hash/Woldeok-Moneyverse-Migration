-- Read-only operational scoreboard over append-only council evidence.
BEGIN;
CREATE OR REPLACE VIEW public.economy_ai_agent_scoreboard AS
SELECT
  evidence ->> 'domain' AS domain,
  evidence ->> 'seat' AS seat,
  evidence ->> 'model' AS model,
  count(*)::bigint AS review_count,
  count(*) FILTER (WHERE evidence ->> 'decision' = 'agree')::bigint AS agree_count,
  count(*) FILTER (WHERE evidence ->> 'decision' = 'veto')::bigint AS veto_count,
  count(*) FILTER (WHERE evidence ->> 'decision' = 'abstain')::bigint AS abstain_count,
  round(avg((evidence ->> 'confidence')::numeric), 4) AS avg_confidence,
  round(avg(nullif(evidence ->> 'latencyMs', '')::numeric), 1) AS avg_latency_ms,
  round(avg(nullif(evidence ->> 'totalTokens', '')::numeric), 1) AS avg_total_tokens,
  max(review_row.reviewed_at) AS last_reviewed_at
FROM public.economy_ai_policy_reviews AS review_row
CROSS JOIN LATERAL pg_catalog.jsonb_array_elements(review_row.council_evidence) AS evidence
GROUP BY evidence ->> 'domain', evidence ->> 'seat', evidence ->> 'model';
ALTER VIEW public.economy_ai_agent_scoreboard OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON public.economy_ai_agent_scoreboard FROM PUBLIC;
GRANT SELECT ON public.economy_ai_agent_scoreboard TO moneyverse_app;
COMMIT;
