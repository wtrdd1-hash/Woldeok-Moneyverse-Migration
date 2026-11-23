import importlib.util, pathlib, unittest
p=pathlib.Path(__file__).with_name("routing.py")
spec=importlib.util.spec_from_file_location("test_frontend_routing",p)
routing=importlib.util.module_from_spec(spec);spec.loader.exec_module(routing)

d=importlib.util.spec_from_file_location("test_frontend_deploy",p.with_name("deploy.py"))
deploy=importlib.util.module_from_spec(d);d.loader.exec_module(deploy)

class RoutingTest(unittest.TestCase):
    def original(self):
        return '# preserve header\nserver { listen 80; server_name test.easy-scraping.com; location / { proxy_pass http://127.0.0.1:4550; } }\n# Production\nserver { listen 80; server_name easy-scraping.com www.easy-scraping.com; location / { proxy_pass http://127.0.0.1:4550; } }\n'
    def test_only_test_server_is_replaced(self):
        before=self.original();after=routing.site(before)
        self.assertEqual(before.split('# Production')[1],after.split('# Production')[1])
        self.assertIn('127.0.0.1:55440',after)
        self.assertIn('127.0.0.1:55438',after)
        self.assertNotIn('4550',after.split('# Production')[0])
        self.assertNotIn('include /etc/nginx/snippets/moneyverse-nov18-maintenance',after)
    def test_unknown_or_duplicate_authority_is_refused(self):
        with self.assertRaises(ValueError):routing.site(self.original().replace('test.easy-scraping.com','other.example'))
        with self.assertRaises(ValueError):routing.site(self.original()+self.original())
    def test_methods_and_credentials_are_closed(self):
        s=routing.server()
        self.assertIn('if ($request_method !~ ^(GET|HEAD)$) { return 405; }',s)
        self.assertIn('proxy_pass_request_headers off;',s)
        self.assertIn('proxy_pass_request_body off;',s)
        self.assertIn('proxy_set_header Content-Length "";',s)
        self.assertNotIn('$http_authorization',s)
        self.assertNotIn('api/v1/ {',s)
        self.assertIn('location / { return 404; }',s)
    def test_test_unit_has_both_real_test_source_clients_and_no_database(self):
        s=routing.unit('/srv/moneyverse-native-test-20261123/'+'a'*40+'/app.jar')
        self.assertIn('frontend-presentation',s)
        self.assertIn('--moneyverse.admin.source-origin=http://127.0.0.1:55438',s)
        self.assertIn('--moneyverse.public.source-origin=http://127.0.0.1:55438',s)
        self.assertNotIn('4550',s)
        self.assertNotIn('EnvironmentFile=',s)
        self.assertIn('IPAddressDeny=any',s)
        self.assertIn('--server.address=127.0.0.1',s)
        with self.assertRaises(ValueError):routing.unit('/tmp/app.jar')
    def test_parser_ignores_quotes_comments_and_handles_variables(self):
        original=self.original().replace('location / {','set $example "}"; # }\n location / {',1)
        self.assertIn('# Production',routing.site(original))
    def test_assets_are_read_only_and_only_native_families(self):
        s=routing.server()
        self.assertIn('/assets/(?:mv39|mv40|mv43|mv46)/',s)
        self.assertNotIn('proxy_pass http://$',s)
        self.assertIn('location = /frontend-version',s)
        self.assertIn('X-Robots-Tag',s)

    def test_attestation_refuses_wrong_branch_failed_checks_and_wrong_archive(self):
        source="a"*40
        m={"name":"Build Test Candidate","head_sha":source,"head_branch":"fix/test-frontend-real-backend-20261123","status":"completed","conclusion":"success"}
        j=[{"name":"verify / "+n,"conclusion":"success"} for n in ("classify","policy","runtime-check","spring-web-check")]
        a=[{"name":"spring-native-candidate-"+source,"expired":False,"digest":"sha256:"+deploy.sha(b"archive"),"id":1}]
        self.assertEqual(1,deploy.validate_attestation(source,m,j,a,b"archive")["id"])
        with self.assertRaises(ValueError):deploy.validate_attestation(source,{**m,"head_branch":"main"},j,a,b"archive")
        with self.assertRaises(ValueError):deploy.validate_attestation(source,m,j[:-1],a,b"archive")
        with self.assertRaises(ValueError):deploy.validate_attestation(source,m,j,a,b"other")
    def test_packaged_identity_cannot_be_relabeled(self):
        import io,zipfile
        b=io.BytesIO()
        with zipfile.ZipFile(b,"w") as z:z.writestr("BOOT-INF/classes/META-INF/build-info.properties","build.sourceRevision="+"a"*40+"\nbuild.runtimeKind=spring-native\n")
        data=b.getvalue()
        deploy.check_packaged(data,"a"*40,deploy.sha(data))
        with self.assertRaises(ValueError):deploy.check_packaged(data,"b"*40,deploy.sha(data))
    def test_compare_and_swap_refuses_foreign_file_without_overwrite(self):
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            p=pathlib.Path(d)/"site";p.write_text("before")
            proof=deploy.snapshot(p);p.write_text("foreign")
            with self.assertRaises(ValueError):deploy.atomic(p,b"candidate",proof,0o600,pathlib.Path(d),"owned")
            self.assertEqual("foreign",p.read_text())


    def test_original_capture_binds_bytes_and_identity(self):
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            p=pathlib.Path(d)/"site";p.write_bytes(b"original")
            data,proof=deploy.capture(p)
            self.assertEqual(b"original",data)
            self.assertEqual(deploy.sha(data),proof["sha256"])
            self.assertEqual(proof,deploy.snapshot(p))
    def test_immediately_replaced_foreign_bytes_cannot_be_adopted(self):
        import tempfile
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as d:
            root=pathlib.Path(d);p=root/"site";p.write_text("before");proof=deploy.snapshot(p)
            real_replace,real_link=deploy.os.replace,deploy.os.link
            def replace(a,b):
                result=real_replace(a,b)
                if pathlib.Path(b)==p:p.write_text("foreign")
                return result
            def link(a,b):
                result=real_link(a,b)
                if pathlib.Path(b)==p:p.write_text("foreign")
                return result
            with patch.object(deploy.os,"replace",replace),patch.object(deploy.os,"link",link):
                with self.assertRaises(ValueError):deploy.atomic(p,b"candidate",proof,0o600,root,"owned")
            self.assertEqual("foreign",p.read_text())
            self.assertFalse((root/"owned.json").exists())
    def test_race_after_final_comparison_restores_displaced_foreign_file(self):
        import tempfile
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as d:
            root=pathlib.Path(d);p=root/"site";p.write_text("before");proof=deploy.snapshot(p)
            real_same=deploy.same;calls=[]
            def compare(path,expected):
                real_same(path,expected);calls.append(1)
                if len(calls)==2:p.write_text("foreign")
            with patch.object(deploy,"same",compare):
                with self.assertRaises(ValueError):deploy.atomic(p,b"candidate",proof,0o600,root,"owned")
            self.assertEqual("foreign",p.read_text())


    def test_operational_checkpoint_cannot_hide_application_changes(self):
        deploy.require_control_only(["ops/test-frontend-real-backend/deploy.py","docs/worklog/state.md"])
        with self.assertRaises(ValueError):deploy.require_control_only(["spring-backend/src/main/resources/templates/mv43/home.html"])
        with self.assertRaises(ValueError):deploy.require_control_only([".github/workflows/ci.yml"])
    def test_owned_replacement_and_inverse_restore_original_bytes(self):
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            root=pathlib.Path(d);p=root/"site";p.write_text("before");before=deploy.snapshot(p)
            acquired=deploy.atomic(p,b"candidate",before,0o600,root,"forward")
            self.assertEqual("candidate",p.read_text())
            deploy.atomic(p,b"before",acquired,0o600,root,"inverse")
            self.assertEqual("before",p.read_text())

if __name__=='__main__':unittest.main()
