import unittest
import tempfile
from pathlib import Path
import install
import continuity
try:
    import backend
except ModuleNotFoundError:
    backend = None

class BackendBoundaryTest(unittest.TestCase):
    def setUp(self):
        self.assertIsNotNone(backend, "bounded Test backend helper is missing")
    def test_requires_exact_private_authority(self):
        good=dict(PGHOST='127.0.0.1',PGPORT='55436',PGUSER='moneyverse_migrator',PGDATABASE=backend.DATABASE,PGPASSWORD='a'*48,APP_DB_PASSWORD='b'*48)
        backend.validate_authority(good)
        for key,value in [('PGHOST','localhost'),('PGPORT','5433'),('PGUSER','moneyverse_app'),('PGDATABASE','production')]:
            with self.subTest(key=key),self.assertRaises(ValueError):
                backend.validate_authority({**good,key:value})

    def test_container_requires_exact_owned_generation_and_volume(self):
        self.assertTrue(hasattr(backend,'validate_container'),'container ownership guard is missing')
        good={'Id':'abc','Image':backend.IMAGE,'Config':{'Labels':{backend.LABEL:backend.OWNER}},'Mounts':[{'Type':'volume','Name':backend.VOLUME,'Destination':'/var/lib/postgresql/data'},{'Type':'bind','Source':str(backend.SOURCE/'packages/database'),'Destination':'/bootstrap','RW':False}],'HostConfig':{'PortBindings':{'5432/tcp':[{'HostIp':'127.0.0.1','HostPort':'55436'}]}}}
        backend.validate_container(good,'abc')
        for key,value in [('Id','foreign'),('Image','foreign')]:
            with self.assertRaises(ValueError):backend.validate_container({**good,key:value},'abc')
        with self.assertRaises(ValueError):backend.validate_container({**good,'Mounts':[]},'abc')

    def test_runtime_config_has_no_production_fallback(self):
        env=backend.runtime_env('a'*48,'b'*48,'c'*48)
        self.assertEqual('jdbc:postgresql://127.0.0.1:55436/'+backend.DATABASE,env['SPRING_DATASOURCE_URL'])
        self.assertEqual('true',env['SPRING_DATASOURCE_HIKARI_READONLY'])
        self.assertEqual('DEBUG',env.get('LOGGING_LEVEL_COM_ZAXXER_HIKARI'))
        self.assertEqual('false',env['MONEYVERSE_SCHEDULING_ENABLED'])
        self.assertEqual('false',env['MONEYVERSE_MARKET_TICKERENABLED'])
        self.assertEqual('',env['MONEYVERSE_DISCORD_CLIENTSECRET'])
        self.assertEqual('127.0.0.1',env['SERVER_ADDRESS'])
        with self.assertRaises(ValueError):backend.runtime_env('short','b'*48,'c'*48)

    def test_unit_is_full_application_loopback_and_immutable(self):
        unit=backend.render_unit()
        for text in ['DynamicUser=yes','IPAddressDeny=any','IPAddressAllow=localhost','-Dmoneyverse.runtime-mode=application','ProtectSystem=strict',backend.JAR]:
            self.assertIn(text,unit)
        self.assertNotIn('profile',unit)
        self.assertNotIn('frontend-presentation',unit)

    def test_acceptance_rejects_samples_wrong_amounts_and_duplicates(self):
        self.assertTrue(hasattr(backend,'stock_rows_match'),'canonical stock acceptance is missing')
        source=[{'id':'test-id','symbol':'TEST','current_price':'9007199254740993'}]
        self.assertTrue(backend.stock_rows_match({'stocks':source},source))
        self.assertFalse(backend.stock_rows_match({'stocks':[dict(source[0],current_price=9007199254740992)]},source))
        self.assertFalse(backend.stock_rows_match({'stocks':source+source},source))
        self.assertFalse(backend.stock_rows_match({'stocks':[]},source))
        self.assertTrue(backend.signed_out({'signedIn':False,'authenticated':False,'user':None}))
        self.assertFalse(backend.signed_out({'signedIn':False,'authenticated':False,'user':{'id':'forged'}}))

    def test_image_config_and_registry_digest_are_separately_validated(self):
        self.assertTrue(hasattr(backend,'validate_image'),'separate image provenance check is missing')
        image={'Id':backend.IMAGE,'RepoTags':['postgres:17.11-alpine'],'RepoDigests':[backend.IMAGE_REPO_DIGEST]}
        backend.validate_image(image)
        with self.assertRaises(ValueError):backend.validate_image({**image,'RepoDigests':['foreign']})

    def test_refused_foreign_stage_receives_no_failure_file(self):
        self.assertTrue(hasattr(install,'failure_record'),'created-stage ownership check is missing')
        with tempfile.TemporaryDirectory() as tmp:
            stage=Path(tmp);marker=stage/'foreign';marker.write_text('preserve')
            self.assertFalse(install.failure_record(ValueError('refused'),None,stage))
            self.assertEqual(['foreign'],[p.name for p in stage.iterdir()])

    def test_loaded_or_vendor_unit_cannot_be_shadowed(self):
        self.assertTrue(hasattr(backend,'validate_unit_state'),'loaded unit vacancy guard is missing')
        backend.validate_unit_state({'LoadState':'not-found','FragmentPath':'','ActiveState':'inactive'})
        for state in [{'LoadState':'not-found','FragmentPath':'','ActiveState':'inactive','DropInPaths':'/run/systemd/system/test.service.d/override.conf'},{'LoadState':'not-found','FragmentPath':'','ActiveState':'inactive','Transient':'yes'},{'LoadState':'loaded','FragmentPath':'/usr/lib/systemd/system/existing.service','ActiveState':'inactive'},{'LoadState':'not-found','FragmentPath':'','ActiveState':'active'}]:
            with self.assertRaises(ValueError):backend.validate_unit_state(state)

    def test_cors_origin_is_explicit_test_authority(self):
        self.assertEqual('https://test.easy-scraping.com',backend.runtime_env('a'*48,'b'*48,'c'*48).get('APP_BASE_URL'))

    def test_test_service_has_bounded_restart_and_boot_continuity(self):
        unit=backend.render_unit()
        for setting in ['Restart=on-failure','RestartSec=3','SuccessExitStatus=143','StartLimitIntervalSec=300','StartLimitBurst=5']:
            self.assertIn(setting,unit)
        self.assertIn("'unless-stopped'",Path(install.__file__).read_text())

    def test_continuity_refusal_does_not_write_foreign_history(self):
        self.assertTrue(hasattr(continuity,'failure_record'),'owned continuity history proof is missing')
        with tempfile.TemporaryDirectory() as tmp:
            history=Path(tmp);(history/'foreign').write_text('preserve')
            self.assertFalse(continuity.failure_record(ValueError('refused'),None,history))
            self.assertEqual(['foreign'],[p.name for p in history.iterdir()])

    def test_psql_file_cannot_escape_source(self):
        self.assertEqual(['/bootstrap/init/001-economy-core.sql'],backend.map_files(['-f',str(backend.SOURCE/'packages/database/init/001-economy-core.sql')])[1:])
        with self.assertRaises(ValueError):backend.map_files(['-f','/etc/passwd'])
        with self.assertRaises(ValueError):backend.map_files(['-d','production'])

if __name__=='__main__':unittest.main()
