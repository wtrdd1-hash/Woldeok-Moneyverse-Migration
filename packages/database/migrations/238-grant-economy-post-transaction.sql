-- 238-grant-economy-post-transaction.sql
-- Grants EXECUTE privilege on public.economy_post_transaction to moneyverse_app
-- for engagement/dopamine game reward settlement (Golden Duck Fever, etc.).

GRANT EXECUTE ON FUNCTION public.economy_post_transaction(uuid, text, uuid, text, jsonb, text, jsonb) TO moneyverse_app;
