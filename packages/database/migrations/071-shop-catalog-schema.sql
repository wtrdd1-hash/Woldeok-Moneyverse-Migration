BEGIN;
CREATE TYPE public.shop_effect_kind AS ENUM ('convenience','decoration','display');
CREATE TABLE public.shop_catalog (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE CHECK(code~'^[a-z0-9_]{3,64}$'), name text NOT NULL, description text NOT NULL,
 category text NOT NULL CHECK(category IN ('general','job','business','vehicle','season','luxury')), base_price bigint NOT NULL CHECK(base_price>0),
 effect_kind public.shop_effect_kind NOT NULL, effect jsonb NOT NULL DEFAULT '{}'::jsonb,
 -- A closed vocabulary. `purchase_limit` decides how often an item may be
 -- bought, and a code nobody recognises would silently mean "no limit" --
 -- which is the wrong direction for a value that exists to impose one.
 purchase_limit text NOT NULL CHECK (purchase_limit ~ '^(once|account_one|permanent|unlimited|limited|business_owned|state_based|stage_based|timed|level_[0-9]{1,2}|daily_[0-9]{1,2}|weekly_[0-9]{1,2})$'), active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE public.shop_inventory (catalog_id uuid PRIMARY KEY REFERENCES public.shop_catalog(id), quantity integer CHECK(quantity IS NULL OR quantity>=0), restock_rule text NOT NULL DEFAULT 'none', starts_at timestamptz, ends_at timestamptz, CHECK(ends_at IS NULL OR starts_at IS NULL OR ends_at>starts_at));
CREATE TABLE public.shop_purchases (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), idempotency_key uuid NOT NULL UNIQUE, user_id uuid NOT NULL REFERENCES public.users(id), catalog_id uuid NOT NULL REFERENCES public.shop_catalog(id), quantity integer NOT NULL CHECK(quantity>0), unit_price bigint NOT NULL CHECK(unit_price>0), transaction_id uuid NOT NULL REFERENCES public.ledger_transactions(id), purchased_at timestamptz NOT NULL DEFAULT clock_timestamp());
CREATE TABLE public.user_items (user_id uuid NOT NULL REFERENCES public.users(id), catalog_id uuid NOT NULL REFERENCES public.shop_catalog(id), quantity integer NOT NULL CHECK(quantity>=0), acquired_at timestamptz NOT NULL DEFAULT clock_timestamp(), expires_at timestamptz, PRIMARY KEY(user_id,catalog_id));
CREATE TABLE public.item_effect_receipts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.users(id), catalog_id uuid NOT NULL REFERENCES public.shop_catalog(id), idempotency_key uuid NOT NULL UNIQUE, applied_at timestamptz NOT NULL DEFAULT clock_timestamp(), expires_at timestamptz);
REVOKE ALL PRIVILEGES ON TABLE public.shop_catalog,public.shop_inventory,public.shop_purchases,public.user_items,public.item_effect_receipts FROM PUBLIC,moneyverse_app;
COMMIT;
