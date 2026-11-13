CREATE ROLE moneyverse_migrator;
CREATE ROLE moneyverse_app;
CREATE FUNCTION public.acl_probe_fn() RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN NULL; END $$;
CREATE PROCEDURE public.acl_probe_proc() LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN NULL; END $$;
GRANT EXECUTE ON FUNCTION public.acl_probe_fn() TO moneyverse_app;
GRANT EXECUTE ON PROCEDURE public.acl_probe_proc() TO moneyverse_app;
