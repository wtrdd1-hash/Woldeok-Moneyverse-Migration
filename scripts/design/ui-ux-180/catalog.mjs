import { routes } from './routes.mjs';

const states = ['ready', 'loading', 'empty', 'error', 'expired', 'forbidden', 'confirm', 'submitting', 'success'];
const definitions = new Map();
function define(route, title, family, purpose, fields = [], columns = [], sections = [], actions = []) {
  definitions.set(route, { title, family, purpose, fields, columns, sections, actions });
}

const admin = [
 ['','Operations overview','Review the community economy and respond to exceptions.','Service|Status|Latest check|Owner','Service health|Action queue|Economy overview','Open incident'],
 ['analytics','Community analytics','Understand participation without exposing private member records.','Metric|Period|Value|Trend','Participation trend|Audience segments','Export aggregate'],
 ['api-health','API health','Inspect endpoint availability and trace failed requests.','Endpoint|Method|Status|Latency','Endpoint health|Recent failures','Inspect request'],
 ['bank','Bank operations','Review deposit policy, accrual jobs and bank exceptions.','Account|Balance|Accrual|Status','Deposit policy|Accrual queue','Review policy'],
 ['blog','Editorial desk','Manage draft articles, publication and corrections.','Title|Author|Visibility|Updated','Editorial queue|Scheduled publications','New article'],
 ['bonds','Bond administration','Review issuances, maturities and settlement status.','Issue|Principal|Maturity|Status','Issue calendar|Settlement queue','Review issuance'],
 ['catalog','Catalog administration','Maintain product definitions and visibility.','Product|Category|Visibility|Updated','Catalog filters|Product details','New product'],
 ['central-bank','Central bank policy','Review policy proposals and their audit trail.','Policy|Current value|Effective date|State','Policy history|Change review','Review proposal'],
 ['content','Content moderation','Review reported posts with context and appeal history.','Content|Report reason|Queue|Updated','Moderation queue|Appeals','Review report'],
 ['controls','Feature controls','Pause features with a reason and a reversible change record.','Feature|State|Reason|Updated','Feature switches|Change history','Review change'],
 ['discord','Discord integration','Inspect integration delivery and command configuration.','Integration|Connection|Last delivery|State','Delivery queue|Command catalog','Inspect delivery'],
 ['economy','Economy operations','Inspect ledger reconciliation and supply changes.','Measure|Observed|Expected|Result','Reconciliation|Supply history','Inspect variance'],
 ['economy/scenario-lab','Economic scenario lab','Compare hypothetical policy effects without applying them.','Scenario|Assumptions|Result|Updated','Scenario comparison|Sensitivity','Run simulation'],
 ['enterprises','Enterprise administration','Review business listings and operational restrictions.','Enterprise|Owner|Sector|Status','Business registry|Review queue','Review enterprise'],
 ['fx','FX administration','Review rate sources, spreads and stale quotes.','Pair|Source|Quoted at|Status','Rate sources|Spread policy','Inspect quote'],
 ['help','Help center editor','Maintain useful support content and revisions.','Article|Category|Locale|State','Article library|Revision history','New help article'],
 ['kdic','Deposit protection','Review coverage limits, eligible accounts and claims.','Claim|Coverage|Amount|Status','Coverage policy|Claim queue','Review claim'],
 ['logs','Audit explorer','Follow administrative actions through immutable records.','Sequence|Action|Actor|Timestamp','Audit filters|Record details','Inspect record'],
 ['logs/activity','Activity log','Inspect administrative action history by actor and subject.','Sequence|Actor|Action|Subject','Activity timeline|Record details','Inspect activity'],
 ['logs/delivery','Delivery log','Trace notification attempts and retry outcomes.','Delivery|Channel|Attempt|Result','Delivery timeline|Retry details','Inspect delivery'],
 ['logs/errors','Error log','Group failures by source and impact.','Fingerprint|Source|Occurrences|Last seen','Error groups|Trace details','Inspect error'],
 ['logs/integrity','Audit integrity','Review verification outcomes without rewriting history.','Range|Verified at|Result|Reference','Chain verification|Verification history','Inspect verification'],
 ['logs/system','System events','Review service restarts and background job events.','Service|Event|Severity|Time','System timeline|Job outcomes','Inspect event'],
 ['market','Market operations','Review symbols, market sessions and trading exceptions.','Symbol|Session|Quote age|State','Market sessions|Trading exceptions','Review symbol'],
 ['market/ai-news','Market news review','Review generated news drafts before publication.','Headline|Source|Review state|Updated','Review queue|Attribution','Review draft'],
 ['mint','Mint oversight','Inspect authorized currency issuance and supporting records.','Issuance|Purpose|Amount|State','Issuance ledger|Authorization','Inspect issuance'],
 ['money-flow','Money flow','Trace aggregate movements between economic accounts.','Source|Destination|Amount|Period','Flow diagram|Movement ledger','Inspect flow'],
 ['operations/storage','Storage operations','Inspect capacity, backup evidence and restore readiness.','Volume|Used|Available|State','Capacity history|Backup evidence','Inspect backup'],
 ['pension','Pension operations','Review contributions, benefit policies and payout exceptions.','Plan|Member group|Period|State','Contribution ledger|Payout queue','Review payout'],
 ['safety','Safety moderation','Handle safety reports with context and restricted access.','Report|Category|Priority|State','Safety queue|Appeals','Review safety report'],
 ['security','Security center','Review security alerts and privileged access.','Alert|Severity|Subject|State','Access reviews|Security events','Inspect alert'],
 ['seo','Search visibility','Review crawlability and publication metadata.','Page|Index state|Canonical|Updated','Index coverage|Metadata issues','Inspect page'],
 ['seo-audit','SEO audit','Review broken links, metadata and structured-data findings.','Finding|URL|Severity|State','Audit results|Page details','Inspect finding'],
 ['shop','Shop operations','Manage stock, product availability and purchase exceptions.','Product|Price|Stock|Visibility','Inventory|Purchase exceptions','Review product'],
 ['support','Support inbox','Resolve member requests with least-privilege access.','Ticket|Topic|Assigned to|State','Ticket inbox|Conversation','Open ticket'],
 ['treasury','Treasury oversight','Review allocations and balances against ledger records.','Fund|Allocation|Available|State','Fund allocation|Treasury ledger','Review allocation'],
 ['treasury/grants','Grant review','Review grant requests and their disbursement receipts.','Application|Program|Requested|State','Application queue|Disbursement','Review application'],
 ['users','Member administration','Find members and inspect permitted account actions.','Member|Joined|Account state|Roles','Member directory|Account actions','Inspect member'],
 ['users/[id]','Member details','Review one member account with an auditable reason.','Account field|Current value|Updated|Source','Identity|Role history|Account actions','Review account action'],
 ['work','Work operations','Review task definitions, submissions and verified rewards.','Task|Category|Submissions|State','Task catalog|Verification queue','Review submission'],
];
for (const [path,title,purpose,cols,sections,acts] of admin)
 define('/admin'+(path?'/'+path:''),title,'admin',purpose,['Search','Status','Date range'],cols.split('|'),sections.split('|'),[acts,'View audit trail']);

