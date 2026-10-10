from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import re, os

SRC = r'C:\Users\Administrator\Desktop\Yameira_Capital_商业企划书.docx'
OUT = r'C:\Users\Administrator\Desktop\arc\Yameira_Capital_网站修改增加说明.docx'

chapters = [
('0','项目基础信息'),('1','执行摘要'),('2','公司愿景'),('3','公司使命'),('4','公司核心定位'),('5','四大核心业务板块'),('6','投资业务盈利模式'),('7','第二业务板块'),('8','AI投资平台'),('9','96%以上交易成功率的表述'),('10','第三业务板块'),('11','私人财富管理服务'),('12','客户资产保护模式'),('13','第四业务板块'),('14','主要企业解决方案'),('15','公司治理结构'),('16','董事会'),('17','董事会专业委员会'),('18','总部八大业务与职能中心'),('19','Reno数据中心'),('20','公司监管战略'),('21','Investment Adviser监管'),('22','证券经纪业务边界'),('23','商品、期货及外汇业务'),('24','数字资产业务监管原则'),('25','AML / KYC / Sanctions'),('26','客户准入制度'),('27','利益冲突管理'),('28','企业风险管理体系'),('29','三道防线'),('30','融资结构'),('31','融资信息证明制度'),('32','50亿美元资金使用原则'),('33','公司收入结构'),('34','收入多元化战略'),('35','竞争优势'),('36','公司品牌策略'),('37','官网建议'),('38','人才战略'),('39','创始合伙人标准'),('40','股权架构原则'),('41','三阶段发展战略'),('42','核心KPI'),('43','未来五年的战略目标'),('44','公司长期定位'),('45','监管实施原则'),('46','核心合规底线'),('47','对外风险披露原则'),('48','Yameira Capital的核心价值主张'),('49','企业口号'),('50','结论'),('51','法律及监管声明')]

def target(title):
    m = {
    '项目基础信息':'index.html（首页）', '执行摘要':'index.html（首页）', '公司愿景':'about.html（关于我们）', '公司使命':'about.html（关于我们）', '公司核心定位':'index.html（首页）',
    '四大核心业务板块':'products.html（产品总览）', '投资业务盈利模式':'pricing.html（定价/费用）', '第二业务板块':'gen.html（量化与研究）', 'AI投资平台':'gen.html（量化与研究）', '96%以上交易成功率的表述':'gen.html（量化与研究）',
    '第三业务板块':'private-wealth.html（新增）', '私人财富管理服务':'private-wealth.html（新增）', '客户资产保护模式':'private-wealth.html（新增）', '第四业务板块':'institutional-solutions.html（新增）', '主要企业解决方案':'institutional-solutions.html（新增）',
    '公司治理结构':'about.html（关于我们）', '董事会':'team.html（团队）', '董事会专业委员会':'governance.html（新增）', '总部八大业务与职能中心':'about.html（关于我们）', 'Reno数据中心':'technology.html（新增）',
    '公司监管战略':'risk-governance.html（新增）', 'Investment Adviser监管':'risk-governance.html（新增）', '证券经纪业务边界':'products.html（产品总览）', '商品、期货及外汇业务':'futures.html / forex.html', '数字资产业务监管原则':'digital-assets.html（新增）', 'AML / KYC / Sanctions':'compliance.html（新增）', '客户准入制度':'open-account.html（开户/准入）', '利益冲突管理':'risk-governance.html（新增）', '企业风险管理体系':'risk-governance.html（新增）', '三道防线':'risk-governance.html（新增）',
    '融资结构':'investors.html（新增）', '融资信息证明制度':'investors.html（新增）', '50亿美元资金使用原则':'investors.html（新增）', '公司收入结构':'pricing.html（定价/费用）', '收入多元化战略':'pricing.html（定价/费用）', '竞争优势':'about.html（关于我们）', '公司品牌策略':'index.html（首页）', '官网建议':'index.html（首页）', '人才战略':'careers.html（新增）', '创始合伙人标准':'careers.html（新增）', '股权架构原则':'careers.html（新增）', '三阶段发展战略':'about.html（关于我们）', '核心KPI':'investors.html（新增）', '未来五年的战略目标':'about.html（关于我们）', '公司长期定位':'index.html（首页）', '监管实施原则':'risk-governance.html（新增）', '核心合规底线':'risk-governance.html（新增）', '对外风险披露原则':'disclosures.html（新增）', 'Yameira Capital的核心价值主张':'index.html（首页）', '企业口号':'index.html（首页）', '结论':'index.html（首页）', '法律及监管声明':'disclosures.html（新增）'}
    return m.get(title, '新增页面：'+title.lower().replace(' ','-')+'.html')

