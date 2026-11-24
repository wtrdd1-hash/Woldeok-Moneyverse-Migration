import importlib.util,pathlib,tempfile,unittest
p=pathlib.Path(__file__).with_name("upgrade.py")
s=importlib.util.spec_from_file_location("test_native_upgrade",p)
upgrade=importlib.util.module_from_spec(s);s.loader.exec_module(upgrade)

class UpgradeTest(unittest.TestCase):
 def test_only_canonical_prior_test_unit_can_be_retargeted(self):
  old,new="a"*40,"b"*40
  prior=upgrade.deploy.routing.unit(upgrade.jar_path(old)).encode()
  result=upgrade.retarget(prior,old,new)
  self.assertIn(upgrade.jar_path(new).encode(),result)
  self.assertNotIn(b"4550",result)
  with self.assertRaises(ValueError):upgrade.retarget(prior+b"\nEnvironmentFile=/foreign\n",old,new)
 def test_process_requires_matching_argv_working_directory_and_open_jar(self):
  with tempfile.TemporaryDirectory()as tmp:
   root=pathlib.Path(tmp);proc=root/"proc";p=proc/"42";(p/"fd").mkdir(parents=True)
   jar=root/"generation/app.jar";jar.parent.mkdir();jar.write_bytes(b"jar")
   (p/"cmdline").write_bytes(b"java\0-jar\0"+str(jar).encode()+b"\0")
   (p/"cwd").symlink_to(jar.parent);(p/"fd/4").symlink_to(jar)
   upgrade.require_process(42,jar,proc)
   (p/"fd/4").unlink()
   with self.assertRaises(ValueError):upgrade.require_process(42,jar,proc)
   (p/"fd/4").symlink_to(jar);(p/"cmdline").write_bytes(b"java\0-jar\0/foreign.jar\0")
   with self.assertRaises(ValueError):upgrade.require_process(42,jar,proc)
 def test_invalid_source_cannot_name_a_generation(self):
  with self.assertRaises(ValueError):upgrade.jar_path("../production")
  with self.assertRaises(ValueError):upgrade.jar_path("main")

 def test_crash_after_link_keeps_a_durable_planned_inode_receipt(self):
  import subprocess,sys,json
  with tempfile.TemporaryDirectory()as tmp:
   root=pathlib.Path(tmp);unit=root/"unit";unit.write_text("old")
   script="""import importlib.util,pathlib,os
s=importlib.util.spec_from_file_location('d',DEPLOY)
d=importlib.util.module_from_spec(s);s.loader.exec_module(d)
p=pathlib.Path(UNIT);stage=pathlib.Path(STAGE);proof=d.snapshot(p);link=os.link
def crash(a,b):
 link(a,b)
 if pathlib.Path(b)==p:os._exit(99)
os.link=crash
d.atomic(p,b'new',proof,0o600,stage,'unit-owned')
""".replace("DEPLOY",repr(str(p.with_name("deploy.py")))).replace("UNIT",repr(str(unit))).replace("STAGE",repr(str(root)))
   result=subprocess.run([sys.executable,"-c",script],capture_output=True)
   self.assertEqual(99,result.returncode)
   intent=json.loads((root/"unit-owned.intent.json").read_text())
   self.assertEqual(upgrade.deploy.snapshot(unit),intent["candidate"])
   self.assertFalse((root/"unit-owned.json").exists())
 def test_recovery_recognizes_missing_post_exchange_unit_receipt(self):
  import json
  with tempfile.TemporaryDirectory()as tmp:
   root=pathlib.Path(tmp);unit=root/"unit";unit.write_text("old");before=upgrade.deploy.snapshot(unit)
   (root/"unit-before.json").write_text(json.dumps(before))
   held=root/(".unit.nov18-qa-"+"a"*32);held.mkdir();(held/"displaced").hardlink_to(unit);unit.unlink()
   unit.write_text("new");new=upgrade.deploy.snapshot(unit)
   (root/"unit-owned.intent.json").write_text(json.dumps({"path":str(unit),"candidate":new,"recoveryDirectory":str(held)}))
   self.assertEqual("candidate",upgrade.recovery_state(root,unit)[0])
   unit.unlink()
   self.assertEqual("displaced",upgrade.recovery_state(root,unit)[0])
   unit.write_text("foreign")
   with self.assertRaises(ValueError):upgrade.recovery_state(root,unit)
 def test_starting_or_exiting_process_is_pending_without_accepting_foreign_identity(self):
  from unittest.mock import patch,Mock
  with patch.object(upgrade,"manager",return_value=42),patch.object(upgrade,"require_process",side_effect=[ValueError("JAR not open yet"),None]):
   self.assertEqual(42,upgrade.wait_process(pathlib.Path("/new.jar"),Mock(),timeout=1))
  with patch.object(upgrade,"manager",side_effect=[42,0]),patch.object(upgrade,"require_process",side_effect=FileNotFoundError()):
   self.assertEqual(0,upgrade.wait_process(pathlib.Path("/new.jar"),Mock(),timeout=1))
  with patch.object(upgrade,"manager",return_value=42),patch.object(upgrade,"require_process",side_effect=ValueError("foreign")):
   with self.assertRaises(ValueError):upgrade.wait_process(pathlib.Path("/new.jar"),Mock(),timeout=.01)

if __name__=="__main__":unittest.main()