const calculators = [
 ['capital-gains-tax-calculator','Capital gains tax','Estimate gains and review the assumptions behind tax.','Sale proceeds|Acquisition cost|Eligible expenses|Tax year','Estimated tax|Net proceeds|Tax assumptions'],
 ['compound-calculator','Compound growth','See how contributions and compounding build over time.','Starting amount|Monthly contribution|Annual return|Years','Growth projection|Contributions vs returns|Yearly breakdown'],
 ['crypto-apy-calculator','Crypto yield','Compare compounding scenarios and explain their risks.','Starting amount|Annual yield|Compounds per year|Days','Projected yield|Compounding schedule|Risk assumptions'],
 ['dividend-tax-calculator','Dividend income','Estimate dividend withholding and net income.','Ticker|Shares held|Dividend per share|Withholding rate','Gross vs net income|Payment schedule|Tax assumptions'],
 ['farming-calculator','Work income','Compare verified job reward assumptions and time.','Job|Tasks per day|Days worked|Reward per task','Time vs income|Daily projection|Reward limits'],
 ['fire-calculator','Financial independence','Explore a target based on spending and withdrawal assumptions.','Annual expenses|Current assets|Annual savings|Withdrawal rate','Target portfolio|Time to target|Sensitivity'],
 ['gift-tax-calculator','Gift tax','Estimate a gift-tax scenario and applicable allowances.','Gift amount|Relationship|Previous gifts|Tax year','Estimated liability|Allowance breakdown|Calculation notes'],
 ['goal-wealth-calculator','Savings goal','Work backwards from a target to a contribution plan.','Target amount|Starting balance|Target date|Expected return','Required contribution|Goal progress|Alternative plans'],
 ['isa-calculator','ISA account','Compare allowances and estimated after-tax outcomes.','Contribution|Holding years|Expected return|Account category','Account projection|Tax comparison|Eligibility'],
 ['kimchi-premium-calculator','Market premium','Compare two sourced prices with currency conversion.','Local price|Overseas price|FX rate|Fees','Premium comparison|Cost breakdown|Source timestamps'],
 ['loan-interest-calculator','Loan repayment','Understand payment schedules before choosing a loan scenario.','Loan principal|Annual interest|Term months|Repayment method','Monthly payment|Principal vs interest|Repayment schedule'],
 ['pension-tax-calculator','Pension tax','Estimate pension contributions and deductions.','Annual contribution|Income band|Age|Tax year','Estimated deduction|Annual contribution|Assumptions'],
 ['real-estate-calculator','Property costs','Compare acquisition, financing and ongoing costs.','Property price|Down payment|Loan rate|Holding years','Total ownership cost|Financing|Cost breakdown'],
 ['retirement-calculator','Retirement plan','Explore income needs and retirement funding.','Current age|Retirement age|Current assets|Monthly savings','Retirement gap|Projected assets|Income plan'],
 ['salary-calculator','Take-home pay','Estimate deductions and monthly take-home income.','Annual salary|Dependants|Non-taxable pay|Tax year','Net monthly pay|Deductions|Annual summary'],
 ['stock-calculator','Trade outcome','Estimate a hypothetical trade including fees.','Buy price|Sell price|Quantity|Fees','Profit or loss|Break-even price|Fee breakdown'],
 ['tax-calculator','Tax estimate','Review an income scenario and its calculation assumptions.','Taxable income|Tax year|Deductions|Income category','Estimated tax|Effective rate|Bracket breakdown'],
 ['youth-leap-calculator','Youth savings','Review a contribution plan, eligibility and expected maturity.','Monthly contribution|Term months|Annual rate|Income band','Maturity projection|Contribution breakdown|Eligibility'],
];
for(const [slug,title,purpose,fields,sections] of calculators)
 define('/tools/'+slug,title,'calculator',purpose,fields.split('|'),['Year','Contributions','Returns','Total'],sections.split('|'),['Calculate estimate','Reset inputs']);
