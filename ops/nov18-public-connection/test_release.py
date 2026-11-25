"""Disposable owned-file transactions; no host unit or database mutations."""
import importlib.util,json,os,tempfile,unittest
from unittest.mock import patch
from pathlib import Path

def module():
    p=Path(__file__).with_name('release.py')
    spec=importlib.util.spec_from_file_location('public_connection_release',p)
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
class BatchTests(unittest.TestCase):
    def setUp(self):
        self.m=module();self.tmp=tempfile.TemporaryDirectory(prefix='mv-public-batch-');self.root=Path(self.tmp.name)
        self.stage=self.root/'stage';self.stage.mkdir()
        self.targets=[self.root/'one',self.root/'two']
        for n,p in enumerate(self.targets):p.write_bytes(('original'+str(n)).encode())
        self.old={str(p):self.m.base.snapshot(p) for p in self.targets}
        self.changes={str(p):('replacement'+str(i)).encode() for i,p in enumerate(self.targets)}
        self.before={str(p):p.read_bytes() for p in self.targets}
    def tearDown(self):self.tmp.cleanup()
    def test_batch_checks_inode_and_restores_owned_config_after_reload_failure(self):
        calls=[];failed=[False]
        def verify():
            calls.append('verify')
            if not failed[0]:failed[0]=True;raise RuntimeError('Synthetic validation failure')
        with self.assertRaises(RuntimeError):
            self.m.replace_batch(self.stage,'test',self.changes,self.old,self.before,verify,lambda:calls.append('reload'))
        for p in self.targets:self.assertEqual(p.read_bytes(),self.before[str(p)])
        outcome=json.loads((self.stage/'test-inverse.json').read_text());self.assertTrue(outcome['complete'])
        self.assertEqual(calls,['verify','verify','reload'])
    def test_foreign_same_byte_inode_is_never_restored_or_deleted(self):
        def verify():
            p=self.targets[0];temp=self.root/'foreign';temp.write_bytes(p.read_bytes());os.replace(temp,p)
            raise RuntimeError('Synthetic concurrent replacement')
        with self.assertRaises(RuntimeError):
            self.m.replace_batch(self.stage,'test',self.changes,self.old,self.before,verify,lambda:None)
        self.assertEqual(self.targets[0].read_bytes(),self.changes[str(self.targets[0])])
        outcome=json.loads((self.stage/'test-inverse.json').read_text());self.assertFalse(outcome['complete'])
    def test_existing_proposal_cannot_be_applied_twice(self):
        self.m.replace_batch(self.stage,'test',self.changes,self.old,self.before,lambda:None,lambda:None)
        with self.assertRaises(ValueError):
            self.m.replace_batch(self.stage,'test',self.changes,self.old,self.before,lambda:None,lambda:None)
    def test_production_requires_matching_completed_test_and_untampered_browser_report(self):
        m=self.m;source='a'*40;report={'source':source,'origin':'http://test.easy-scraping.com','failed':0,'cases':240,'interactionsPassed':True,'freshProfile':True}
        with self.assertRaises((ValueError,FileNotFoundError)):m.require_test_approval(self.stage,{'source':source,'artifact':{'sha256':'b'*64}})
        raw=json.dumps(report).encode();(self.stage/'test-browser-report.json').write_bytes(raw)
        (self.stage/'test-browser-accepted.json').write_text(json.dumps({'accepted':True,'source':source,'reportSha256':m.digest(raw)}))
        (self.stage/'test-apply.json').write_text(json.dumps({'accepted':True,'source':source,'artifactSha256':'b'*64}))
        backend=b'{}';(self.stage/'test-backend-report.json').write_bytes(backend)
        (self.stage/'test-backend-accepted.json').write_text(json.dumps({'accepted':True,'source':source,'reportSha256':m.digest(backend)}))
        with patch.object(m,'verify_backend_process'):m.require_test_approval(self.stage,{'source':source,'artifact':{'sha256':'b'*64}})
        (self.stage/'test-browser-report.json').write_text('{}')
        with patch.object(m,'verify_backend_process'),self.assertRaises(ValueError):m.require_test_approval(self.stage,{'source':source,'artifact':{'sha256':'b'*64}})

    def test_production_inverse_hands_restored_test_inodes_back_before_test_inverse(self):
        m=self.m
        m.replace_batch(self.stage,'test',self.changes,self.old,self.before,lambda:None,lambda:None)
        test_before={str(p):p.read_bytes() for p in self.targets}
        expected={str(p):m.base.snapshot(p) for p in self.targets}
        prod={str(p):('production'+str(i)).encode() for i,p in enumerate(self.targets)}
        m.replace_batch(self.stage,'prod',prod,expected,test_before,lambda:None,lambda:None)
        self.assertTrue(m.restore_batch(self.stage,'prod',test_before,lambda:None,lambda:None)['complete'])
        self.assertTrue(m.restore_batch(self.stage,'test',self.before,lambda:None,lambda:None)['complete'])
        for p in self.targets:self.assertEqual(p.read_bytes(),self.before[str(p)])
    def test_changed_predecessor_journal_is_not_adopted_by_inverse_handoff(self):
        m=self.m;m.replace_batch(self.stage,'test',self.changes,self.old,self.before,lambda:None,lambda:None)
        previous={str(p):p.read_bytes() for p in self.targets};expected={str(p):m.base.snapshot(p) for p in self.targets}
        m.replace_batch(self.stage,'prod',{str(p):b'production' for p in self.targets},expected,previous,lambda:None,lambda:None)
        path=self.stage/'test-journal.json';value=json.loads(path.read_text());value['owned'][str(self.targets[0])][1]+=1;path.write_text(json.dumps(value))
        self.assertFalse(m.restore_batch(self.stage,'prod',previous,lambda:None,lambda:None)['complete'])

    def test_backend_gate_requires_isolated_same_artifact_and_every_real_check(self):
        m=self.m;source='a'*40;artifact='b'*64
        report={'applicationSource':source,'jarSha256':artifact,'apiOrigin':'http://127.0.0.1:55438',
            'processIdentity':{'unit':'moneyverse-nov18-test-backend-v20261122.service','pid':'123','openJarSha256':artifact,'sourceVersion':source},
            'database':{'name':'moneyverse_nov18_public_test','host':'127.0.0.1','port':55436,'role':'moneyverse_app','readOnly':True,'syntheticOnly':True,'migrationParity':True,'migrationsCount':1},
            'checks':{key:True for key in ['sourceIdentity','databaseIsolation','readOnly','migrationParity','anonymousSession','walletDenied','adminDenied','stockCanonical','boardCanonical','forgedActorDenied','testCors','privilegeBoundary','syntheticOnly','guestSummaryRedacted','jobsConfiguredOff','botOffline','loopbackSandbox']}}
        manifest={'source':source,'artifact':{'sha256':artifact}}
        m.validate_backend_report(report,manifest)
        for mutate in [lambda q:q.update(applicationSource='c'*40),lambda q:q.update(apiOrigin='http://127.0.0.1:80'),
                       lambda q:q['database'].update(port=5433),lambda q:q['database'].update(syntheticOnly=False),
                       lambda q:q['checks'].update(stockCanonical=False)]:
            value=json.loads(json.dumps(report));mutate(value)
            with self.assertRaises(ValueError):m.validate_backend_report(value,manifest)

    def test_preflight_refuses_changed_source_target_before_any_write(self):
        p=self.targets[1];temp=self.root/'foreign';temp.write_bytes(p.read_bytes());os.replace(temp,p)
        with self.assertRaises(ValueError):
            self.m.replace_batch(self.stage,'test',self.changes,self.old,self.before,lambda:None,lambda:None)
        self.assertEqual(self.targets[0].read_bytes(),self.before[str(self.targets[0])])

if __name__=='__main__':unittest.main()