def heading_num(title):
    if title == '项目基础信息': return '序章'
    if title == '法律及监管声明': return '附录'
    return '第'+str(next(i for i,x in enumerate(chapters) if x[1]==title))+'章'

def add_page_num(paragraph):
    run = paragraph.add_run()
    fld = OxmlElement('w:fldSimple'); fld.set(qn('w:instr'),'PAGE'); run._r.append(fld)

srcdoc = Document(SRC)
source_text = '\n'.join(p.text for p in srcdoc.paragraphs)

doc = Document()
sec = doc.sections[0]; sec.top_margin=Inches(.65); sec.bottom_margin=Inches(.65); sec.left_margin=Inches(.8); sec.right_margin=Inches(.8)
styles = doc.styles
styles['Normal'].font.name='Aptos'; styles['Normal'].font.size=Pt(10)
for s in ['Title','Heading 1','Heading 2']:
    styles[s].font.name='Aptos'; styles[s].font.color.rgb=RGBColor(0,0,0)
styles['Title'].font.size=Pt(24); styles['Heading 1'].font.size=Pt(16); styles['Heading 2'].font.size=Pt(12)

p=doc.add_paragraph(style='Title'); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.add_run('Yameira Capital 网站修改与增加说明')
p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.add_run('以 Yameira Capital 商业企划书为基准的逐章实施清单').bold=True
doc.add_paragraph('用途：本文件将企划书按原文顺序转化为网站实施任务。原企划书保持不变；本文件中的页码均指本说明文档页码。所有“新增页面”均表示当前项目中未定位到合适既有页面，需要新建并接入导航。')
doc.add_page_break()

doc.add_heading('目录', level=1)
doc.add_paragraph('页码按“每章独立起始页”编排；章节页码从第 5 页开始。')
for idx, (_, title) in enumerate(chapters):
    page = 5 + idx
    p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(2); p.add_run(f'{heading_num(title)}：{title}').bold=True; p.add_run(f' …… {page}')
doc.add_page_break()