define('/tools/quant-studio','Quant studio','quant','Compare strategies using transparent hypothetical assumptions.',['Universe','Date range','Strategy','Benchmark'],['Metric','Strategy','Benchmark'],['Strategy builder','Performance comparison','Drawdown'],['Run backtest','Save scenario']);

define('/','Your Moneyverse','home','A calmer place to follow your money, community and next adventure.',[],['Activity','Type','Amount','Time'],['Wallet overview','Your next steps','Community highlights'],['Open wallet','Explore quests']);
define('/dashboard','My dashboard','dashboard','Keep your personal finances and activity in one place.',[],['Activity','Account','Amount','Time'],['Asset allocation','Recent activity','Personal goals'],['Manage goals','Open wallet']);
define('/wallet','My wallet','wallet','See available funds and review every movement.',[],['Transaction','Direction','Amount','Status'],['Available balance','Send money','Recent transactions'],['Send money','View all activity']);
define('/wallet/activity','Wallet activity','ledger','Search your wallet history and open a verifiable receipt.',['Search transactions','Transaction type','Date range'],['Transaction','Type','Amount','Time'],['Transaction history','Statement summary'],['Export statement','Open receipt']);
define('/wallet/activity/transactions/[transactionId]','Transaction receipt','receipt','A clear record of the movement, fees and outcome.',[],['Transaction ID','Status','Amount','Fee','From','To','Timestamp'],['Receipt details','Ledger reference','Related activity'],['Copy reference','Back to activity']);
define('/bank','Your bank','bank','Keep everyday funds and savings clearly separated.',['Amount','Transfer direction'],['Movement','Amount','Account','Date'],['Deposit and withdraw','Savings overview','Interest terms'],['Review transfer','Open savings pot']);
define('/bank/savings-pot','Savings pots','savings','Give each savings goal its own place.',['Pot name','Target amount','Target date','Contribution'],['Pot','Saved','Goal','Progress'],['Savings goals','Contribution history'],['Create savings pot','Add contribution']);
define('/stocks','Stock market','market','Explore the market with price context and clear risk.',['Search symbols','Sector','Session'],['Symbol','Price','Change','Volume'],['Market overview','Watchlist','Market movers'],['Open symbol','Manage watchlist']);
define('/stocks/[symbol]','Stock details','stock','Read the chart, understand the cost, then review an order.',['Order side','Order type','Quantity','Limit price'],['Price','Quantity','Side'],['Candlestick chart','Volume','Moving averages','Order book','Order review'],['Review order','Add to watchlist']);
define('/stocks/portfolio','My portfolio','portfolio','Understand positions, allocation and unrealized outcomes.',[],['Position','Quantity','Average cost','Market value'],['Portfolio allocation','Holdings','Performance'],['Open position','View trade history']);
define('/stocks/history','Trade history','ledger','Follow your orders from placement to settlement.',['Symbol','Order status','Date range'],['Order','Side','Quantity','Status'],['Order history','Settlement details'],['Open order','Export history']);
define('/stocks/watchlist','Watchlist','watchlist','Keep the symbols you care about within reach.',['Search symbols','Sort by'],['Symbol','Price','Change','Alert'],['Watched symbols','Price alerts'],['Add symbol','Create alert']);
define('/stocks/alerts','Price alerts','alerts','Set a threshold and understand how you will be notified.',['Symbol','Condition','Target price','Channel'],['Symbol','Condition','Target','State'],['Active alerts','Triggered alerts'],['Create alert','Manage notifications']);
define('/stocks/compare','Compare stocks','compare','Compare the same periods and measures side by side.',['First symbol','Second symbol','Period'],['Measure','First symbol','Second symbol'],['Relative performance','Valuation comparison','Risk notes'],['Compare symbols','Reset comparison']);
define('/stocks/derivatives','Derivative products','derivatives','Review eligibility and product risk before any order.',['Product','Expiry','Side','Quantity'],['Contract','Expiry','Price','Risk'],['Product chain','Risk disclosure','Order review'],['Review eligibility','Read product terms']);
define('/stocks/league','Trading league','leaderboard','Compare game performance with transparent ranking rules.',['Season','Ranking group'],['Rank','Player','Score','Change'],['Season standings','My standing','Scoring rules'],['View scoring rules','Open profile']);
define('/stocks/community','Market discussion','discussion','Discuss ideas while keeping analysis distinct from advice.',['Search discussions','Symbol'],['Discussion','Author','Replies','Updated'],['Symbol discussions','Community guidelines'],['New discussion','Browse symbols']);

