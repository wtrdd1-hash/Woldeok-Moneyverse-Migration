import json
import tempfile
import unittest
from datetime import datetime,timedelta,timezone
from pathlib import Path
from unittest.mock import patch
from market_alerts import pct, propose, run, read_market, journal_errors, SQL

NOW=datetime(2026,10,29,12,0,tzinfo=timezone.utc)

def snapshot(price="100",opening="100",batch=None,event=None,halt="ACTIVE"):
    return {"stocks":[{"symbol":"CHIMU314","name":"치무전자","current_price":price,
                         "day_open_price":opening,"active":True,"halt_status":halt}],
            "batches":batch or [],"events":event or []}
class Bot:
    def __init__(self,fail=False):
        self.fail=fail;self.sent=[]
    def chat_id(self):return 456
    def send(self,message):
        if self.fail:raise RuntimeError("simulated send failure")
        self.sent.append(message)

class MarketTests(unittest.TestCase):
    def test_readonly_query(self):
        self.assertIn("BEGIN READ ONLY",SQL)
        self.assertNotIn("DELETE FROM",SQL)
        self.assertIn("public.virtual_stocks",SQL)
    def test_baseline_does_not_replay_history(self):
        _,m=propose({},snapshot("130","100",[{"id":"oldbatch"}],[{"id":"oldevent"}]),[],NOW)
        self.assertEqual(m,[])
    def test_generated_draft_and_published_news_separate(self):
        s,_=propose({},snapshot(),[],NOW)
        news=snapshot(batch=[{"id":"newbatch","scenario_count":2,"headlines":"AI chip"}],
                      event=[{"id":"newevent","headline":"AI chip success","source":"ai","direction":"up",
                              "strength":2,"symbol":"CHIMU314"}])
        next_state,m=propose(s,news,[],NOW+timedelta(minutes=2))
        self.assertEqual(len(m),2)
        self.assertIn("초안",m[0][1]);self.assertIn("시장 반영",m[1][1])
        self.assertEqual(propose(next_state,news,[],NOW+timedelta(minutes=4))[1],[])
    def test_five_percent_short_move_and_cooldown(self):
        state,_=propose({},snapshot(),[],NOW)
        following,m=propose(state,snapshot("106"),[],NOW+timedelta(minutes=2))
        self.assertEqual(len(m),1);self.assertIn("+6.00%",m[0][1])
        self.assertEqual(propose(following,snapshot("114","110"),[],NOW+timedelta(minutes=4))[1],[])
    def test_ten_percent_daily_move_once(self):
        state,_=propose({},snapshot(),[],NOW)
        later,m=propose(state,snapshot("111"),[],NOW+timedelta(minutes=2))
        self.assertEqual(len(m),1);self.assertIn("+11.00%",m[0][1])
        self.assertEqual(propose(later,snapshot("113"),[],NOW+timedelta(minutes=4))[1],[])
    def test_halt_and_recovery(self):
        s,_=propose({},snapshot(),[],NOW)
        a,m=propose(s,snapshot(halt="HALTED"),[],NOW+timedelta(minutes=2))
        self.assertIn("거래정지",m[0][1])
        _,m=propose(a,snapshot(halt="ACTIVE"),[],NOW+timedelta(minutes=4))
        self.assertIn("해제",m[0][1])
    def test_daily_summary_nine_kst(self):
        t=datetime(2026,10,29,0,2,tzinfo=timezone.utc)
        state,_=propose({},snapshot(),[],t-timedelta(hours=2))
        state,m=propose(state,snapshot("102"),[],t)
        self.assertEqual(len(m),1);self.assertIn("일일",m[0][1])
        self.assertFalse(propose(state,snapshot("102"),[],t+timedelta(minutes=2))[1])
    def test_error_logs_are_count_only(self):
        s,_=propose({},snapshot(),[{"unit":"moneyverse-backend.service","cursor":"a","MESSAGE":"private"}],NOW)
        _,m=propose(s,snapshot(),[{"unit":"moneyverse-backend.service","cursor":"a"},
                                  {"unit":"moneyverse-backend.service","cursor":"b","MESSAGE":"password=private"}],
                     NOW+timedelta(minutes=2))
        self.assertEqual(len(m),1)
        self.assertIn("1건",m[0][1])
        self.assertNotIn("private",m[0][1])
    def test_failed_send_does_not_lose_new_event(self):
        with tempfile.TemporaryDirectory() as tmp:
            file=Path(tmp)/"checkpoint.json"
            bot=Bot()
            run(bot,market=snapshot(),errors=[],now=NOW,state_path=file)
            bot.fail=True
            new=snapshot(event=[{"id":"new-event","headline":"News","direction":"up"}])
            with self.assertRaises(RuntimeError):
                run(bot,market=new,errors=[],now=NOW+timedelta(minutes=2),state_path=file)
            self.assertEqual(json.loads(file.read_text())["events"],[])
            bot.fail=False
            run(bot,market=new,errors=[],now=NOW+timedelta(minutes=4),state_path=file)
            self.assertEqual(len(bot.sent),1)
            run(bot,market=new,errors=[],now=NOW+timedelta(minutes=6),state_path=file)
            self.assertEqual(len(bot.sent),1)
    def test_invalid_prices_fail_closed(self):
        self.assertIsNone(pct("NaN","100"));self.assertIsNone(pct("1","0"));self.assertIsNone(pct("oops","100"))
    def test_unsafe_container_name_rejected(self):
        with patch("market_alerts.DB_CONTAINER","bad;command"):
            with self.assertRaisesRegex(RuntimeError,"invalid"):
                read_market()
    def test_overflow_is_explicitly_summarized(self):
        s,_=propose({},snapshot(),[],NOW)
        rows=[{"id":f"event-{i}","headline":f"News {i}","direction":"up"} for i in range(70)]
        _,messages=propose(s,snapshot(event=rows),[],NOW+timedelta(minutes=2))
        self.assertEqual(len(messages),30)
        self.assertIn("추가 중요 이벤트",messages[-1][1])
        self.assertIn("41건",messages[-1][1])
    def test_unknown_journal_unit_filtered(self):
        s,_=propose({},snapshot(),[],NOW)
        _,m=propose(s,snapshot(),[{"unit":"secret.service","cursor":"xy"}],NOW+timedelta(minutes=2))
        self.assertFalse(m)
if __name__=="__main__":
    unittest.main()
