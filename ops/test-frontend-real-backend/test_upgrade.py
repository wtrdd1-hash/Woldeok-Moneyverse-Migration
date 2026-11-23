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
if __name__=="__main__":unittest.main()