const finance = [
 ['/advisor','Financial guide','plan','Explore your goals and the trade-offs between them.','Goal|Time horizon|Risk preference','Goal|Target|Progress|Next step','Your plan|Goal priorities|Risk overview','Review plan'],
 ['/bonds','Government bonds','bonds','Compare maturities, terms and your holdings.','Maturity|Issue category','Issue|Yield|Maturity|Availability','Available issues|My holdings|Maturity calendar','Review issue'],
 ['/businesses','My businesses','business','Follow the operations and finances of your businesses.','Business category|Status','Business|Revenue|Costs|State','Business overview|Cash flow|Operations','Open business'],
 ['/businesses/ventures','Startup ventures','ventures','Review venture proposals and their funding terms.','Sector|Funding state','Venture|Funding target|Progress|State','Venture directory|Funding timeline|Risk disclosure','Review venture'],
 ['/enterprises','Enterprise directory','enterprise','Find community businesses and their services.','Search enterprises|Sector','Enterprise|Sector|Services|Status','Featured enterprises|Business directory','Open enterprise'],
 ['/fx','Currency exchange','exchange','Compare a quote and its fee before reviewing an exchange.','From currency|To currency|Amount','Pair|Rate|Spread|Quoted at','Exchange quote|Rate history|Fee details','Review exchange'],
 ['/central-bank','Central bank','policy','Understand monetary policy and its published history.','Policy category|Period','Policy|Effective date|Change|Status','Policy overview|Published decisions|Supply history','Read decision'],
 ['/mint','Currency issuance','issuance','Inspect published issuance records and their purposes.','Period|Purpose','Issuance|Purpose|Amount|Date','Issuance history|Supply explanation','Open issuance record'],
 ['/treasury','Public treasury','treasury','Follow public allocations and published expenditure.','Fund|Period','Fund|Allocated|Spent|Available','Fund allocation|Spending history|Public reports','Open spending record'],
 ['/kdic','Deposit protection','coverage','Understand covered balances and the limits of protection.','Account category','Account|Eligible balance|Limit|Coverage','Coverage overview|Covered accounts|Protection rules','Check coverage'],
 ['/pension','My pension','pension','Follow contributions and review future benefit assumptions.','Plan|Period','Period|Contribution|Employer share|Status','Contribution history|Benefit projection|Plan terms','Review contribution'],
 ['/prediction','Prediction markets','prediction','Read outcomes, rules and risk before participating.','Topic|Closing date','Market|Outcome|Closes|State','Open markets|My positions|Resolution rules','Review market'],
];
for (const [r,t,f,p,fields,cols,sections,act] of finance)
 define(r,t,f,p,fields.split('|'),cols.split('|'),sections.split('|'),[act,'View history']);

