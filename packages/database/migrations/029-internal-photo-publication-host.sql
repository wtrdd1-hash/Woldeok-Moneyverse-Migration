-- Internal media is served only after the published-photo DB gate.  These
-- origins are allowlisted for the existing editorial URL validation path.
SELECT public.content_configure_image_host('easy-scraping.com', true);
SELECT public.content_configure_image_host('moneyverse-test.easy-scraping.com', true);