for idx, (_, title) in enumerate(chapters):
    if idx>0: doc.add_page_break()
    action = '增加' if '新增' in target(title) or title in ['项目基础信息','官网建议','企业口号','法律及监管声明'] else '修改'
    doc.add_heading(f'序号{idx+1}：{action}：{title}', level=1)
    doc.add_paragraph(f'企划书章节：{heading_num(title)}  |  本说明页：{5+idx}  |  目标页面：{target(title)}')
    doc.add_heading('改哪里', level=2)
    doc.add_paragraph(f'定位到项目文件 `_fron/{target(title).split("（")[0]}`。若标注“新增”，在 `_fron` 下创建对应 HTML 页面，并在全站导航、页脚和相关 CTA 中加入入口。')
    doc.add_heading('怎么改', level=2)
    doc.add_paragraph('保持现有站点的页头、页脚、字体和响应式结构；将本章内容拆成可扫描的页面区块，使用明确标题、短段落、列表和合规提示。涉及投资表现、监管、客户资产或融资数字时，必须加入风险披露、来源说明和“以最终法律审核为准”的文案。')
    doc.add_heading('改什么 / 加什么', level=2)
    # pull representative source phrases by chapter heading position
    key_terms = {
      '项目基础信息':'展示公司名称、Dallas总部、Reno数据与技术中心、初创阶段、总部规划人数、融资状态及全球多资产/AI量化/私人财富/机构数字化四项定位。',
      '执行摘要':'首页首屏加入机构定位、四大业务入口及“AI辅助、人工判断、风险治理”的决策框架。',
      '公司愿景':'增加愿景区块，突出全球资本、AI、数据科学与专业投资管理的连接，并链接四大业务页。',
      '公司使命':'增加使命与五项原则：资本保护、风险调整后回报、人工监督、可解释性、内置合规。',
      '公司核心定位':'统一品牌描述为全球多资产投资管理、私人财富与金融科技解决方案公司，避免仅称 Crypto 或 AI Trading。',
      '四大核心业务板块':'建立四张业务入口：多资产投资、AI量化研究、私人财富、机构数字化转型，并为每张卡配置详情页链接。',
      '投资业务盈利模式':'在费用页说明自营收益、管理费、绩效报酬、私募基金管理四类收入及适用资格/法律限制。',
      '第二业务板块':'增加量化研究流程图：市场数据、清洗、特征工程、模型、回测、压力测试、验证、委员会审批、执行、监控。',
      'AI投资平台':'增加 Yameira Intelligence Platform 页面，展示 Market Intelligence、Quantitative Research、AI Simulation、Risk Intelligence 四引擎。',
      '96%以上交易成功率的表述':'删除或限制公开的“96%成功率”宣传；增加回测/模拟结果免责声明和 Marketing Compliance 审核说明。',
      '第三业务板块':'新增 Private Wealth 页面，说明服务对象为高净值个人、家族办公室、企业家及机构客户。',
      '私人财富管理服务':'新增组合管理、全球资产配置、家族财富协调、税务/遗产专业协作四个服务模块。',
      '客户资产保护模式':'增加独立合格托管机构模式说明，明确客户资产不进入普通运营账户，并加入托管与对账提示。',
      '第四业务板块':'新增 Institutional Solutions 页面，面向银行、资管、保险、FinTech 和 Family Office。',
      '主要企业解决方案':'增加 AI 转型、数据治理、流程智能、AI治理、企业架构五个解决方案模块。',
      '公司治理结构':'增加股东/董事会/委员会/CEO/执行团队/业务职能的组织架构图。',
      '董事会':'团队页新增董事成员、职能、研究/数据/技术/流程智能专长及职责边界。',
      '董事会专业委员会':'新增治理页，列出 Audit、Risk、Compliance、Investment、AI Model Governance、Compensation 委员会职责。',
      '总部八大业务与职能中心':'补充 Dallas 总部八大中心、职能范围和人数规划，链接招聘页。',
      'Reno数据中心':'新增技术基础设施页，说明计算、数据、网络安全、模型运行和灾备边界，避免披露敏感细节。',
      '公司监管战略':'新增 Risk & Governance 入口，按业务类型展示牌照、注册、豁免、托管、披露和监督前置原则。',
      'Investment Adviser监管':'增加投资顾问业务说明、客户类别、州/联邦监管待确认提示与法律审核入口。',
      '证券经纪业务边界':'在产品页区分投资管理与经纪业务，不把交易执行能力表述为已取得经纪牌照。',
      '商品、期货及外汇业务':'在 futures/forex 页增加 CFTC、NFA、CTA、CPO、FCM 等边界提示及业务尚待许可说明。',
      '数字资产业务监管原则':'新增数字资产页，区分自有资金投资与为客户交易/兑换/转移/托管，优先采用 Investment Management Model。',
      'AML / KYC / Sanctions':'新增合规页，展示 KYC/KYB、AML、资金/财富来源、受益所有人、PEP、制裁筛查和交易监控。',
      '客户准入制度':'开户页增加 Low Risk 至 Prohibited 五级风险评分，明确高风险客户需 Compliance、AML 和高管批准。',
      '利益冲突管理':'治理页增加自营与客户交易隔离、MNPI、个人账户交易、分配冲突、信息墙、黑名单/观察名单。',
      '企业风险管理体系':'新增风险框架区块，覆盖市场、信用、对手方、流动性、运营、网络、模型、监管、法律和声誉风险。',
      '三道防线':'用流程图展示 Business、Risk & Compliance、Internal Audit 三道防线及向董事会审计委员会报告。',
      '融资结构':'新增投资人页面，谨慎呈现 50 亿美元为“承诺资金或已到账资金”，具体以资本化文件为准。',
      '融资信息证明制度':'列出 Subscription Agreements、Cap Table、Bank Confirmation、Wire Records、KYC 等数据室材料。',
      '50亿美元资金使用原则':'增加资本部署区块，展示储备、固定收益、全球多资产、量化、数字资产、技术和运营的比例区间。',
      '公司收入结构':'费用页增加自营收益、管理费、绩效费、私人财富咨询费、企业咨询费、技术平台收入六类来源。',
      '收入多元化战略':'说明长期收入以管理费、咨询费、企业技术收入和投资表现构成，降低短期自营交易依赖。',
      '竞争优势':'关于页增加资本实力、AI+Quant+Human、董事会技术、数据治理、多资产、机构+HNW、投资+技术七项优势。',
      '公司品牌策略':'统一视觉与文案为 Institutional、Intelligent、Disciplined、Global、Secure、Transparent，禁用收益保证词。',
      '官网建议':'首页采用 Yameira Capital、Intelligence for Global Capital，并设置 Investment Management、Private Wealth、AI、Institutional、Risk 五个导航入口。',
      '人才战略':'新增招聘页，按 Executive、Investment、Quant/AI、Wealth、Compliance 分类展示岗位与能力要求。',
      '创始合伙人标准':'招聘/治理页明确 Founding Partner 的能力、客户、资本、监管、长期经营等至少三项标准，并区分 Founder/Partner/Employee。',
      '股权架构原则':'新增治理说明，展示 Founder Shares、Investor Shares、Employee Equity Pool、Executive Equity 及 4-year vesting/1-year cliff。',
      '三阶段发展战略':'增加路线图：0-12个月制度基础，12-24个月投资与财富业务，24-60个月合规全球扩张。',
      '核心KPI':'投资人页增加 KPI 仪表盘定义：投资、客户、风险、AI、公司五类指标，避免只展示收益率。',
      '未来五年的战略目标':'关于页增加五年目标：机构可信度、重复性投资体系、可扩展AI、长期客户关系和高度受控风险。',
      '公司长期定位':'统一为 Global AI-Enabled Investment Management & Financial Intelligence Platform，并呈现 Capital/Investment/Intelligence/Risk/Client 五层能力。',
      '监管实施原则':'所有受监管业务 CTA 前置法律审核清单，未确认许可、注册、豁免、披露、托管和监督前不得上线。',
      '核心合规底线':'新增全站合规底线清单：不承诺收益、不伪造业绩、不混用资产、不绕过风控/合规、不让未验证AI控制重大资本。',
      '对外风险披露原则':'新增 Disclosures 页面，固定展示本金损失、历史不代表未来、回测/模拟限制及非真实交易声明。',
      'Yameira Capital的核心价值主张':'首页按投资人、客户、金融机构、人才四类受众展示价值主张。',
      '企业口号':'首页和页脚统一主品牌、投资版、科技版口号，保持中英文对应且不构成收益承诺。',
      '结论':'首页末尾增加 Institutional First 行动顺序：治理、合规、人才、风险、基础设施、投资、客户、AUM、产品、全球市场。',
      '法律及监管声明':'新增并固定链接法律声明页，明确企划书不是法律/证券/税务意见，重大事实需内部档案和独立尽调支持。'
    }
    doc.add_paragraph(key_terms.get(title, '按本章原文完整覆盖业务、治理、技术、合规和运营要求，并在页面中提供对应入口、说明与风险提示。'))
    doc.add_paragraph('验收标准：页面可从导航或上下文 CTA 访问；移动端可读；不出现未经证实的收益承诺；涉及监管和融资数据的文案保留证据/审核状态。')

# footer
for section in doc.sections:
    fp=section.footer.paragraphs[0]; fp.alignment=WD_ALIGN_PARAGRAPH.CENTER; fp.add_run('Yameira Capital 网站修改与增加说明  |  '); add_page_num(fp)

doc.save(OUT)
print(OUT)