const community = [
 ['/announcements','Announcements','feed','Keep up with decisions and service updates.','Category|Search','Pinned updates|Latest announcements','Read announcement'],
 ['/blog','Moneyverse journal','editorial','Stories, ideas and guides from the community.','Topic|Search','Featured story|Latest articles','Read article'],
 ['/board','Community board','board','Find conversations worth joining.','Search posts|Category','Pinned posts|Recent discussions','New post'],
 ['/clubs','Find your club','clubs','Discover a group to build, trade and play with.','Search clubs|Interests|Admission','Club directory|Recommended clubs','Explore club'],
 ['/clubs/[clubId]','Club home','club','Your shared plans, conversations and upcoming events.','Search club posts','Club overview|Club discussion|Upcoming events','Join club'],
 ['/clubs/[clubId]/members','Club members','members','See the people and roles in your club.','Search members|Role','Member directory|Role descriptions','Open member profile'],
 ['/clubs/warfare','Club competition','competition','Review fixtures, eligibility and results.','Season|Competition state','Current fixtures|Club standings|Competition rules','Open fixture'],
 ['/help','Help center','help','Find a clear answer or reach the support team.','Search help|Topic','Popular questions|Browse topics|Contact support','Search help'],
 ['/newspaper','The Moneyverse daily','newspaper','A readable digest of community and economy news.','Edition|Topic','Lead story|Economy brief|Community notes','Read edition'],
];
for(const [r,t,f,p,fields,sections,action] of community)
 define(r,t,f,p,fields.split('|'),['Title','Author','Updated'],sections.split('|'),[action,'Browse topics']);
for(const [r,t] of [['/blog/[slug]','Journal article'],['/announcements/[announcementId]','Announcement'],['/board/[postId]','Community post'],['/help/[slug]','Help article']])
 define(r,t,'article','Read the full content with context, related links and clear discussion controls.',[],['Author','Published','Updated'],['Article body','On this page','Related reading','Comments'],['Share article','Back to list']);
define('/clubs/new','Create a club','club-create','Bring people together with a clear purpose and membership rules.',['Club name','Description','Interests','Admission policy','Club emblem'],[],['Club details','Membership rules','Preview'],['Review club','Cancel']);
define('/gallery','Community gallery','gallery','Explore photographs and creations from the community.',['Search photos','Category','Sort by'],[],['Featured collection','Photo grid','Community favorites'],['Upload photo','Open collection']);
define('/gallery/[photoId]','Photo details','photo','See the photograph, its creator and the conversation around it.',[],['Creator','Published','License'],['Full photograph','Caption','Comments','Related photos'],['Save photo','Report photo']);
define('/gallery/submit','Upload a photo','upload','Choose an image and review its details before publishing.',['Photo','Title','Caption','Category','Alt text','Visibility'],[],['Image preview','Photo details','Publication review'],['Review upload','Cancel']);
for(const [r,t] of [['/chat','Messages'],['/lobby','Community lobby'],['/support','Support conversations']])
 define(r,t,'chat',r==='/support'?'Ask for help and follow the status of your request.':'Keep conversations organized and see what is new.',['Search conversations','Message'],['Conversation','Updated','Unread'],['Conversation list','Message thread','Conversation details'],[r==='/support'?'New support request':'New conversation','Send message']);

