"""Disposable filesystem transactions; process/CI boundaries are synthetic."""
import importlib.util
import json
import os
from pathlib import Path
import socket
import tempfile
import unittest
from unittest.mock import patch


def module():
    path = Path(__file__).with_name('install.py')
    if not path.exists():
        raise AssertionError('The canary transaction installer is missing')
    spec = importlib.util.spec_from_file_location('canary_install', path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


class FakeSystem:
    def __init__(self, m):
        self.m = m
        self.states = {m.FRONT_UNIT: self.loaded(m.FRONT_FILE, '101')}
        self.fail = None
        self.calls = []
    def loaded(self, path, pid='0'):
        return dict(LoadState='loaded', ActiveState='active' if pid != '0' else 'inactive',
                    MainPID=pid, FragmentPath=str(path), DropInPaths='')
    def state(self, unit):
        return self.states.get(unit, dict(LoadState='not-found', ActiveState='inactive',
                                         MainPID='0', FragmentPath='', DropInPaths=''))
    def free(self, port): return True
    def reload(self):
        for unit, path in [(self.m.FRONT_UNIT,self.m.FRONT_FILE),(self.m.API_UNIT,self.m.API_FILE)]:
            if path.exists():
                self.states.setdefault(unit,self.loaded(path))
            else:
                self.states.pop(unit,None)
    def start(self, unit):
        self.calls.append(('start',unit))
        if self.fail == 'backend-start' and unit == self.m.API_UNIT:
            raise RuntimeError('Synthetic backend start failure')
        self.states[unit]['MainPID'] = '202' if unit == self.m.API_UNIT else '303'
        self.states[unit]['ActiveState'] = 'active'
    def stop(self, unit):
        self.calls.append(('stop',unit))
        self.states[unit]['MainPID']='0'
        self.states[unit]['ActiveState']='inactive'
    def prove(self, unit, jar, source, expected_pid=None,check_version=True):
        state=self.state(unit)
        if expected_pid is not None and state['MainPID'] != str(expected_pid):
            raise ValueError('Synthetic foreign PID')
        if state['MainPID']=='0': raise ValueError('No process')
        return state['MainPID']
    def ready(self, unit, source):
        if self.fail=='front-readiness' and unit==self.m.FRONT_UNIT and source=='b'*40:
            raise RuntimeError('Synthetic new frontend readiness failure')
    def nginx(self, action):
        self.calls.append(('nginx',action))
        if self.fail=='nginx': raise RuntimeError('Synthetic Nginx failure')
    def boundaries(self, before):
        if self.fail=='boundaries': raise RuntimeError('Synthetic admission failure')


class InstallTests(unittest.TestCase):
    def setUp(self):
        self.m=module()
        self.tmp=tempfile.TemporaryDirectory(prefix='mv-canary-transaction-')
        self.root=Path(self.tmp.name)
        for name in ['ROOT','RELEASES']: setattr(self.m,name,self.root/name)
        for p in [self.m.ROOT,self.m.RELEASES]:p.mkdir(mode=0o700)
        self.stage=self.m.ROOT/'proposal';self.stage.mkdir(mode=0o700)
        for name in ['FRONT_FILE','API_FILE','ENVIRONMENT','INCLUDE','SITE','SOURCE_ENV']:
            setattr(self.m,name,self.root/name)
        self.m.FRONT_FILE.write_bytes(b'old frontend unit')
        self.m.INCLUDE.write_bytes(b'old include')
        self.m.SITE.write_bytes(b'unrelated site remains')
        self.oldjar=self.m.RELEASES/'old.jar';self.oldjar.write_bytes(b'old immutable jar')
        self.newjar=self.m.RELEASES/'new.jar';self.newjar.write_bytes(b'new immutable jar')
        files={'front.before':b'old frontend unit','include.before':b'old include',
               'front.service':b'new frontend unit','api.service':b'new backend unit',
               'qa.conf':b'new include','secret.env':b'SYNTHETIC_GENERATED_DISPOSABLE=true\n'}
        for key,data in files.items():(self.stage/key).write_bytes(data)
        self.manifest={'applicationSource':'b'*40,'oldSource':'a'*40,
            'jar':str(self.newjar),'jarSha256':self.m.digest(self.newjar.read_bytes()),
            'oldJar':str(self.oldjar),'oldJarSha256':self.m.digest(self.oldjar.read_bytes()),
            'oldPid':'101','files':{k:self.m.digest(v) for k,v in files.items()},
            'targets':{str(p):self.m.snapshot(p) for p in [self.m.FRONT_FILE,self.m.INCLUDE,self.m.SITE]},
            'apiBefore':{}}
        self.system=FakeSystem(self.m)
        self.m.SOURCE_ENV.write_bytes(b'disposable literal source')
        self.manifest['sourceEnv']=self.m.snapshot(self.m.SOURCE_ENV)
        self.manifest['run']='123'
        self.real_approved_ci=self.m.approved_ci
        self.m.approved_ci=lambda source,run:None
        self.real_artifact_check=self.m.artifact_still_approved
        self.m.artifact_still_approved=lambda *args:None
        self.manifest['artifactProof']={}
    def tearDown(self): self.tmp.cleanup()
    def run_apply(self):
        return self.m.transact(self.stage,self.manifest,self.system)
    def assert_old(self):
        self.assertEqual(self.m.FRONT_FILE.read_bytes(),b'old frontend unit')
        self.assertEqual(self.m.INCLUDE.read_bytes(),b'old include')
        self.assertEqual(self.m.SITE.read_bytes(),b'unrelated site remains')
        self.assertFalse(self.m.API_FILE.exists())
        self.assertFalse(self.m.ENVIRONMENT.exists())

    def test_post_link_backend_failure_before_daemon_reload_is_removed(self):
        actual=self.m.os.link
        def interrupted(a,b):
            actual(a,b)
            if b==self.m.API_FILE:raise OSError('Synthetic acquired backend failure')
        with patch.object(self.m.os,'link',interrupted):
            with self.assertRaises(OSError):self.run_apply()
        self.assert_old()

    def test_unknown_loaded_foreign_backend_process_is_not_stopped(self):
        self.run_apply()
        self.system.states[self.m.API_UNIT]['MainPID']='909'
        result=self.m.rollback(self.stage,self.manifest,self.system)
        self.assertTrue(result['errors'])
        self.assertTrue(self.m.API_FILE.exists())
        self.assertNotIn(('stop',self.m.API_UNIT),self.system.calls)
        self.assertFalse(self.m.ENVIRONMENT.exists())

    def test_front_readiness_failure_restores_original_renderer_and_bytes(self):
        self.system.fail='front-readiness'
        with self.assertRaises(RuntimeError):self.run_apply()
        self.assert_old()
        self.assertEqual(self.system.state(self.m.FRONT_UNIT)['MainPID'],'303')

    def test_real_boundary_probe_supports_write_refusal_without_changing_shared_helper(self):
        m=self.m
        class Response:
            status=405
            def __enter__(self):return self
            def __exit__(self,*args):pass
        class Opener:
            def open(self,request,timeout):
                self.request=request
                return Response()
        opener=Opener()
        with patch.object(m.urllib.request,'build_opener',return_value=opener):
            self.assertEqual(m.edge_status(m.canary.PREFIX+'catalog',method='POST'),405)
        self.assertEqual(opener.request.get_method(),'POST')

    def test_main_and_ci_are_rechecked_immediately_before_transaction_side_effects(self):
        self.manifest['run']='123'
        def refuse(source,run):raise ValueError('Synthetic source advance')
        self.m.approved_ci=refuse
        with self.assertRaises(ValueError):self.run_apply()
        self.assert_old()
        self.assertFalse((self.stage/'journal.json').exists())
        self.assertEqual(self.system.calls,[])

    def test_approved_ci_rejects_another_workflow_even_with_matching_job_names(self):
        source='b'*40;run='123'
        good={'headSha':source,'headBranch':'main','event':'push','status':'completed','conclusion':'success',
              'jobs':[{'name':n,'conclusion':'success'} for n in ['classify','policy','runtime-check','spring-web-check']]}
        def gh(*args):
            if args[0]=='run':return json.dumps(good)
            if 'branches/main' in args[1]:return source
            return json.dumps({'path':'.github/workflows/foreign.yml','head_sha':source,'head_branch':'main',
                               'event':'push','status':'completed','conclusion':'success'})
        self.m.gh=gh
        with self.assertRaises(ValueError):self.real_approved_ci(source,run)

    def test_foreign_include_after_backend_start_does_not_get_overwritten(self):
        original_ready=self.system.ready
        def advance(unit,source):
            original_ready(unit,source)
            if unit==self.m.API_UNIT:self.m.INCLUDE.write_bytes(b'concurrent hardening')
        self.system.ready=advance
        with self.assertRaises(RuntimeError):self.run_apply()
        self.assertEqual(self.m.INCLUDE.read_bytes(),b'concurrent hardening')
        self.assertEqual(self.m.FRONT_FILE.read_bytes(),b'old frontend unit')
        self.assertFalse(self.m.API_FILE.exists());self.assertFalse(self.m.ENVIRONMENT.exists())

    def test_unhealthy_acquired_backend_can_be_removed_using_process_and_jar_proof(self):
        original_ready=self.system.ready
        def unavailable(unit,source):
            if unit==self.m.API_UNIT:raise RuntimeError('Synthetic unreachable readiness listener')
            original_ready(unit,source)
        original_prove=self.system.prove
        def prove(unit,jar,source,expected_pid=None,check_version=True):
            if unit==self.m.API_UNIT and check_version:
                raise ValueError('Synthetic unavailable version HTTP')
            return original_prove(unit,jar,source,expected_pid)
        self.system.ready=unavailable;self.system.prove=prove
        with self.assertRaises(RuntimeError):self.run_apply()
        self.assert_old()
        self.assertEqual(json.loads((self.stage/'rollback-outcome.json').read_text())['errors'],[])

    def test_selected_source_resources_classes_and_packaged_revision_are_checked(self):
        import io,zipfile
        source='b'*40
        resources=['static/assets/mv39/favicon.ico','static/assets/mv46/admin-shop.js',
                   'static/assets/mv46/admin-shop-core.js','static/assets/mv46/admin-shop.css',
                   'templates/mv46/admin-shop.html']
        classes=['com/moneyverse/catalogread/CatalogReadApplication','com/moneyverse/catalogread/CatalogReadController',
                 'com/moneyverse/adminpresentation/AdminShopPageController']
        def git(*args):
            selected=args[-1]
            self.assertTrue(selected.startswith(source+':'))
            if selected.endswith('AdminShopPageController.java'):
                return b'moneyverse.admin.catalog-read-path '+self.m.canary.PREFIX.encode()+b'catalog'
            return b'selected source bytes'
        self.m.git=git
        def archive(change=None):
            entries={'META-INF/build-info.properties':('build.sourceRevision='+source).encode()}
            entries.update({'BOOT-INF/classes/'+r:b'selected source bytes' for r in resources})
            entries.update({'BOOT-INF/classes/'+c+'.class':b'CI compiled class' for c in classes})
            if change:change(entries)
            data=io.BytesIO()
            with zipfile.ZipFile(data,'w') as z:
                for name,value in entries.items():z.writestr(name,value)
            return data.getvalue()
        self.m.verify_packaged(archive(),source)
        for change in [lambda e:e.update({'META-INF/build-info.properties':b'build.sourceRevision=foreign'}),
                       lambda e:e.pop('BOOT-INF/classes/'+classes[0]+'.class'),
                       lambda e:e.update({'BOOT-INF/classes/'+resources[1]:b'future local resource'})]:
            with self.assertRaises(ValueError):self.m.verify_packaged(archive(change),source)

    def test_operational_source_cannot_mix_files_from_different_heads(self):
        sequence=iter([b'a'*40+b'\n',b'b'*40+b'\n'])
        def git(*args):
            if args[0]=='rev-parse':return next(sequence)
            name=args[-1].rsplit('/',1)[-1]
            folder=self.m.DEPENDENCIES if name in {'qa.py','guards.py'} else self.m.HERE
            return (folder/name).read_bytes()
        self.m.git=git
        with self.assertRaises(ValueError):self.m.operational_files()

    def test_source_advance_after_backend_ready_rolls_back_without_stopping_old_frontend(self):
        count=0
        def gate(source,run):
            nonlocal count
            count+=1
            if count==2:raise ValueError('Synthetic main advance during readiness')
        self.m.approved_ci=gate
        with self.assertRaises(ValueError):self.run_apply()
        self.assert_old()
        self.assertNotIn(('stop',self.m.FRONT_UNIT),self.system.calls)

    def test_prior_root_private_stage_accepts_original_nonwritable_manifest_modes(self):
        m=self.m;m.BASE=self.m.ROOT/'prior';m.BASE.mkdir(mode=0o700)
        old={'site.before':b'prior site','site.after':m.SITE.read_bytes(),'qa.conf':m.INCLUDE.read_bytes(),
             'qa.service':m.FRONT_FILE.read_bytes(),'install.py':b'prior installer','qa.py':b'prior qa','guards.py':b'prior guards'}
        for name,data in old.items():(m.BASE/name).write_bytes(data)
        m.BASE_SITE_SHA=m.digest(old['site.after'])
        manifest={'files':{n:m.digest(d) for n,d in old.items()},'applicationSource':'a'*40,
                  'jar':str(self.oldjar),'jarSha256':m.digest(self.oldjar.read_bytes())}
        receipt={'unit':m.FRONT_UNIT,'applicationSource':'a'*40,'jarSha256':manifest['jarSha256'],
                 'siteAfter':m.BASE_SITE_SHA,'mainPid':'101'}
        (m.BASE/'manifest.json').write_text(json.dumps(manifest));(m.BASE/'manifest.json').chmod(0o644)
        (m.BASE/'apply-receipt.json').write_text(json.dumps(receipt));(m.BASE/'apply-receipt.json').chmod(0o644)
        m.jar_proof=lambda *args:None
        actual_stat=Path.stat
        def root_stat(path,*args,**kwargs):
            values=list(actual_stat(path,*args,**kwargs));values[4]=0
            return os.stat_result(values)
        with patch.object(m.os,'geteuid',return_value=0),patch.object(Path,'stat',root_stat):
            self.assertEqual(m.prior_base(self.system)[0]['applicationSource'],'a'*40)
            (m.BASE/'manifest.json').chmod(0o664)
            with self.assertRaises(ValueError):m.prior_base(self.system)

    def test_compare_and_swap_rejects_a_foreign_symlink_to_the_same_original_inode(self):
        target=self.root/'cas-target';target.write_bytes(b'original')
        original=self.m.snapshot(target)
        backup=self.root/'moved-original';target.rename(backup);target.symlink_to(backup)
        owner=self.m.OwnedFiles()
        with self.assertRaises(ValueError):
            owner.write(target,b'replacement',replace=True,expected=original['sha256'],
                        expected_identity=[original['dev'],original['ino']])
        self.assertTrue(target.is_symlink());self.assertEqual(backup.read_bytes(),b'original')
        self.assertFalse(owner.owns(target))

    def test_remote_artifact_identity_cannot_drift_after_prepare(self):
        source='b'*40;run='123';sha='c'*64
        artifact={'id':42,'name':'spring-native-candidate-'+source,'digest':'sha256:'+sha,'expired':False,
                  'workflow_run':{'id':123,'head_sha':source,'head_branch':'main'}}
        proof={'artifactId':42,'archiveSha256':sha,'run':run}
        self.assertTrue(hasattr(self.m,'artifact_still_approved'),'Apply must recheck the approved archive identity')
        self.m.gh=lambda *args:json.dumps({'artifacts':[artifact]})
        self.real_artifact_check(source,run,proof)
        for update in [{'id':43},{'digest':'sha256:'+'d'*64},{'expired':True},
                       {'workflow_run':{'id':124,'head_sha':source,'head_branch':'main'}}]:
            self.m.gh=lambda *args,update=update:json.dumps({'artifacts':[{**artifact,**update}]})
            with self.assertRaises(ValueError):self.real_artifact_check(source,run,proof)

    def test_process_identity_requires_exact_command_cwd_open_jar_and_packaged_version(self):
        m=self.m;processes=self.root/'proc';process=processes/'202';process.mkdir(parents=True)
        (process/'fd').mkdir();(process/'fd/7').symlink_to(self.newjar)
        (process/'cwd').symlink_to(self.newjar.parent,target_is_directory=True)
        command=[b'/usr/bin/java',b'-Dmoneyverse.runtime-mode=catalog-read',b'-jar',str(self.newjar).encode(),
                 b'--server.address=127.0.0.1',b'--server.port=4832']
        (process/'cmdline').write_bytes(b'\0'.join(command)+b'\0')
        system=m.System.__new__(m.System)
        system.state=lambda unit:self.system.loaded(m.API_FILE,'202')
        m.http=lambda *args:(200,{'id':'b'*40})
        real_path=Path
        with patch.object(m,'Path',side_effect=lambda value:processes if value=='/proc' else real_path(value)):
            self.assertEqual(system.prove(m.API_UNIT,self.newjar,'b'*40),'202')
            (process/'cmdline').write_bytes(b'\0'.join(command).replace(b'--server.port=4832',b'--server.port=9999'))
            with self.assertRaises(ValueError):system.prove(m.API_UNIT,self.newjar,'b'*40)
            (process/'cmdline').write_bytes(b'foreign generation')
            with self.assertRaises(ValueError):system.prove(m.API_UNIT,self.newjar,'b'*40)
            (process/'cmdline').write_bytes(b'\0'.join(command)+b'\0')
            (process/'fd/7').unlink();foreign=self.root/'foreign.jar';foreign.write_bytes(self.newjar.read_bytes())
            (process/'fd/7').symlink_to(foreign)
            with self.assertRaises(ValueError):system.prove(m.API_UNIT,self.newjar,'b'*40)
            (process/'fd/7').unlink();(process/'fd/7').symlink_to(self.newjar)
            (process/'cwd').unlink();(process/'cwd').symlink_to(self.root,target_is_directory=True)
            with self.assertRaises(ValueError):system.prove(m.API_UNIT,self.newjar,'b'*40)
            (process/'cwd').unlink();(process/'cwd').symlink_to(self.newjar.parent,target_is_directory=True)
            m.http=lambda *args:(200,{'id':'a'*40})
            with self.assertRaises(ValueError):system.prove(m.API_UNIT,self.newjar,'b'*40)

    def test_journal_write_failure_after_acquisition_uses_in_memory_ownership_for_cleanup(self):
        original_save=self.m.save;failed=False
        def fail_once(path,value):
            nonlocal failed
            if path.name=='journal.json' and str(self.m.ENVIRONMENT) in value.get('owned',{}) and not failed:
                failed=True;raise OSError('Synthetic journal storage failure')
            return original_save(path,value)
        self.m.save=fail_once
        with self.assertRaises(OSError):self.run_apply()
        self.assert_old()

    def test_outcome_storage_failure_cannot_skip_independent_owned_cleanup(self):
        self.run_apply();original_save=self.m.save
        def cannot_record(path,value):
            if path.name=='rollback-outcome.json':raise OSError('Synthetic diagnostic storage failure')
            return original_save(path,value)
        self.m.save=cannot_record
        outcome=self.m.rollback(self.stage,self.manifest,self.system)
        self.assert_old();self.assertFalse(outcome['complete'])
        self.assertTrue(outcome['errors'])
        self.assertTrue(outcome['backendRemoved']);self.assertTrue(outcome['environmentRemoved'])

    def test_backend_start_failure_preserves_original_front_and_include(self):
        self.system.fail='backend-start'
        with self.assertRaises(RuntimeError):self.run_apply()
        self.assert_old()
        self.assertNotIn(('stop',self.m.FRONT_UNIT),self.system.calls)

    def test_post_link_environment_failure_is_acquired_and_removed(self):
        actual=self.m.os.link
        def interrupted(a,b):
            actual(a,b)
            if b==self.m.ENVIRONMENT:raise OSError('Synthetic post-link failure')
        with patch.object(self.m.os,'link',interrupted):
            with self.assertRaises(OSError):self.run_apply()
        self.assert_old()

    def test_failure_after_both_swaps_restores_front_before_include_and_cleans_backend(self):
        self.system.fail='boundaries'
        with self.assertRaises(RuntimeError):self.run_apply()
        self.assert_old()
        outcome=json.loads((self.stage/'rollback-outcome.json').read_text())
        self.assertEqual(outcome['errors'],[])
        self.assertTrue(outcome['frontendRestored'])
        self.assertTrue(outcome['includeRestored'])
        self.assertTrue(outcome['environmentRemoved'])

    def test_normal_inverse_loads_persisted_ownership_and_ignores_new_main(self):
        self.run_apply()
        self.m.current_main=lambda source:(_ for _ in ()).throw(AssertionError('Rollback must not query main'))
        self.m.rollback(self.stage,self.manifest,self.system)
        self.assert_old()
        self.assertEqual(self.system.state(self.m.FRONT_UNIT)['MainPID'],'303')

    def test_nginx_failure_during_inverse_still_cleans_owned_backend_and_secret(self):
        self.run_apply();self.system.fail='nginx'
        outcome=self.m.rollback(self.stage,self.manifest,self.system)
        self.assert_old()
        self.assertTrue(outcome['errors'])
        self.assertTrue(outcome['backendRemoved']);self.assertTrue(outcome['environmentRemoved'])

    def test_foreign_preexisting_same_content_backend_or_environment_is_never_adopted(self):
        for target,data in [(self.m.API_FILE,b'new backend unit'),(self.m.ENVIRONMENT,(self.stage/'secret.env').read_bytes())]:
            with self.subTest(target=target.name):
                target.write_bytes(data)
                with self.assertRaises(ValueError):self.run_apply()
                self.assertEqual(target.read_bytes(),data)
                self.assertEqual(self.m.FRONT_FILE.read_bytes(),b'old frontend unit')
                target.unlink()

    def test_concurrently_replaced_same_content_owned_targets_are_preserved(self):
        self.run_apply()
        for path in [self.m.API_FILE,self.m.ENVIRONMENT,self.m.INCLUDE,self.m.FRONT_FILE]:
            temp=path.with_name(path.name+'.foreign');temp.write_bytes(path.read_bytes());os.replace(temp,path)
        result=self.m.rollback(self.stage,self.manifest,self.system)
        self.assertTrue(result['errors'])
        for path in [self.m.API_FILE,self.m.ENVIRONMENT,self.m.INCLUDE,self.m.FRONT_FILE]:
            self.assertTrue(path.exists())
        self.assertNotIn(('stop',self.m.API_UNIT),self.system.calls)

    def test_concurrent_include_before_apply_is_never_replaced(self):
        self.m.INCLUDE.write_bytes(b'foreign include')
        with self.assertRaises(ValueError):self.run_apply()
        self.assertEqual(self.m.INCLUDE.read_bytes(),b'foreign include')
        self.assertFalse(self.m.API_FILE.exists())

    def test_same_content_original_unit_with_new_inode_is_not_adopted(self):
        temporary=self.root/'foreign';temporary.write_bytes(self.m.FRONT_FILE.read_bytes())
        os.replace(temporary,self.m.FRONT_FILE)
        with self.assertRaises(ValueError):self.run_apply()
        self.assertEqual(self.system.calls,[])

    def test_secrets_are_private_from_the_first_write_under_umask_022(self):
        observed=[]
        actual_open=Path.open
        def inspect(path,*args,**kwargs):
            stream=actual_open(path,*args,**kwargs)
            if path.name.startswith(self.m.ENVIRONMENT.name+'.nov18-qa-') and args and args[0]=='xb':
                observed.append(os.fstat(stream.fileno()).st_mode & 0o777)
            return stream
        old=os.umask(0o022)
        try:
            with patch.object(Path,'open',inspect):self.run_apply()
        finally:os.umask(old)
        self.assertEqual(observed,[0o600])
        self.assertEqual(self.m.ENVIRONMENT.stat().st_mode & 0o777,0o600)
        # The staging writer shares the same secure creation primitive.
        target=self.stage/'new-secret'
        self.m.private_write(target,b'synthetic',0o600)
        self.assertEqual(target.stat().st_mode & 0o777,0o600)

    def test_occupied_loaded_transient_dropin_pid_and_listener_are_rejected(self):
        blank=self.system.state(self.m.API_UNIT)
        for change in [{'LoadState':'loaded'},{'MainPID':'19'},
                       {'FragmentPath':'/run/systemd/transient/foreign'},
                       {'DropInPaths':'/vendor/foreign.conf'},{'ActiveState':'active'}]:
            self.system.states[self.m.API_UNIT]={**blank,**change}
            with self.assertRaises(ValueError):self.m.require_vacant(self.system)
        self.system.states.pop(self.m.API_UNIT)
        self.system.free=lambda port:False
        with self.assertRaises(ValueError):self.m.require_vacant(self.system)

    def test_environment_source_is_exact_one_literal_key_and_revalidated_by_inode_and_hash(self):
        import uuid
        password='disposable_'+uuid.uuid4().hex
        url='postgresql://moneyverse_app:'+password+'@localhost:5433/disposable?sslmode=verify-full'
        self.m.SOURCE_ENV.write_text('IGNORED_OTHER_KEY=never-copied\nDATABASE_URL="'+url+'"\n')
        identity,rendered=self.m.read_environment()
        self.assertNotIn('IGNORED_OTHER_KEY',rendered)
        self.assertIn('sslmode=verify-full',rendered)
        self.m.check_snapshot(self.m.SOURCE_ENV,identity)
        self.m.SOURCE_ENV.write_text('DATABASE_URL="'+url+'"\nDATABASE_URL="'+url+'"\n')
        with self.assertRaises(ValueError):self.m.read_environment()
        with self.assertRaises(ValueError):self.m.check_snapshot(self.m.SOURCE_ENV,identity)

    def test_current_main_ci_source_job_and_artifact_binding_fail_closed(self):
        good={'headSha':'b'*40,'headBranch':'main','event':'push','status':'completed','conclusion':'success',
              'jobs':[{'name':n,'conclusion':'success'} for n in ['classify','policy','runtime-check','spring-web-check']]}
        self.m.validate_ci('b'*40,good)
        for change in [{'headSha':'a'*40},{'headBranch':'feature'},{'event':'pull_request'},
                       {'status':'in_progress'},{'conclusion':'failure'},
                       {'jobs':good['jobs'][:-1]},{'jobs':good['jobs']+[good['jobs'][0]]}]:
            with self.assertRaises(ValueError):self.m.validate_ci('b'*40,{**good,**change})

if __name__=='__main__':unittest.main()