const account = [
 ['/account','My account','account','Manage your identity, preferences and privacy.','Display name|Language|Time zone','Profile|Security|Notifications|Privacy','Save preferences'],
 ['/account/notifications','Notifications','notifications','Choose which updates reach you and where.','Transaction updates|Community replies|Security alerts|Delivery channel','Notification preferences|Recent notifications','Save notifications'],
 ['/account/privacy','Privacy controls','privacy-settings','Choose what others can see and manage your data.','Profile visibility|Activity visibility|Contact preference','Visibility controls|Data access|Account deletion','Save privacy settings'],
 ['/account/security','Account security','security','Keep sign-in methods and active sessions under control.','Current password|New password|Confirm new password','Sign-in methods|Active sessions|Security events','Review password change'],
 ['/profile','My profile','profile','Your public identity and community contributions.','Search activity','Profile overview|Badges|Recent activity','Edit profile'],
 ['/profile/[userId]','Member profile','profile-public','Explore a member profile within their privacy choices.', 'Activity category','Public profile|Contributions|Achievements','Send message'],
 ['/profile/settings','Edit profile','profile-edit','Choose how your profile appears to the community.','Display name|Biography|Profile image|Visibility','Profile preview|Personal details','Save profile'],
 ['/invite/[code]','Club invitation','invitation','Review the destination and rules before accepting an invitation.','Acceptance','Club details|Invitation status|Community rules','Accept invitation'],
];
for(const [r,t,f,p,fields,sections,act] of account)
 define(r,t,f,p,fields.split('|'),[],sections.split('|'),[act,'Cancel']);
const auth = [
 ['/login','Welcome back','Sign in to your Moneyverse.','Email|Password','Sign in'],
 ['/login/providers','Choose how to sign in','Use a connected provider without sharing its password.','Provider','Continue with provider'],
 ['/register','Create your account','Start with a secure account and clear consent.','Display name|Email|Password|Confirm password|Terms consent|Privacy consent','Create account'],
 ['/forgot-password','Reset your access','Request a recovery link for your registered email.','Email','Send recovery link'],
 ['/reset-password','Choose a new password','Use your recovery link to set a new password.','New password|Confirm password','Reset password'],
 ['/verify-email','Verify your email','Confirm the address associated with your account.','Verification code','Verify email'],
 ['/verify-email-change','Confirm email change','Review the new address before confirming this change.','Verification code','Confirm email change'],
];
for(const [r,t,p,fields,act] of auth)
 define(r,t,'auth',p,fields.split('|'),[],['Account verification','Provider sign-in','Help'],[act,'Get help']);
const legal = [
 ['/terms','Terms of service','Understand your rights and responsibilities.','Using Moneyverse|Virtual economy|Account responsibilities|Disputes'],
 ['/privacy','Privacy policy','Know how personal information is handled.','Information collected|Purpose and retention|Your rights|Contact'],
 ['/account-deletion','Delete account','Review what will happen before requesting account deletion.','Account impact|Records retained|Data removal|Request review'],
 ['/data-deletion','Data deletion','Understand your options for deleting personal information.','Deletion options|Retention exceptions|Request process|Contact'],
 ['/safety','Community safety','A safer community starts with clear boundaries.','Community rules|Reporting|Moderation|Appeals'],
 ['/safety/takedown','Request a takedown','Submit a clear report and follow the review process.','Request details|Evidence|Rights and permissions|Review process'],
];
for(const [r,t,p,sections] of legal)
 define(r,t,r.includes('deletion')||r.includes('takedown')?'legal-action':'legal',p,r.includes('takedown')?['Content URL','Reason','Evidence','Contact email']:[],[],sections.split('|'),[r.includes('deletion')?'Review deletion request':r.includes('takedown')?'Review report':'Contact support','Read related policy']);

const games = [
 ['/arcade','The arcade','arcade','Find a game, understand its rules and start when eligible.','Game category','Featured game|Game library|Recent sessions','View game rules'],
 ['/casino','Casino lounge','casino','Check eligibility, limits and availability before play.','Game|Stake|Limit','Game selection|Play limits|Round history','Review eligibility'],
 ['/quests','Your next quest','quests','Turn small steps into meaningful progress.','Quest category|Quest state','Featured quest|Quest board|Claimed rewards','Open quest'],
 ['/work','Work board','work','Choose a task, complete it and track verification.','Job category|Difficulty|Availability','Available tasks|My assignments|Reward history','Open task'],
 ['/inventory','My inventory','inventory','Find your items and understand where they can be used.','Search items|Category|Sort by','Item grid|Item details|Usage history','Open item'],
 ['/collections','Collections','collections','Follow collection progress and explore missing pieces.','Collection category|Progress','Featured collection|Collection sets|Rewards','Open collection'],
 ['/progression','Your growth','progression','See your progress, milestones and next unlock.','Progress category','Level journey|Milestones|Unlocked features','Open milestone'],
 ['/progression/prestige','Prestige','prestige','Understand what resets and what is preserved before prestige.','Acknowledgement','Eligibility|Preserved progress|Reset review','Review prestige'],
 ['/calendar','Community calendar','calendar','Plan around events, deadlines and market sessions.','Month|Event category','Month calendar|Upcoming events|Event details','Open event'],
 ['/seasons','Current season','seasons','Follow the season journey and its reward rules.','Season|Reward category','Season progress|Reward track|Season rules','Open reward'],
 ['/spaces','My space','space','Make a place of your own in Moneyverse.','Space category','Space preview|Owned spaces|Customization','Customize space'],
 ['/spaces/real-estate','Real estate','property','Compare properties and their ownership costs.','District|Price range|Property type','District map|Property listings|Cost review','Open property'],
 ['/marketplace','Community market','marketplace','Browse member listings and review trade terms.','Search listings|Category|Price range','Featured listings|Listing grid|Buyer guidance','Open listing'],
 ['/marketplace/auction','Auctions','auction','Understand timing and bid commitments before participating.','Category|Closing time|Auction state','Closing soon|Auction listings|My bids','Review bid'],
];
for(const [r,t,f,p,fields,sections,act] of games)
 define(r,t,f,p,fields.split('|'),['Item','Requirement','Reward','State'],sections.split('|'),[act,'View history']);
const guides = [
 ['/guide','Moneyverse guide','Find a helpful starting point for every feature.','Getting started|Money and markets|Community and play'],
 ['/guide/career-mastery','Career mastery','Understand job progression and task verification.','Choose a career|Build mastery|Track verified rewards'],
 ['/guide/dopamine-system','Growth guide','Understand progression without losing sight of your goals.','Progress and milestones|Reward limits|Healthy play'],
 ['/guide/stock-trading','Stock trading guide','Learn chart basics, order review and risk.','Read a chart|Review an order|Understand risk'],
 ['/guide/virtual-banking','Banking guide','Understand deposits, transfers and interest terms.','Move funds|Savings goals|Interest and limits'],
 ['/guide/glossary','Financial glossary','Look up a term and follow it into context.','Popular terms|Browse alphabetically|Related guides'],
 ['/guide/glossary/[term]','Glossary term','A clear definition with examples and related terms.','Definition|Worked example|Related terms'],
];
for(const [r,t,p,sections] of guides)
 define(r,t,r.endsWith('[term]')?'glossary-term':'guide',p,['Search guide'],[],sections.split('|'),['Read guide','Browse glossary']);
for(const [r,t,f,p,fields,sections,act] of [
 ['/tools','Financial tools','tools','Choose a focused tool and inspect its assumptions.','Search tools|Topic','Popular calculators|All tools|Saved scenarios','Open calculator'],
 ['/calculators','Calculator library','tools','A clear starting point for savings, loans and tax scenarios.','Search calculators|Topic','Savings tools|Borrowing tools|Tax tools','Open calculator'],
 ['/search','Search Moneyverse','search','Find pages, articles, members and public resources.','Search|Content type','Search results|Related searches|Recent searches','Search'],
 ['/status','Service status','status','Check reported service availability and incident updates.','Service|Period','Service health|Incident timeline|Maintenance notices','Read incident'],
 ['/developer','Developer center','developer','Find public integration documentation and contract examples.','Search documentation','API reference|Integration guide|Service limits','Read API reference'],
 ['/features','Explore Moneyverse','features','Find the parts of Moneyverse that fit your next goal.','Feature category','Money|Community|Play and progress','Explore feature'],
 ['/roadmap','Product roadmap','roadmap','Follow planned work and published progress.','Area|Milestone state','Now|Next|Later|Completed changes','Open milestone'],
 ['/design-preview','Design system','design-system','Review the visual language and accessible component states.','Component family|State','Typography|Surfaces|Inputs and actions|Feedback','Inspect component'],
]) define(r,t,f,p,fields.split('|'),[],sections.split('|'),[act,'Get help']);

define('/shop','Moneyverse shop','shop','Find useful items with clear prices, availability and purchase review.',['Search products','Category','Availability'],['Product','Price','Stock','Visibility'],['Featured products','Product catalog','Purchase history'],['Open product','View inventory']);
define('/shop/catalog','Product catalog','shop','Browse the complete catalog and understand every purchase.',['Search catalog','Category','Sort by'],['Product','Price','Stock','Availability'],['Catalog filters','Product grid','Product details'],['Review product','View inventory']);
const calculatorColumns = {
 'loan-interest-calculator':['Period','Payment','Interest','Principal','Remaining'],
 'salary-calculator':['Item','Annual amount','Monthly amount'],
 'capital-gains-tax-calculator':['Item','Taxable base','Rate','Estimated tax'],
 'gift-tax-calculator':['Item','Allowance','Taxable base','Estimated tax'],
 'dividend-tax-calculator':['Payment date','Gross amount','Withholding','Net amount'],
 'pension-tax-calculator':['Contribution','Deduction limit','Applicable rate','Estimated deduction'],
 'tax-calculator':['Bracket','Taxable base','Rate','Estimated tax'],
 'kimchi-premium-calculator':['Market','Price','Currency','Source time'],
 'stock-calculator':['Metric','Buy assumption','Sell assumption','Outcome'],
};
function resolve(route) {
 const canonical = route.replace(/^\/\[locale\]/, '');
 let result = definitions.get(canonical);
 let preset = false;
 if (!result && /\/\[(preset|ticker|slug)\]$/.test(canonical) && canonical.startsWith('/tools/')) {
  result = definitions.get(canonical.replace(/\/\[(preset|ticker|slug)\]$/, ''));
  preset = true;
 }
 if (canonical.startsWith('/tools/compound-interest-calculator')) {
  result = definitions.get('/tools/compound-calculator'); preset = canonical.includes('[preset]');
 }
 if (!result) throw new Error('Missing explicit route design: '+route);
 const admin = route.startsWith('/admin');
 const navigation = admin ? 'admin' : /^\/(wallet)/.test(canonical) ? 'wallet'
  : /^\/shop/.test(canonical) ? 'shop' : /^\/bank/.test(canonical) ? 'bank' : /^\/stocks/.test(canonical) ? 'stocks'
  : ['home','dashboard'].includes(result.family) ? 'home'
  : /^(auth|account|profile|security|notifications|privacy|invitation)/.test(result.family) ? 'account'
  : ['feed','editorial','board','article','gallery','photo','upload','clubs','club','club-create','members','chat','discussion','newspaper'].includes(result.family) ? 'community'
  : ['calculator','quant','tools'].includes(result.family) ? 'tools' : 'explore';
 return {
  ...result, route, id: route === '/' ? 'home' : route.slice(1).replaceAll('/','--').replaceAll('[','_').replaceAll(']','_'),
  fields: [...result.fields], columns: [...(calculatorColumns[canonical.split('/')[2]]||result.columns)], unit: result.family==='calculator' ? (canonical.includes('farming-calculator')?'WLD':'KRW') : result.family==='quant'?'%':'WLD',
  sections: preset ? ['Saved scenario',...result.sections] : [...result.sections],
  actions: [...result.actions], states: [...states], navigation, role: admin?'administrator':'member-or-public',
  preset, localeAlias: route.startsWith('/[locale]/'), visualApproval:'PROPOSED', functionality:'DESIGN_ONLY',
 };
}
export const pages = routes.map(resolve);
