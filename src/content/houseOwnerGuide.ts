import type { Lang } from "@/lib/site";

type Copy = Record<Lang, string>;

const c = (en: string, hi: string): Copy => ({ en, hi });
const asCopy = (items: [string, string][]): Copy[] =>
  items.map(([en, hi]) => c(en, hi));

export interface OwnerGuideActivity {
  id: string;
  title: Copy;
  youtube: Copy;
}

export interface OwnerGuideStage {
  id: string;
  title: Copy;
  summary: Copy;
  image: string;
  imageAlt: Copy;
  photoCredit: string;
  activities: OwnerGuideActivity[];
  inspections: Copy[];
  method: Copy[];
  tools: Copy[];
  quality: Copy[];
  mistakes: Copy[];
  warnings: Copy[];
  before: Copy[];
  during: Copy[];
  after: Copy[];
  payment: {
    complete: Copy;
    inspect: Copy;
    measure: Copy;
    records: Copy;
  };
}

const stages: (Omit<OwnerGuideStage, "activities"> & {
  activities: [string, string][];
})[] = [
  {
    id: "stage-01",
    title: c("Before construction", "निर्माण से पहले"),
    summary: c(
      "Verify the plot, appoint the right professionals, approve the drawings and agree a measurable scope before mobilising.",
      "प्लॉट की जांच, सही विशेषज्ञों का चयन, ड्रॉइंग की मंज़ूरी और साइट शुरू होने से पहले स्पष्ट काम व माप तय करें।",
    ),
    image: "/assets/engineer-plan-review-960.webp",
    imageAlt: c("A construction professional reviewing building drawings", "निर्माण विशेषज्ञ भवन की ड्रॉइंग देखते हुए"),
    photoCredit: "Unsplash License",
    activities: [
      ["Land document verification", "ज़मीन के दस्तावेज़ की जांच"],
      ["Plot dimensions and boundary checking", "प्लॉट का माप और सीमा जांचना"],
      ["Road access and site surroundings", "सड़क की पहुंच और साइट का आसपास"],
      ["Soil testing and SBC", "मिट्टी की जांच और SBC"],
      ["Groundwater level checking", "भूजल स्तर की जांच"],
      ["Architect and structural engineer selection", "आर्किटेक्ट और स्ट्रक्चरल इंजीनियर चुनना"],
      ["Building plan approval", "बिल्डिंग प्लान की मंज़ूरी"],
      ["Architectural drawing checking", "आर्किटेक्चरल ड्रॉइंग जांचना"],
      ["Structural drawing checking", "स्ट्रक्चरल ड्रॉइंग जांचना"],
      ["BOQ and estimated budget preparation", "BOQ और बजट तैयार करना"],
      ["Contractor selection", "ठेकेदार चुनना"],
      ["Contractor agreement", "ठेकेदार के साथ लिखित समझौता"],
      ["Construction schedule planning", "निर्माण का शेड्यूल बनाना"],
    ],
    inspections: asCopy([
      ["Ownership, title chain and land-record details match the plot; have a local property lawyer verify legal status.", "मालिकाना हक, रजिस्ट्री की चेन और भू-अभिलेख प्लॉट से मिलें; कानूनी स्थिति स्थानीय प्रॉपर्टी वकील से जांचें।"],
      ["Plot area, corners, road access and any encumbrances are independently verified.", "प्लॉट का क्षेत्रफल, कोने, रास्ता और किसी भी कानूनी भार की अलग से पुष्टि हो।"],
      ["Soil investigation report is available to the structural designer where required.", "जहां ज़रूरी हो, स्ट्रक्चरल डिज़ाइनर को मिट्टी की जांच रिपोर्ट दी गई हो।"],
      ["Approved architectural and structural drawings are coordinated and revision-dated.", "स्वीकृत आर्किटेक्चरल और स्ट्रक्चरल ड्रॉइंग एक-दूसरे से मेल खाएं और उन पर revision date हो।"],
      ["BOQ states inclusions, exclusions, material brands/specifications and measurement basis.", "BOQ में शामिल/अलग काम, सामग्री की ब्रांड/स्पेसिफिकेशन और मापने का तरीका साफ़ हो।"],
      ["Agreement describes scope, rates, billing evidence, schedule, change orders and defect handling.", "समझौते में काम, रेट, बिल के प्रमाण, शेड्यूल, बदलाव और दोष सुधारने की प्रक्रिया लिखी हो।"],
      ["Budget includes approval, utility, temporary works, escalation and contingency allowances.", "बजट में मंज़ूरी, यूटिलिटी, अस्थायी काम, कीमत बढ़ने और आकस्मिक खर्च की गुंजाइश हो।"],
      ["Copies of permits, reports, drawings and signed commercial documents are stored together.", "परमिट, रिपोर्ट, ड्रॉइंग और हस्ताक्षरित व्यावसायिक दस्तावेज़ एक जगह सुरक्षित हों।"],
    ]),
    method: asCopy([
      ["Verify title, land use, access and boundaries with the relevant local professionals and authorities.", "संबंधित स्थानीय विशेषज्ञों और प्राधिकरण से मालिकाना हक, भूमि उपयोग, रास्ता और सीमा की पुष्टि करें।"],
      ["Commission the site/soil investigations needed by the design team; do not infer soil capacity from a nearby plot.", "डिज़ाइन टीम की ज़रूरत अनुसार साइट/मिट्टी की जांच करवाएं; पड़ोसी प्लॉट देखकर soil capacity न मानें।"],
      ["Freeze coordinated, approved drawings and a BOQ before signing a construction scope.", "निर्माण का काम तय करने से पहले coordinated, approved ड्रॉइंग और BOQ तय करें।"],
      ["Compare contractors on the same written scope, specifications, exclusions and programme.", "ठेकेदारों की तुलना एक जैसे लिखित scope, specifications, exclusions और programme पर करें।"],
      ["Sign a written agreement covering measurement, variations, bills, quality records, safety and handover.", "माप, बदलाव, बिल, गुणवत्ता रिकॉर्ड, सुरक्षा और handover को शामिल करता लिखित समझौता करें।"],
    ]),
    tools: asCopy([
      ["Document checklist and secure project folder", "दस्तावेज़ चेकलिस्ट और सुरक्षित प्रोजेक्ट फ़ोल्डर"],
      ["Surveyor's tape/total station operated by a qualified surveyor", "योग्य surveyor द्वारा tape/total station से सर्वे"],
      ["Soil investigation report and approved drawing register", "मिट्टी की जांच रिपोर्ट और स्वीकृत ड्रॉइंग रजिस्टर"],
      ["Comparable BOQs and a written contract", "तुलना योग्य BOQ और लिखित contract"],
    ]),
    quality: asCopy([
      ["Use the authority-approved drawings, project specifications and current applicable local rules.", "प्राधिकरण से स्वीकृत ड्रॉइंग, प्रोजेक्ट specifications और लागू स्थानीय नियम मानें।"],
      ["Foundation design must use the project-specific soil investigation and responsible structural engineer's design.", "नींव का डिज़ाइन इसी प्रोजेक्ट की soil report और जिम्मेदार structural engineer के डिज़ाइन से हो।"],
      ["Verify land records and permitted use with the relevant local authority and legal professional.", "भू-अभिलेख और अनुमत भूमि उपयोग संबंधित स्थानीय प्राधिकरण और कानूनी विशेषज्ञ से जांचें।"],
    ]),
    mistakes: asCopy([
      ["Starting on verbal promises, uncoordinated drawings or a quote with unclear exclusions.", "मौखिक वादों, आपस में न मिली ड्रॉइंग या अस्पष्ट exclusions वाले quote पर काम शुरू करना।"],
      ["Treating a general internet rate or neighbour's foundation as the project's design basis.", "इंटरनेट के सामान्य rate या पड़ोसी की नींव को अपने प्रोजेक्ट का design basis मानना।"],
      ["Paying a large advance without a signed scope, receipt and agreed recovery terms.", "हस्ताक्षरित scope, रसीद और वसूली की शर्त बिना बड़ा advance देना।"],
    ]),
    warnings: asCopy([
      ["Ownership dispute, unclear access or a mismatch between ground boundaries and title papers.", "मालिकाना विवाद, अस्पष्ट रास्ता या ज़मीन की सीमा और कागज़ में अंतर।"],
      ["Pressure to build before permits, coordinated structural drawings or a written contract are ready.", "परमिट, coordinated structural drawing या लिखित contract से पहले काम शुरू करने का दबाव।"],
      ["A contractor asks for full-stage payment without measurements, records or a written bill.", "माप, रिकॉर्ड या लिखित बिल के बिना पूरे stage का भुगतान मांगा जाए।"],
    ]),
    before: asCopy([
      ["Collect current title and land-use documents.", "नए title और land-use दस्तावेज़ इकट्ठा करें।"],
      ["Confirm measured boundaries, access and site constraints.", "नापी हुई सीमा, रास्ता और साइट की पाबंदियां पक्की करें।"],
      ["Obtain required soil/design reports and approved drawings.", "ज़रूरी soil/design report और स्वीकृत ड्रॉइंग लें।"],
      ["Agree the BOQ, exclusions, programme and contract in writing.", "BOQ, exclusions, programme और contract लिखित में तय करें।"],
    ]),
    during: asCopy([
      ["Keep a revision-controlled drawing set at site.", "साइट पर revision-controlled ड्रॉइंग सेट रखें।"],
      ["Record approved changes before the changed work starts.", "बदला हुआ काम शुरू होने से पहले मंज़ूर बदलाव लिखें।"],
      ["Photograph milestones and keep bills, test reports and receipts.", "हर milestone की फोटो लें और bill, test report व रसीद रखें।"],
    ]),
    after: asCopy([
      ["File signed agreement, approvals, soil report and final drawings.", "हस्ताक्षरित समझौता, मंज़ूरी, soil report और final drawing सुरक्षित रखें।"],
      ["Update the BOQ and schedule for every agreed variation.", "हर मंज़ूर बदलाव के लिए BOQ और schedule अपडेट करें।"],
    ]),
    payment: {
      complete: c("Design, scope, approvals and agreed pre-start obligations are complete.", "डिज़ाइन, scope, मंज़ूरी और शुरू करने की तय शर्तें पूरी हों।"),
      inspect: c("Check deliverables and permits—not a verbal promise to start.", "काम शुरू करने के मौखिक वादे नहीं, deliverables और परमिट जांचें।"),
      measure: c("Measure only the work/services actually included in the signed agreement.", "सिर्फ हस्ताक्षरित समझौते में शामिल वास्तविक काम/सेवा का माप मानें।"),
      records: c("Signed agreement, approved drawings, permit copies and receipt for any advance.", "हस्ताक्षरित समझौता, स्वीकृत ड्रॉइंग, परमिट कॉपी और advance की रसीद।"),
    },
  },
  {
    id: "stage-02",
    title: c("Site clearing & layout", "साइट की सफाई और लेआउट"),
    summary: c("Establish the actual plot controls and building grid from approved drawings before earthwork begins.", "मिट्टी का काम शुरू करने से पहले स्वीकृत ड्रॉइंग से असली प्लॉट नियंत्रण और building grid तय करें।"),
    image: "/assets/site-measurement-960.webp",
    imageAlt: c("Engineers marking out a building foundation on site", "इंजीनियर साइट पर भवन की नींव का लेआउट बना रहे हैं"),
    photoCredit: "SFC Sean A. Foley / U.S. Army · Public domain",
    activities: [
      ["Site cleaning", "साइट की सफाई"], ["Boundary verification", "सीमा की पुष्टि"], ["Building layout marking", "बिल्डिंग लेआउट मार्क करना"],
      ["Centreline marking", "Centreline मार्क करना"], ["Grid marking", "Grid मार्क करना"], ["Building dimensions checking", "भवन का माप जांचना"],
      ["Diagonal measurement checking", "Diagonal माप जांचना"], ["Foundation location verification", "नींव की जगह की पुष्टि"],
    ],
    inspections: asCopy([
      ["Survey reference point and plot boundary are confirmed by measurement.", "Survey reference point और प्लॉट सीमा माप से पक्के हों।"],
      ["Approved building footprint and setbacks are transferred to the site.", "स्वीकृत building footprint और setbacks साइट पर उतारे गए हों।"],
      ["Grid and centreline dimensions match the current architectural/structural drawings.", "Grid और centreline का माप मौजूदा architectural/structural drawing से मिले।"],
      ["Corners, offsets and diagonals are checked before excavation.", "खुदाई से पहले कोने, offset और diagonal जांचे गए हों।"],
      ["Column/footing locations are checked against the structural grid.", "Column/footing की जगह structural grid से जांची गई हो।"],
      ["Reference pegs are protected from plant and vehicle movement.", "Reference peg मशीन और वाहन से सुरक्षित हों।"],
      ["Neighbouring structures and underground services are identified.", "पास के ढांचे और भूमिगत सेवाओं की पहचान की गई हो।"],
      ["A dated photo and measured layout record are kept.", "तारीख वाली फोटो और layout माप का रिकॉर्ड रखा हो।"],
    ]),
    method: asCopy([
      ["Clear debris without disturbing the survey benchmarks or neighbouring property.", "Survey benchmark या पड़ोसी की संपत्ति बिगाड़े बिना मलबा साफ़ करें।"],
      ["A qualified surveyor transfers the approved footprint, setbacks and reference datum.", "योग्य surveyor स्वीकृत footprint, setbacks और reference datum साइट पर उतारे।"],
      ["Mark grid intersections and centrelines with offset pegs that will survive excavation.", "Excavation के बाद भी बचने वाले offset peg से grid intersection और centreline मार्क करें।"],
      ["Measure overall dimensions, key offsets and both diagonals; resolve differences before digging.", "कुल माप, ज़रूरी offset और दोनों diagonal नापें; अंतर हो तो खुदाई से पहले ठीक करें।"],
      ["Walk each footing/column location with the approved structural drawing.", "हर footing/column की जगह स्वीकृत structural drawing से मिलाकर देखें।"],
    ]),
    tools: asCopy([
      ["Surveyor's total station/level and measuring tape", "Surveyor का total station/level और measuring tape"],
      ["String line, pegs, plumb bob and marking paint", "String line, peg, plumb bob और marking paint"],
      ["Approved setting-out drawing and site benchmark record", "स्वीकृत setting-out drawing और site benchmark record"],
      ["PPE and service-location information", "PPE और service-location की जानकारी"],
    ]),
    quality: asCopy([
      ["Setting-out tolerances and datums must follow the approved drawings and project specification.", "Setting-out tolerance और datum स्वीकृत drawing और project specification के अनुसार हों।"],
      ["Local setback and site-boundary requirements must be verified with the approved plan.", "स्थानीय setback और site-boundary शर्तें स्वीकृत plan से जांचें।"],
    ]),
    mistakes: asCopy([
      ["Using a boundary wall as the legal plot line without a survey.", "Survey के बिना boundary wall को कानूनी plot line मान लेना।"],
      ["Starting excavation before checking diagonals, grid offsets and services.", "Diagonal, grid offset और services जांचे बिना खुदाई शुरू करना।"],
      ["Removing all reference pegs before transferring offsets outside the dig area.", "खुदाई क्षेत्र के बाहर offset transfer किए बिना सारे peg हटा देना।"],
    ]),
    warnings: asCopy([
      ["A site dimension differs from the approved drawing or deed boundary.", "साइट का माप स्वीकृत drawing या deed की सीमा से अलग हो।"],
      ["Setbacks, a neighbour's wall or a service route conflict with the marked building.", "Setback, पड़ोसी की दीवार या service route मार्क किए भवन से टकराए।"],
    ]),
    before: asCopy([
      ["Bring current approved drawings and mark the survey datum.", "मौजूदा स्वीकृत drawing लाएं और survey datum मार्क करें।"],
      ["Locate underground utilities and protect nearby property.", "भूमिगत utility खोजें और पास की संपत्ति सुरक्षित करें।"],
      ["Agree the setting-out record with the surveyor/engineer.", "Surveyor/engineer के साथ setting-out record मिलाएं।"],
    ]),
    during: asCopy([
      ["Verify setbacks, grid, dimensions and diagonals before excavation.", "खुदाई से पहले setback, grid, माप और diagonal जांचें।"],
      ["Photograph and record reference points and key offsets.", "Reference point और जरूरी offset की फोटो लेकर रिकॉर्ड करें।"],
    ]),
    after: asCopy([
      ["Keep the signed or dated layout record with the site diary.", "हस्ताक्षरित/तारीख वाला layout record site diary में रखें।"],
      ["Recheck footing positions after excavation exposes the formation.", "खुदाई में formation दिखने के बाद footing की जगह दोबारा जांचें।"],
    ]),
    payment: {
      complete: c("Agreed clearing and setting-out scope is complete and accepted.", "तय सफाई और setting-out का काम पूरा और स्वीकार हो।"),
      inspect: c("Verify measured layout, setbacks and resolved drawing discrepancies.", "मापा हुआ layout, setback और drawing का अंतर ठीक होना जांचें।"),
      measure: c("Use the agreement's unit and measured site extent; exclude unapproved extras.", "समझौते की unit और मापी गई site extent लें; बिना मंज़ूरी extra न जोड़ें।"),
      records: c("Survey/layout record, dated photographs and approved change notes.", "Survey/layout record, तारीख वाली फोटो और स्वीकृत बदलाव के नोट।"),
    },
  },
  {
    id: "stage-03",
    title: c("Excavation & foundation", "खुदाई और नींव"),
    summary: c("Compare excavation and reinforcement with the project design; the engineer must resolve unexpected soil or water conditions.", "खुदाई और reinforcement को प्रोजेक्ट डिज़ाइन से मिलाएं; मिट्टी या पानी की अनपेक्षित स्थिति engineer से तय करवाएं।"),
    image: "/assets/rebar-installation-960.webp",
    imageAlt: c("Reinforcement steel prepared for concrete work", "कंक्रीट के काम के लिए तैयार reinforcement steel"),
    photoCredit: "Asset credit and licence recorded in the BOQFather asset manifest",
    activities: [
      ["Excavation depth", "खुदाई की गहराई"], ["Excavation width", "खुदाई की चौड़ाई"], ["Soil condition inspection", "मिट्टी की स्थिति जांचना"],
      ["Foundation bottom checking", "नींव का तल जांचना"], ["PCC preparation", "PCC की तैयारी"], ["Footing reinforcement", "Footing का reinforcement"],
      ["Cover blocks", "Cover block"], ["Footing shuttering", "Footing की shuttering"], ["Footing concreting", "Footing में कंक्रीट"],
      ["Column starter bars", "Column starter bar"], ["Foundation curing", "नींव की curing"], ["Backfilling and compaction", "Backfilling और compaction"],
    ],
    inspections: asCopy([
      ["Depth, width and location match the approved foundation drawing.", "गहराई, चौड़ाई और जगह स्वीकृत foundation drawing से मिलें।"],
      ["Unexpected fill, soft pockets, seepage or different strata are referred to the engineer.", "अनपेक्षित भराव, नरम मिट्टी, seepage या अलग परत engineer को दिखाई जाए।"],
      ["Excavation bottom is stable, clean and accepted before blinding/PCC.", "Blinding/PCC से पहले खुदाई का तल स्थिर, साफ़ और स्वीकृत हो।"],
      ["Footing bar size/count/spacing and laps match the structural detail.", "Footing bar का size/count/spacing और lap structural detail से मिले।"],
      ["Cover blocks, reinforcement stability and shutter dimensions are checked before pour.", "Pour से पहले cover block, reinforcement की स्थिरता और shutter का माप जांचें।"],
      ["Column starter position, alignment and projection follow the drawing.", "Column starter की जगह, alignment और projection drawing के अनुसार हो।"],
      ["Concrete grade, supply/approved mix and placement plan are confirmed by the engineer.", "Concrete grade, supply/approved mix और डालने का plan engineer से पक्का हो।"],
      ["Curing, backfill material and compaction records are documented.", "Curing, backfill material और compaction का रिकॉर्ड हो।"],
    ]),
    method: asCopy([
      ["Excavate to the approved dimensions and stop for inspection if the soil differs from the investigation.", "स्वीकृत माप तक खुदाई करें; मिट्टी जांच से अलग हो तो निरीक्षण के लिए रुकें।"],
      ["Have the responsible engineer accept the founding level and prepare the specified PCC/blinding.", "Responsible engineer से founding level स्वीकार कराकर तय PCC/blinding करें।"],
      ["Fix reinforcement, cover blocks, starter bars and formwork to the approved detail; request a pre-pour check.", "Approved detail के अनुसार steel, cover block, starter bar और formwork लगाकर pre-pour check कराएं।"],
      ["Confirm concrete specification and placement/testing arrangements before concrete arrives.", "कंक्रीट आने से पहले specification और placement/testing की तैयारी पक्की करें।"],
      ["Cure and backfill in the specified sequence; compact layers using the project method.", "तय क्रम से curing और backfill करें; project method से परतों की compaction करें।"],
    ]),
    tools: asCopy([
      ["Tape, level and approved foundation drawings", "Tape, level और स्वीकृत foundation drawing"],
      ["Rebar gauge/vernier calliper used with engineer's guidance", "Engineer के मार्गदर्शन में rebar gauge/vernier calliper"],
      ["Cover blocks, inspection torch and camera", "Cover block, inspection torch और camera"],
      ["Concrete delivery/test records and compaction test equipment by qualified staff", "योग्य staff द्वारा concrete delivery/test record और compaction test उपकरण"],
    ]),
    quality: asCopy([
      ["Do not use a generic foundation depth, bar spacing, cover or concrete grade; use the signed structural drawings and specifications.", "सामान्य foundation depth, bar spacing, cover या concrete grade न अपनाएं; स्वीकृत structural drawing और specification लें।"],
      ["Soil bearing level and any changed foundation condition must be accepted by the responsible structural engineer.", "मिट्टी का bearing level और नींव की बदली स्थिति responsible structural engineer से स्वीकार कराएं।"],
      ["Concrete testing and curing follow the project specification and applicable current Indian Standards.", "Concrete testing और curing project specification और लागू मौजूदा Indian Standards के अनुसार हों।"],
    ]),
    mistakes: asCopy([
      ["Pouring concrete into loose, muddy or water-filled excavation without engineer approval.", "Engineer की मंज़ूरी बिना ढीली, कीचड़ वाली या पानी भरी खुदाई में कंक्रीट डालना।"],
      ["Moving starter bars, cutting reinforcement or changing dimensions to fit the excavation.", "खुदाई में फिट करने के लिए starter bar खिसकाना, steel काटना या माप बदलना।"],
      ["Backfilling in one loose mass instead of the specified compacted layers.", "तय compacted परतों की जगह एक बार में ढीला backfill भर देना।"],
    ]),
    warnings: asCopy([
      ["Soil, groundwater or excavation depth differs materially from the design assumptions.", "मिट्टी, भूजल या खुदाई की गहराई design assumption से काफी अलग हो।"],
      ["Reinforcement, cover blocks, starter bars or formwork are altered without approval.", "बिना मंज़ूरी reinforcement, cover block, starter bar या formwork बदला जाए।"],
      ["Concrete is about to be poured before inspection or with unknown grade/supply.", "जांच से पहले या अनजान grade/supply का concrete डालने वाले हों।"],
    ]),
    before: asCopy([
      ["Keep the approved foundation detail and soil report available.", "स्वीकृत foundation detail और soil report पास रखें।"],
      ["Check location, dimensions, formation and safe access.", "जगह, माप, formation और सुरक्षित पहुंच जांचें।"],
      ["Arrange engineer inspection and concrete test/placement plan.", "Engineer inspection और concrete test/placement plan तैयार करें।"],
    ]),
    during: asCopy([
      ["Compare reinforcement, laps, cover and starters with the drawing.", "Reinforcement, lap, cover और starter drawing से मिलाएं।"],
      ["Record concrete delivery, approved tests and any interruption or joint.", "Concrete delivery, स्वीकृत test और रुकावट/joint का रिकॉर्ड रखें।"],
      ["Keep people clear of unsupported excavation and moving equipment.", "असमर्थित खुदाई और चलती मशीन से लोगों को दूर रखें।"],
    ]),
    after: asCopy([
      ["Follow specified curing and protect the concrete from damage.", "तय curing करें और concrete को नुकसान से बचाएं।"],
      ["Record backfill material, layer compaction and tests where specified.", "तय होने पर backfill material, layer compaction और test लिखें।"],
    ]),
    payment: {
      complete: c("The claimed foundation scope is completed, inspected and measured.", "दावा किया गया foundation काम पूरा, जांचा और मापा गया हो।"),
      inspect: c("Verify excavation acceptance, reinforcement pre-pour record, concrete records and curing.", "Excavation acceptance, reinforcement pre-pour record, concrete record और curing जांचें।"),
      measure: c("Measure actual quantities against agreed BOQ units and approved dimensions.", "तय BOQ unit और स्वीकृत माप के अनुसार असली मात्रा नापें।"),
      records: c("Dated pre-pour photos, delivery/test reports, engineer inspection and measurement sheet.", "तारीख वाली pre-pour फोटो, delivery/test report, engineer inspection और measurement sheet।"),
    },
  },
  {
    id: "stage-04",
    title: c("RCC structure", "RCC ढांचा"),
    summary: c("Inspect the drawings, reinforcement, formwork, concrete and test records before accepting each structural pour.", "हर structural pour स्वीकार करने से पहले drawing, reinforcement, formwork, concrete और test record जांचें।"),
    image: "/assets/concrete-workers-960.webp",
    imageAlt: c("A construction team placing concrete", "निर्माण टीम कंक्रीट डालते हुए"),
    photoCredit: "Jamain · CC BY-SA 3.0",
    activities: [
      ["Column reinforcement", "Column reinforcement"], ["Beam reinforcement", "Beam reinforcement"], ["Slab reinforcement", "Slab reinforcement"],
      ["Staircase reinforcement", "सीढ़ी का reinforcement"], ["Shuttering and formwork", "Shuttering और formwork"], ["Reinforcement cover", "Reinforcement cover"],
      ["Concrete mix and grade", "Concrete mix और grade"], ["Concrete pouring", "Concrete डालना"], ["Needle vibrator usage", "Needle vibrator का उपयोग"],
      ["Concrete compaction", "Concrete की compaction"], ["Slab level checking", "Slab का level जांचना"], ["Curing process", "Curing की प्रक्रिया"],
      ["Cube test", "Cube test"], ["De-shuttering", "Shuttering खोलना"],
    ],
    inspections: asCopy([
      ["Latest approved structural drawings and engineer's pre-pour release are available.", "नवीनतम स्वीकृत structural drawing और engineer का pre-pour release उपलब्ध हो।"],
      ["Bar grade/diameter/count/spacing, laps, anchorage and confinement match the detail.", "Bar का grade/diameter/count/spacing, lap, anchorage और confinement detail से मिले।"],
      ["Cover blocks and reinforcement are stable; openings, sleeves and conduits are coordinated.", "Cover block और reinforcement स्थिर हों; opening, sleeve और conduit का coordination हो।"],
      ["Formwork is clean, tight, supported, braced and checked for line, level and camber as specified.", "Formwork साफ़, बंद, supported और braced हो; line, level और तय camber जांचें।"],
      ["Specified concrete grade, approved delivery/mix and sampling plan are confirmed.", "तय concrete grade, approved delivery/mix और sample लेने का plan पक्का हो।"],
      ["Slump/consistency checks, sampling and cube identification are handled by competent staff.", "Slump/consistency check, sampling और cube identification सक्षम staff करे।"],
      ["Pour sequence, access, vibrator, backup power and joint treatment are planned.", "Pour sequence, पहुंच, vibrator, backup power और joint treatment का plan हो।"],
      ["Curing start, duration, stripping permission and test results are recorded.", "Curing शुरू होने का समय, अवधि, stripping permission और test result दर्ज हों।"],
    ]),
    method: asCopy([
      ["Match member locations and dimensions to the approved architectural and structural revisions.", "Member की जगह और माप स्वीकृत architectural और structural revision से मिलाएं।"],
      ["Inspect reinforcement, cover, embedded services and safe, stable formwork before every pour.", "हर pour से पहले reinforcement, cover, embedded service और सुरक्षित स्थिर formwork जांचें।"],
      ["Accept only the specified concrete; conduct the project-required fresh-concrete checks and sampling.", "सिर्फ तय concrete स्वीकारें; project के fresh-concrete check और sampling कराएं।"],
      ["Place in the planned sequence and compact with trained operators without displacing steel or formwork.", "Trained operator तय क्रम में concrete डाले और steel/formwork हिलाए बिना compact करे।"],
      ["Protect and cure as specified; remove formwork only after the responsible engineer permits it.", "तय अनुसार सुरक्षा और curing करें; responsible engineer की अनुमति के बाद ही formwork हटाएं।"],
    ]),
    tools: asCopy([
      ["Approved structural drawings, bar schedule and revision register", "स्वीकृत structural drawing, bar schedule और revision register"],
      ["Tape, cover gauge and level for observation; engineer verifies acceptance", "देखने के लिए tape, cover gauge और level; अंतिम स्वीकृति engineer दे"],
      ["Specified slump apparatus, calibrated sampling/cube equipment and test lab", "तय slump apparatus, calibrated sampling/cube उपकरण और test lab"],
      ["Needle vibrator, safe power backup, PPE and curing supplies", "Needle vibrator, सुरक्षित power backup, PPE और curing सामग्री"],
    ]),
    quality: asCopy([
      ["Member sizes, reinforcement, concrete grade, cover, joints and stripping time come from the approved design/specification—never a universal rule.", "Member size, reinforcement, concrete grade, cover, joint और stripping time स्वीकृत design/specification से लें—सामान्य नियम नहीं।"],
      ["Follow the current applicable IS 456 and project-specified standards; the responsible structural engineer resolves deviations.", "लागू मौजूदा IS 456 और project में तय standards अपनाएं; अंतर responsible structural engineer तय करे।"],
      ["Visual inspection or a single field test cannot certify structural safety or concrete strength.", "केवल देखकर या एक field test से structural safety या concrete strength प्रमाणित नहीं होती।"],
    ]),
    mistakes: asCopy([
      ["Allowing a pour with missing cover blocks, unapproved bar changes or uncoordinated conduits.", "Cover block गायब, बिना मंज़ूरी bar बदलाव या uncoordinated conduit के साथ pour करना।"],
      ["Adding water to concrete on site without approval or skipping specified sampling.", "मंज़ूरी बिना साइट पर concrete में पानी मिलाना या तय sampling छोड़ना।"],
      ["Using a vibrator to drag concrete, over-vibrating, or striking the reinforcement/formwork.", "Concrete खींचने के लिए vibrator चलाना, over-vibrate करना या steel/formwork को मारना।"],
      ["Removing supports or loading young concrete without engineer-authorised timing.", "Engineer की अनुमति के समय से पहले support हटाना या नई concrete पर भार रखना।"],
    ]),
    warnings: asCopy([
      ["Stop and call the structural engineer for shifted/cut bars, unstable formwork, excessive deflection, cracks or changed member dimensions.", "Bar खिसके/कटे, formwork अस्थिर हो, अधिक झुके, crack हो या member का माप बदले तो रुकें और structural engineer बुलाएं।"],
      ["Do not accept unknown concrete grade, undocumented water addition or missing test samples.", "अनजान concrete grade, बिना रिकॉर्ड पानी मिलाना या test sample न होना स्वीकार न करें।"],
      ["If concrete supply or placement is interrupted, get the engineer's approved joint/restart plan.", "Concrete supply/placement रुके तो engineer से approved joint/restart plan लें।"],
    ]),
    before: asCopy([
      ["Approved member/rebar drawings are at site and revision checked.", "स्वीकृत member/rebar drawing साइट पर हो और revision जांचा हो।"],
      ["Check steel, laps, cover, openings, formwork, supports and access.", "Steel, lap, cover, opening, formwork, support और पहुंच जांचें।"],
      ["Confirm grade, delivery tickets, test sampling, vibrator and curing plan.", "Grade, delivery ticket, sample test, vibrator और curing plan पक्का करें।"],
    ]),
    during: asCopy([
      ["Observe concrete consistency and authorized testing; do not add water independently.", "Concrete consistency और अधिकृत test देखें; अपने आप पानी न मिलाएं।"],
      ["Place and compact methodically while monitoring forms, steel and embedded services.", "Form, steel और embedded service देखते हुए क्रमबद्ध ढंग से डालें और compact करें।"],
      ["Record pours, interruptions, joints, samples and any engineer instruction.", "Pour, रुकावट, joint, sample और engineer के निर्देश दर्ज करें।"],
    ]),
    after: asCopy([
      ["Begin and maintain curing as specified; restrict early loading.", "तय curing शुरू कर जारी रखें; जल्दी भार न डालें।"],
      ["Collect cube/test results and written stripping clearance.", "Cube/test result और shutter खोलने की लिखित अनुमति लें।"],
      ["Raise visible honeycombing, cracks or deflection for engineer assessment; don't patch over them first.", "Honeycombing, crack या झुकाव engineer को दिखाएं; पहले छिपाकर patch न करें।"],
    ]),
    payment: {
      complete: c("The measured structural member/pour is complete and its acceptance evidence is available.", "मापा हुआ structural member/pour पूरा हो और स्वीकृति के प्रमाण उपलब्ध हों।"),
      inspect: c("Check pre-pour release, test/delivery records, curing and engineer's directions for defects.", "Pre-pour release, test/delivery record, curing और defect पर engineer के निर्देश जांचें।"),
      measure: c("Use actual agreed BOQ quantities and contract valuation rules; reconcile variations.", "तय BOQ की असली मात्रा और contract valuation rule लें; बदलाव मिलाएं।"),
      records: c("Pre-pour photographs, delivery tickets, fresh-concrete/cube records and signed measurements.", "Pre-pour फोटो, delivery ticket, fresh-concrete/cube record और हस्ताक्षरित माप।"),
    },
  },
  {
    id: "stage-05",
    title: c("Brickwork & masonry", "ईंट का काम और masonry"),
    summary: c("Check material acceptance, bond, line, level, openings and curing against the wall layout and specified system.", "दीवार के layout और तय system से सामग्री, bond, line, level, opening और curing जांचें।"),
    image: "/assets/modern-residence-mysore.webp",
    imageAlt: c("A completed brick-faced residential building, an architectural reference rather than a work inspection", "ईंटों वाला पूरा घर—यह वास्तु संदर्भ है, साइट निरीक्षण का प्रमाण नहीं"),
    photoCredit: "Evan Lovely · CC BY 2.0",
    activities: [
      ["Brick quality checking", "ईंट की गुणवत्ता जांचना"], ["Brick soaking where applicable", "जहां तय हो ईंट भिगोना"], ["Mortar preparation", "Mortar तैयार करना"],
      ["Wall alignment", "दीवार की alignment"], ["Wall thickness", "दीवार की मोटाई"], ["Verticality checking", "दीवार की verticality जांचना"],
      ["Horizontal level checking", "Horizontal level जांचना"], ["Door and window opening", "दरवाज़े और खिड़की का opening"],
      ["Lintel construction", "Lintel का निर्माण"], ["Masonry curing", "Masonry की curing"],
    ],
    inspections: asCopy([
      ["Brick/block type, dimensions, strength/acceptance and delivery match the specification.", "ईंट/block का प्रकार, माप, strength/acceptance और delivery specification से मेल खाएं।"],
      ["Soaking/conditioning follows the selected masonry product and mortar system.", "Soaking/conditioning चुने masonry product और mortar system के अनुसार हो।"],
      ["Bond, joint filling, line, level, plumb and wall thickness are checked as work rises.", "काम बढ़ने पर bond, joint भराव, line, level, plumb और wall thickness जांचें।"],
      ["Openings, sill/lintel levels and frame clearances match coordinated drawings.", "Opening, sill/lintel level और frame clearance coordinated drawing से मिलें।"],
      ["Ties, mesh or connection to RCC are installed only where specified.", "RCC से जोड़ने के tie, mesh आदि सिर्फ specification के अनुसार हों।"],
      ["Service chases and sleeves are coordinated; structural members are not cut.", "Service chase और sleeve coordinated हों; structural member न काटें।"],
      ["Curing and protection follow the specified material/mortar method.", "Curing और सुरक्षा तय material/mortar method से हो।"],
      ["Dated photographs capture concealed ties and lintel reinforcement before covering.", "ढकने से पहले hidden tie और lintel reinforcement की तारीख वाली फोटो लें।"],
    ]),
    method: asCopy([
      ["Accept the specified brick/block lot and prepare the base and reference lines.", "तय ईंट/block lot स्वीकारकर base और reference line तैयार करें।"],
      ["Prepare mortar and condition masonry units to the product specification.", "Product specification अनुसार mortar बनाएं और masonry unit तैयार करें।"],
      ["Lay to the required bond while checking line, level, plumb, thickness and joint fill regularly.", "तय bond में लगाते हुए line, level, plumb, मोटाई और joint भराव नियमित जांचें।"],
      ["Form openings, lintels, ties and RCC interfaces from coordinated drawings and details.", "Opening, lintel, tie और RCC interface coordinated drawing/detail से बनाएं।"],
      ["Cure/protect as specified; inspect the wall before chasing or plaster hides it.", "तय अनुसार curing/सुरक्षा करें; chasing या plaster से पहले दीवार जांचें।"],
    ]),
    tools: asCopy([
      ["Mason's line, spirit level and plumb bob", "Mason line, spirit level और plumb bob"],
      ["Tape, straight edge and opening gauge", "Tape, straight edge और opening gauge"],
      ["Approved wall layout and material submittal", "स्वीकृत wall layout और material submittal"],
    ]),
    quality: asCopy([
      ["Wall thickness, bond, mortar, ties, lintels and movement joints follow the approved detail/specification.", "Wall thickness, bond, mortar, tie, lintel और movement joint स्वीकृत detail/specification से हों।"],
      ["Tolerances and curing are per project specification and applicable masonry standards.", "Tolerance और curing project specification तथा लागू masonry standards से हों।"],
    ]),
    mistakes: asCopy([
      ["Building long wall lengths without checking plumb/line or coordinating openings.", "Verticality/line जांचे बिना लंबी दीवार बनाना या opening का coordination छोड़ना।"],
      ["Using inconsistent mortar or making unapproved deep chases in columns/beams.", "असमान mortar इस्तेमाल करना या column/beam में बिना मंज़ूरी गहरी chase बनाना।"],
      ["Covering missing wall ties, unfilled joints or misaligned openings with plaster.", "गायब wall tie, खाली joint या गलत opening को plaster से छिपाना।"],
    ]),
    warnings: asCopy([
      ["Cracking, bulging, loose units or a wall visibly out of plumb.", "Crack, उभरी दीवार, ढीली ईंट या साफ़ तौर पर तिरछी wall।"],
      ["Any instruction to cut a column, beam or slab for a service route.", "Service route के लिए column, beam या slab काटने का निर्देश।"],
    ]),
    before: asCopy([
      ["Confirm wall layout, type, thickness, openings and lintel detail.", "Wall layout, प्रकार, मोटाई, opening और lintel detail पक्की करें।"],
      ["Check accepted material lot and approved mortar/system.", "स्वीकृत सामग्री lot और mortar/system जांचें।"],
    ]),
    during: asCopy([
      ["Check line, level, plumb, bond and openings in manageable lifts.", "काम के दौरान line, level, plumb, bond और opening जांचें।"],
      ["Photograph specified ties, mesh and lintel details before covering.", "ढकने से पहले तय tie, mesh और lintel detail की फोटो लें।"],
    ]),
    after: asCopy([
      ["Allow specified curing and protection before loading or plastering.", "भार या plaster से पहले तय curing और सुरक्षा दें।"],
      ["Record opening sizes and unresolved defects for correction.", "Opening का माप और बाकी दोष सुधार के लिए दर्ज करें।"],
    ]),
    payment: {
      complete: c("The agreed wall area/quantity and included lintel or tie work are complete.", "तय wall area/quantity और शामिल lintel/tie का काम पूरा हो।"),
      inspect: c("Verify opening sizes, alignment, wall type and concealed details.", "Opening का माप, alignment, wall type और छिपी detail जांचें।"),
      measure: c("Measure actual wall area/length using the agreement's deductions and unit.", "समझौते की deductions और unit के अनुसार असली दीवार नापें।"),
      records: c("Approved material records, measurements, dated photos and written variation approvals.", "स्वीकृत material record, माप, तारीख वाली फोटो और लिखित बदलाव मंज़ूरी।"),
    },
  },
  {
    id: "stage-06",
    title: c("Plastering", "Plastering"),
    summary: c("Prepare the substrate, coordinate concealed services and assess thickness, line and curing before finish coats.", "Finish coat से पहले सतह तैयार करें, छिपी services मिलाएं और मोटाई, line व curing जांचें।"),
    image: "/assets/concrete-workers-960.webp",
    imageAlt: c("Construction work in progress, used as a general site-work reference", "निर्माण कार्य की सामान्य संदर्भ तस्वीर"),
    photoCredit: "Jamain · CC BY-SA 3.0",
    activities: [
      ["Surface preparation", "सतह की तैयारी"], ["Wall joints and chasing", "दीवार के जोड़ और chasing"], ["Chicken mesh where specified", "जहां तय हो chicken mesh"],
      ["Specified mortar proportion", "तय mortar proportion"], ["Plaster thickness", "Plaster की मोटाई"], ["Level and line checking", "Level और line जांचना"],
      ["Internal plaster", "अंदरूनी plaster"], ["External plaster", "बाहरी plaster"], ["Curing", "Curing"], ["Surface finish checking", "सतह की finish जांचना"],
    ],
    inspections: asCopy([
      ["Masonry is stable; dust, loose mortar and contamination are removed.", "Masonry स्थिर हो; धूल, ढीला mortar और गंदगी हटाई गई हो।"],
      ["Electrical/plumbing concealed work is tested and photographed before covering.", "ढकने से पहले छिपे electrical/plumbing काम का test और फोटो हो।"],
      ["Required mesh/beads are installed at specified junctions/details.", "तय junction/detail पर ज़रूरी mesh/bead लगाया हो।"],
      ["Mortar/material and thickness follow the project specification; check using depth dots/gauges.", "Mortar/material और मोटाई project specification से हो; depth dot/gauge से जांचें।"],
      ["Line, plumb, corners, reveals and junctions are checked with a straight edge and level.", "Straight edge और level से line, plumb, corner, reveal और junction जांचें।"],
      ["No active leak/damp source is being concealed under plaster.", "चलता leakage/damp source plaster के नीचे न छिपाया गया हो।"],
      ["Curing/protection follows the specified product and weather conditions.", "Curing/सुरक्षा तय product और मौसम के अनुसार हो।"],
      ["Cracks, hollow patches or debonding are recorded and assessed before paint.", "Paint से पहले crack, hollow patch या debonding दर्ज और जांचा गया हो।"],
    ]),
    method: asCopy([
      ["Complete and test hidden services; photograph them before closing the wall.", "छिपी services पूरी और test करके दीवार बंद करने से पहले फोटो लें।"],
      ["Prepare the substrate and fit specified beads/mesh at the approved locations.", "सतह तैयार करें और तय जगह पर स्वीकृत bead/mesh लगाएं।"],
      ["Apply the specified plaster system/thickness and check line, level and corners during work.", "तय plaster system/mोटाई लगाएं और काम के दौरान line, level व corner जांचें।"],
      ["Use a straight edge for surface evenness; do not use paint to hide deep irregularities.", "सतह की समतलता straight edge से देखें; गहरी असमानता paint से न छिपाएं।"],
      ["Cure and protect as specified; inspect defects before primer/paint.", "तय अनुसार curing/सुरक्षा करें; primer/paint से पहले दोष जांचें।"],
    ]),
    tools: asCopy([
      ["Straight edge, spirit level, plumb bob and corner square", "Straight edge, spirit level, plumb bob और corner square"],
      ["Plaster thickness gauge/depth dots and inspection light", "Plaster thickness gauge/depth dot और inspection light"],
      ["Approved finish sample and moisture/leak record", "स्वीकृत finish sample और moisture/leak record"],
    ]),
    quality: asCopy([
      ["Mix/proprietary system and thickness are project-specific; don't assume one mortar ratio for all surfaces.", "Mix/proprietary system और मोटाई project-specific हैं; हर सतह के लिए एक mortar ratio न मानें।"],
      ["Mesh is placed only where specified by details/manufacturer; it does not repair structural movement.", "Mesh सिर्फ detail/manufacturer के अनुसार लगाएं; यह structural movement का इलाज नहीं।"],
      ["Applicable workmanship tolerances and curing follow the approved specifications.", "लागू workmanship tolerance और curing स्वीकृत specification से हों।"],
    ]),
    mistakes: asCopy([
      ["Plastering before pressure/leak tests or before service photos are recorded.", "Pressure/leak test या service photo से पहले plaster कर देना।"],
      ["Applying excessive thickness to mask crooked masonry without correcting the cause.", "टेढ़ी masonry छिपाने के लिए कारण सुधारे बिना बहुत मोटा plaster लगाना।"],
      ["Painting over damp, hollow, cracked or poorly cured plaster.", "गीले, hollow, cracked या ठीक से cure न हुए plaster पर paint करना।"],
    ]),
    warnings: asCopy([
      ["Damp patches, recurring cracks, hollow areas or loose plaster.", "नमी के दाग, बार-बार crack, hollow जगह या ढीला plaster।"],
      ["A contractor wants to cover untested electrical/plumbing work.", "बिना test का electrical/plumbing काम छिपाने की बात।"],
    ]),
    before: asCopy([
      ["Inspect substrate and complete concealed service tests.", "सतह जांचें और छिपी service के test पूरे करें।"],
      ["Confirm approved plaster system, thickness and mesh locations.", "स्वीकृत plaster system, मोटाई और mesh की जगह पक्की करें।"],
    ]),
    during: asCopy([
      ["Check thickness, line, plumb, corners and opening reveals.", "मोटाई, line, plumb, corner और opening reveal जांचें।"],
      ["Photograph mesh, service routes and any approved repair before covering.", "ढकने से पहले mesh, service route और स्वीकृत repair की फोटो लें।"],
    ]),
    after: asCopy([
      ["Cure/protect as specified and keep records.", "तय अनुसार curing/सुरक्षा करें और रिकॉर्ड रखें।"],
      ["Mark cracks, hollow patches, dampness and finish defects for correction.", "Crack, hollow patch, नमी और finish defect सुधार के लिए चिन्हित करें।"],
    ]),
    payment: {
      complete: c("Agreed surface area/locations are plastered and accepted, with specified curing completed.", "तय सतह/जगह पर plaster और तय curing पूरी व स्वीकार हो।"),
      inspect: c("Check thickness, straight-edge finish, openings, cracks and damp patches.", "मोटाई, straight-edge finish, opening, crack और नमी जांचें।"),
      measure: c("Measure net plaster area and agreed reveals/deductions; avoid duplicate quantities.", "Net plaster area और तय reveal/deduction नापें; दोहरी मात्रा न जोड़ें।"),
      records: c("Area measurements, approved materials, service-test record and defect close-out.", "क्षेत्रफल माप, स्वीकृत सामग्री, service-test record और defect close-out।"),
    },
  },
  {
    id: "stage-07",
    title: c("Waterproofing", "Waterproofing"),
    summary: c("Protect wet areas and roofs with the specified system, compatible detailing and a recorded test before concealment.", "गीली जगह और छत को तय system, सही detailing और ढकने से पहले दर्ज test से सुरक्षित करें।"),
    image: "/assets/site-measurement-960.webp",
    imageAlt: c("A construction site measurement reference; verify waterproofing with system-specific tests", "साइट माप का संदर्भ; Waterproofing का test चुने हुए system से करें"),
    photoCredit: "SFC Sean A. Foley / U.S. Army · Public domain",
    activities: [
      ["Toilet waterproofing", "Toilet waterproofing"], ["Bathroom sunken area", "Bathroom का sunken area"], ["Balcony waterproofing", "Balcony waterproofing"],
      ["Terrace waterproofing", "Terrace waterproofing"], ["Water tank waterproofing", "Water tank waterproofing"], ["Basement waterproofing where applicable", "जहां लागू हो basement waterproofing"],
      ["Surface preparation", "सतह की तैयारी"], ["Waterproofing application", "Waterproofing लगाना"], ["Protective layer", "Protection layer"], ["Ponding test", "Ponding test"],
    ],
    inspections: asCopy([
      ["Identify the exact system, substrate preparation, primer and number of coats from approved submittal.", "स्वीकृत submittal से exact system, सतह तैयारी, primer और coat की संख्या देखें।"],
      ["Check corners, pipe penetrations, drains, joints and upstands have compatible detailing.", "कोना, pipe entry, drain, joint और upstand की compatible detailing जांचें।"],
      ["Membrane/coating is continuous and protected from puncture or incompatible materials.", "Membrane/coating लगातार हो और puncture या incompatible material से सुरक्षित हो।"],
      ["Drain outlets and designed falls remain open and functional.", "Drain outlet और डिज़ाइन किया fall खुला और काम करने योग्य हो।"],
      ["A test is conducted for the duration/method required by the specified product and engineer.", "तय product और engineer के अनुसार अवधि/विधि का test हो।"],
      ["Water level, start/end time, adjacent areas and any leakage are photographed/logged.", "पानी का स्तर, शुरू/अंत समय, आसपास की जगह और leakage फोटो/log में दर्ज हों।"],
      ["Test passes and written acceptance is obtained before tile/protection layers conceal the work.", "Tile/protection layer से ढकने से पहले test pass और लिखित स्वीकृति हो।"],
      ["Tank/basement systems are tested using their own specified procedure—not a bathroom assumption.", "Tank/basement को उनकी अलग specified प्रक्रिया से test करें—bathroom वाली धारणा नहीं।"],
    ]),
    method: asCopy([
      ["Confirm compatible waterproofing product/system and manufacturer's instructions.", "Compatible waterproofing product/system और manufacturer के निर्देश पक्के करें।"],
      ["Prepare substrate, falls, corners, penetrations and drains as detailed.", "Detail अनुसार सतह, slope, कोना, pipe entry और drain तैयार करें।"],
      ["Apply reinforcement/membrane/coats and curing intervals exactly as specified.", "Reinforcement/membrane/coating और curing अंतर तय अनुसार रखें।"],
      ["Perform and document the project-approved ponding/leak test for the system's specified duration.", "System की तय अवधि तक project-approved ponding/leak test करें और दर्ज करें।"],
      ["Get acceptance and install compatible protection before tiles or backfill.", "स्वीकृति लेकर tile/backfill से पहले compatible protection लगाएं।"],
    ]),
    tools: asCopy([
      ["System data sheet, batch labels and compatible application tools", "System data sheet, batch label और compatible लगाने के औज़ार"],
      ["Straight edge/level and drain-flow check", "Straight edge/level और drain-flow जांच"],
      ["Marked water-level gauge, timer, camera and test log", "चिन्हित water-level gauge, timer, camera और test log"],
    ]),
    quality: asCopy([
      ["Product compatibility, coats, coverage, curing and test duration must follow the approved system and manufacturer.", "Product compatibility, coat, coverage, curing और test duration स्वीकृत system/manufacturer से लें।"],
      ["Do not prescribe one universal ponding duration; record the specified method and obtain engineer approval.", "एक universal ponding अवधि न बताएं; तय विधि दर्ज करके engineer की मंज़ूरी लें।"],
    ]),
    mistakes: asCopy([
      ["Tiling before the specified test or before repairing a failed test.", "तय test से पहले tile लगाना या fail test ठीक किए बिना ढक देना।"],
      ["Puncturing a membrane with later trades or using incompatible protection/adhesive.", "बाद के काम से membrane में छेद या incompatible protection/adhesive लगाना।"],
      ["Blocking drains or ignoring reverse falls and unsealed penetrations.", "Drain बंद करना या उल्टा slope और खुली pipe entry अनदेखी करना।"],
    ]),
    warnings: asCopy([
      ["Water level falls, a ceiling below becomes damp, or water collects away from the drain.", "पानी का स्तर घटे, नीचे की छत नम हो या drain से दूर पानी जमा हो।"],
      ["The installer cannot identify product batch, application steps or test requirement.", "Installer product batch, लगाने का तरीका या test की शर्त न बता पाए।"],
    ]),
    before: asCopy([
      ["Confirm system, substrate, falls, product batch and compatible details.", "System, सतह, slope, product batch और compatible detail पक्की करें।"],
      ["Agree the test method and duration from the approved system.", "स्वीकृत system से test की विधि और अवधि तय करें।"],
    ]),
    during: asCopy([
      ["Inspect continuity at corners, drains and pipe penetrations.", "कोने, drain और pipe entry पर continuous layer जांचें।"],
      ["Protect the completed membrane from following trades.", "पूरी membrane को अगले काम से सुरक्षित रखें।"],
    ]),
    after: asCopy([
      ["Log water level and test start/end, inspect below and record result.", "पानी का स्तर और test समय लिखें; नीचे जांचकर नतीजा दर्ज करें।"],
      ["Get written acceptance before tiling, protection or backfill.", "Tile, protection या backfill से पहले लिखित स्वीकृति लें।"],
    ]),
    payment: {
      complete: c("Specified application, test, correction of failures and compatible protection are complete.", "तय application, test, fail होने पर सुधार और compatible protection पूरा हो।"),
      inspect: c("Review product records, details, signed test log and acceptance before concealment.", "ढकने से पहले product record, detail, हस्ताक्षरित test log और स्वीकृति जांचें।"),
      measure: c("Measure treated area and details under the contract; exclude failed/unaccepted work.", "Contract के अनुसार treated area/detail नापें; fail/unaccepted काम न जोड़ें।"),
      records: c("Product/batch record, application photos, test log and written acceptance.", "Product/batch record, application फोटो, test log और लिखित स्वीकृति।"),
    },
  },
  {
    id: "stage-08",
    title: c("Plumbing & electrical", "Plumbing और electrical"),
    summary: c("Coordinate and test concealed services before plaster, screed, tile or ceiling closes access.", "Plaster, screed, tile या ceiling से पहुंच बंद होने से पहले छिपी services का coordination और test करें।"),
    image: "/assets/engineer-plan-review-960.webp",
    imageAlt: c("Building drawings being reviewed before services are concealed", "Services छिपाने से पहले भवन की drawing की समीक्षा"),
    photoCredit: "Unsplash License",
    activities: [
      ["Pipe quality", "Pipe की गुणवत्ता"], ["Pipe diameter", "Pipe का diameter"], ["Water supply lines", "Water supply line"], ["Drainage slope", "Drainage slope"],
      ["Traps and chambers", "Trap और chamber"], ["Pressure testing", "Pressure test"], ["Concealed pipe inspection", "छिपे pipe का निरीक्षण"], ["Leakage testing", "Leakage test"],
      ["Conduit layout", "Conduit layout"], ["Switchboard locations", "Switchboard की जगह"], ["Wire quality and size", "Wire की quality और size"],
      ["Distribution board", "Distribution board"], ["Earthing", "Earthing"], ["Concealed wiring inspection", "छिपी wiring का निरीक्षण"], ["Electrical safety checks", "Electrical safety check"],
    ],
    inspections: asCopy([
      ["Pipe/cable/conduit product and sizes match the coordinated drawings and approved submittal.", "Pipe/cable/conduit का product और size coordinated drawing और approved submittal से मिले।"],
      ["Water supply joints and drainage runs are accessible for testing before concealment.", "छिपाने से पहले water supply joint और drainage line test के लिए सुलभ हों।"],
      ["Drain falls, traps, cleanouts, vents and chambers are checked for intended flow/access.", "Drain fall, trap, cleanout, vent और chamber का flow/access जांचें।"],
      ["Pressure/leak tests use the procedure and duration specified by the responsible professional/system.", "Pressure/leak test responsible professional/system की तय विधि और अवधि से करें।"],
      ["Electrical conduits, box locations, circuit plan, wire sizing and protective devices match design.", "Electrical conduit, box की जगह, circuit plan, wire size और protective device design से मिलें।"],
      ["Earthing/bonding and distribution-board tests are performed by a qualified electrician.", "Qualified electrician earthing/bonding और distribution-board test करे।"],
      ["Photographs include routes, junctions and dimensions before walls/floors close.", "दीवार/floor बंद होने से पहले route, junction और माप की फोटो लें।"],
      ["Inspection/test record and corrective retest are signed before plaster/flooring.", "Plaster/flooring से पहले inspection/test record और सुधार के बाद retest पर हस्ताक्षर हों।"],
    ]),
    method: asCopy([
      ["Coordinate architectural, plumbing and electrical drawings; mark outlets, boards and routes.", "Architectural, plumbing और electrical drawing मिलाएं; outlet, board और route मार्क करें।"],
      ["Install only approved pipe/conduit/cable products and protect joints and crossings.", "सिर्फ approved pipe/conduit/cable लगाएं और joint/crossing सुरक्षित रखें।"],
      ["Check falls and access to traps/cleanouts; test pressure, drainage and electrical circuits as specified.", "Fall और trap/cleanout access जांचें; तय अनुसार pressure, drainage और electrical circuit test करें।"],
      ["Photograph hidden routes with measurements and label circuit/pipe ends.", "माप के साथ hidden route की फोटो लें और circuit/pipe end label करें।"],
      ["Obtain test records and professional sign-off before covering; repeat tests after damage/changes.", "ढकने से पहले test record और professional sign-off लें; नुकसान/बदलाव के बाद test दोहराएं।"],
    ]),
    tools: asCopy([
      ["Approved service drawings and circuit schedule", "स्वीकृत service drawing और circuit schedule"],
      ["Pressure test pump/gauge and drainage flow test equipment", "Pressure-test pump/gauge और drainage-flow test उपकरण"],
      ["Qualified electrician's electrical test instruments", "Qualified electrician के electrical-test instrument"],
      ["Camera, tape, labels and as-built mark-up", "Camera, tape, label और as-built mark-up"],
    ]),
    quality: asCopy([
      ["Pipe size, slope, cable size, protection and test values are design-specific; never infer or prescribe them generically.", "Pipe size, slope, cable size, protection और test value design-specific हैं; इन्हें सामान्य रूप से न तय करें।"],
      ["Electrical testing and energisation must be done by a qualified electrician to approved design and applicable rules.", "Electrical test और energise qualified electrician से approved design और लागू नियम अनुसार कराएं।"],
    ]),
    mistakes: asCopy([
      ["Concealing services without pressure, leakage, drainage-flow and electrical tests.", "Pressure, leakage, drainage-flow और electrical test किए बिना service ढक देना।"],
      ["Cutting structural members, blocking cleanouts or burying unlabelled junctions.", "Structural member काटना, cleanout बंद करना या बिना label junction छिपाना।"],
      ["Using unapproved pipe/cable sizes or changing board locations without coordination.", "बिना मंज़ूरी pipe/cable size या coordination बिना board की जगह बदलना।"],
    ]),
    warnings: asCopy([
      ["A concealed pipe loses pressure, a drain backs up, or moisture appears after testing.", "छिपा pipe pressure खोए, drain वापस भरे या test के बाद नमी दिखे।"],
      ["Exposed live conductors, missing protection/earthing or an electrician cannot provide test records.", "Live wire खुली हो, protection/earthing न हो या electrician test record न दे।"],
    ]),
    before: asCopy([
      ["Freeze coordinated layouts and outlet/switch locations.", "Coordinated layout और outlet/switch की जगह तय करें।"],
      ["Confirm approved products, sizes, test procedures and responsible trades.", "Approved product, size, test procedure और जिम्मेदार trades पक्के करें।"],
    ]),
    during: asCopy([
      ["Keep pipes/conduits accessible and protect them during other work.", "अन्य काम में pipe/conduit सुलभ रखें और सुरक्षित करें।"],
      ["Run specified tests before closing; photograph, label and record every route.", "बंद करने से पहले तय test करें; हर route की फोटो, label और रिकॉर्ड रखें।"],
    ]),
    after: asCopy([
      ["Retest if any pipe, wire or junction was disturbed after inspection.", "Inspection के बाद pipe, wire या junction हिले तो दोबारा test करें।"],
      ["Collect as-built routes, test reports and circuit labels for handover.", "Handover के लिए as-built route, test report और circuit label लें।"],
    ]),
    payment: {
      complete: c("The installed service scope is tested, recorded and accepted before concealment.", "लगी हुई service का काम छिपाने से पहले test, record और स्वीकार हो।"),
      inspect: c("Witness specified tests, check outlet positions and confirm concealed-work photos.", "तय test देखें, outlet की जगह और concealed-work फोटो जांचें।"),
      measure: c("Value the contract's installed points/lengths/fixtures, not uninstalled material stock.", "Contract के installed point/length/fixture का मूल्य लें, रखे material stock का नहीं।"),
      records: c("Pressure/leak and electrical test reports, service photos and as-built mark-ups.", "Pressure/leak और electrical test report, service फोटो और as-built mark-up।"),
    },
  },
  {
    id: "stage-09",
    title: c("Flooring & tiles", "Flooring और tiles"),
    summary: c("Check the substrate, approved tile batch, setting-out, level, drainage falls and finished joints before acceptance.", "स्वीकृति से पहले base, स्वीकृत tile batch, setting-out, level, drain slope और finished joint जांचें।"),
    image: "/assets/construction-materials-board.webp",
    imageAlt: c("Construction material reference; tile installation must be checked on the actual floor", "निर्माण सामग्री का संदर्भ; tile installation असली floor पर जांचें"),
    photoCredit: "Individual material credits are recorded in the BOQFather asset manifest",
    activities: [
      ["Tile selection", "Tile चुनना"], ["Tile size and batch checking", "Tile का size और batch जांचना"], ["Floor level checking", "Floor level जांचना"],
      ["Base preparation", "Base की तैयारी"], ["Tile adhesive or mortar system", "Tile adhesive या mortar system"], ["Tile laying", "Tile लगाना"],
      ["Tile alignment", "Tile alignment"], ["Joint spacing", "Joint की दूरी"], ["Bathroom slope", "Bathroom का slope"],
      ["Grouting", "Grouting"], ["Hollow tile checking", "Hollow tile जांचना"], ["Final cleaning", "अंतिम सफाई"],
    ],
    inspections: asCopy([
      ["Approved tile sample, dimensions, shade and batch are checked before installation.", "लगाने से पहले स्वीकृत tile sample, माप, shade और batch जांचें।"],
      ["Substrate is sound, clean, dry/conditioned as required, and at the agreed level.", "Base मजबूत, साफ़ और ज़रूरत अनुसार तैयार हो; तय level पर हो।"],
      ["Setting-out avoids thin cuts and aligns joints with thresholds/drains.", "Setting-out में पतली कटाई न हो और joint threshold/drain से align हों।"],
      ["Adhesive/mortar is approved and applied within product working time.", "Adhesive/mortar approved हो और product के working time में लगाया जाए।"],
      ["Joints are consistent; edges, lippage and transitions are checked with a straight edge.", "Joint समान हों; straight edge से किनारा, lippage और transition जांचें।"],
      ["Bathroom/balcony water flows to drain with no reverse fall or pooling.", "Bathroom/balcony का पानी उल्टे slope या जमाव बिना drain तक जाए।"],
      ["Grout, movement joints and curing/protection follow product specifications.", "Grout, movement joint और curing/protection product specification से हों।"],
      ["Hollow-sounding or loose tiles are mapped; sound alone is assessed against system/specification.", "Hollow आवाज़ वाली/ढीली tile map करें; आवाज़ को system/specification के साथ समझें।"],
    ]),
    method: asCopy([
      ["Check substrate strength, moisture condition, flatness, drains and finished floor levels.", "Base की मजबूती, नमी, समतलता, drain और finished floor level जांचें।"],
      ["Dry-lay/mark tile lines and verify batch, cuts, thresholds and access covers.", "Tile की dry layout/line बनाकर batch, cut, threshold और access cover जांचें।"],
      ["Use the specified adhesive/mortar and installation method for the tile/substrate.", "Tile/base के लिए तय adhesive/mortar और लगाने की विधि लें।"],
      ["Set tiles to line and level, keep joints consistent and form falls toward drains.", "Tile line/level में लगाएं, joint समान रखें और drain की ओर slope बनाएं।"],
      ["Grout and protect as specified; inspect lippage, hollow areas, movement joints and water flow.", "तय अनुसार grout/सुरक्षा करें; lippage, hollow जगह, movement joint और water flow जांचें।"],
    ]),
    tools: asCopy([
      ["Tile samples, batch labels and approved setting-out plan", "Tile sample, batch label और स्वीकृत setting-out plan"],
      ["Straight edge, spirit level/laser and joint spacers", "Straight edge, spirit level/laser और joint spacer"],
      ["Rubber mallet and suitable inspection tool", "Rubber mallet और उपयुक्त inspection tool"],
      ["Water for observed flow test and camera", "दिखने वाले flow test के लिए पानी और camera"],
    ]),
    quality: asCopy([
      ["Tile class, adhesive, joint width, lippage and tolerances follow the selected product and project specification.", "Tile class, adhesive, joint width, lippage और tolerance चुने product/project specification से हों।"],
      ["Bathroom falls and drainage are per approved detail; do not use one universal slope value.", "Bathroom slope/drainage approved detail से हो; एक universal slope value न मानें।"],
    ]),
    mistakes: asCopy([
      ["Mixing visible tile batches without a dry layout or accepting damaged/warped pieces.", "Dry layout बिना दिखाई देने वाले अलग batch मिलाना या damaged/warped tile लगाना।"],
      ["Installing before waterproofing acceptance or without checking drain/floor levels.", "Waterproofing स्वीकृति या drain/floor level जांचे बिना लगाना।"],
      ["Grouting movement joints rigidly or hiding reverse fall with surface patching.", "Movement joint को सख्त grout करना या ऊपर patch से उल्टा slope छिपाना।"],
    ]),
    warnings: asCopy([
      ["Water stands away from a drain, crosses a threshold or runs into adjoining dry rooms.", "पानी drain से दूर रुके, threshold पार करे या सूखे कमरे में जाए।"],
      ["Widespread loose tiles, sharp lippage, cracked tile or leaking below.", "कई tile ढीली हों, तेज़ lippage/crack हो या नीचे leakage दिखे।"],
    ]),
    before: asCopy([
      ["Accept waterproofing and concealed services before flooring closes access.", "Flooring से पहुंच बंद होने से पहले waterproofing और छिपी service स्वीकारें।"],
      ["Check batch, substrate, drain height, falls and finished floor level.", "Batch, base, drain height, slope और finished floor level जांचें।"],
    ]),
    during: asCopy([
      ["Inspect dry layout, cut edges, joint width, line and lippage as work proceeds.", "काम के साथ dry layout, cut edge, joint width, line और lippage जांचें।"],
      ["Keep drains and movement joints clear; protect newly set tile.", "Drain और movement joint खुले रखें; नई tile सुरक्षित करें।"],
    ]),
    after: asCopy([
      ["Test water flow and check for pooling without damaging the finish.", "Finish खराब किए बिना water flow और जमाव जांचें।"],
      ["Map defects, replace agreed damaged tiles and collect batch/care information.", "दोष map करें, तय damaged tile बदलें और batch/care जानकारी लें।"],
    ]),
    payment: {
      complete: c("Agreed tile area is laid, grouted, cleaned and accepted after drainage/fall inspection.", "तय tile area लगाकर grout/सफाई हो और drain/slope जांच के बाद स्वीकार हो।"),
      inspect: c("Check batch, joint, lippage, hollow/loose areas and water flow.", "Batch, joint, lippage, hollow/loose जगह और water flow जांचें।"),
      measure: c("Measure installed net area and contract-approved skirting/cuts; reconcile wastage rules.", "लगी net area और contract-approved skirting/cut नापें; wastage rule मिलाएं।"),
      records: c("Batch labels, approved sample, measurements, waterproofing release and defect list.", "Batch label, स्वीकृत sample, माप, waterproofing release और defect list।"),
    },
  },
  {
    id: "stage-10",
    title: c("Doors, windows & fabrication", "Doors, windows और fabrication"),
    summary: c("Verify frame material, openings, anchorage, seals, hardware and operation before accepting the installed units.", "लगी unit स्वीकारने से पहले frame material, opening, anchorage, seal, hardware और operation जांचें।"),
    image: "/assets/modern-residence-mysore.webp",
    imageAlt: c("Residential doors and windows as an architectural reference, not an installation certificate", "घर के दरवाज़े और खिड़की का वास्तु संदर्भ, installation प्रमाणपत्र नहीं"),
    photoCredit: "Evan Lovely · CC BY 2.0",
    activities: [
      ["Door frame checking", "Door frame जांचना"], ["Window frame checking", "Window frame जांचना"], ["Frame alignment", "Frame alignment"],
      ["Fixing and anchoring", "Fixing और anchoring"], ["Hardware quality", "Hardware की गुणवत्ता"], ["Glass quality", "Glass की गुणवत्ता"],
      ["Safety grills", "Safety grill"], ["Shutters and fittings", "Shutter और fitting"], ["Opening and closing test", "खोलने-बंद करने का test"],
    ],
    inspections: asCopy([
      ["Opening size, sill/lintel level and frame type match approved schedules.", "Opening का माप, sill/lintel level और frame type स्वीकृत schedule से मिलें।"],
      ["Frame is plumb, level, square and fixed with the specified anchors.", "Frame plumb, level, square हो और तय anchor से लगा हो।"],
      ["Anchor spacing, packers, perimeter gap and sealant detail follow system instructions.", "Anchor spacing, packer, किनारे का gap और sealant system instructions से हों।"],
      ["Glass type/safety marking and thickness are verified against the approved schedule.", "Glass का प्रकार/safety marking और thickness स्वीकृत schedule से जांचें।"],
      ["Locks, hinges, rollers, handles, stoppers and grills are fitted securely.", "Lock, hinge, roller, handle, stopper और grill मजबूती से लगे हों।"],
      ["Shutters open, close and latch without binding; drainage/weep paths remain open.", "Shutter बिना अटके खुले-बंद/lock हों; drainage/weep path खुला रहे।"],
      ["External perimeter is sealed and water ingress risk reviewed.", "बाहरी किनारा sealed हो और पानी घुसने का जोखिम जांचें।"],
      ["Protect finished units and note scratches, dents and hardware gaps.", "पूरी unit सुरक्षित रखें; scratch, dent और hardware gap दर्ज करें।"],
    ]),
    method: asCopy([
      ["Verify opening dimensions and approved frame/glass/hardware schedule before fabrication.", "Fabrication से पहले opening का माप और स्वीकृत frame/glass/hardware schedule जांचें।"],
      ["Fix frames plumb, level and square using approved anchors and packers.", "Approved anchor/packer से frame plumb, level और square में लगाएं।"],
      ["Seal perimeter and keep drainage/weep details functional.", "किनारा seal करें और drainage/weep detail काम करने दें।"],
      ["Fit specified glass, shutters and hardware; adjust operation and safety stops.", "तय glass, shutter और hardware लगाकर operation और safety stop adjust करें।"],
      ["Inspect weather seal, operation and surface damage; protect until handover.", "Weather seal, operation और surface damage जांचें; handover तक सुरक्षित रखें।"],
    ]),
    tools: asCopy([
      ["Tape, spirit level, plumb bob and framing square", "Tape, spirit level, plumb bob और framing square"],
      ["Approved door/window and glass schedule", "स्वीकृत door/window और glass schedule"],
      ["Operation checklist and safe glass marking inspection", "Operation checklist और glass safety marking की जांच"],
    ]),
    quality: asCopy([
      ["Frame, glass, safety glazing and anchorage must match the approved schedule and applicable project/local requirements.", "Frame, glass, safety glazing और anchorage स्वीकृत schedule व लागू project/local requirement से हों।"],
      ["Do not infer glass thickness or fixing spacing; use supplier submittals and engineer-approved details.", "Glass thickness या fixing spacing खुद न तय करें; supplier submittal और engineer-approved detail लें।"],
    ]),
    mistakes: asCopy([
      ["Foaming/sealing a twisted frame without correcting alignment or anchorage.", "Alignment/anchorage सुधारे बिना टेढ़े frame को foam/seal कर देना।"],
      ["Using ordinary glass where the approved location requires safety glazing.", "जहां safety glazing तय है वहां सामान्य glass लगाना।"],
      ["Blocking drainage/weep openings with sealant or plaster.", "Sealant/plaster से drainage/weep opening बंद करना।"],
    ]),
    warnings: asCopy([
      ["Frame moves, glass is cracked/chipped, a door self-swings or locks fail.", "Frame हिले, glass टूटा/chip हो, door अपने आप घूमे या lock fail हो।"],
      ["Water enters around an external window or sharp/unprotected glass edges remain.", "बाहरी window के पास पानी आए या glass का तेज़ किनारा खुला हो।"],
    ]),
    before: asCopy([
      ["Check opening schedule, frame/glass specifications and approved samples.", "Opening schedule, frame/glass specification और स्वीकृत sample जांचें।"],
      ["Confirm adjacent plaster/tile levels and installation access.", "पास के plaster/tile level और लगाने की पहुंच पक्की करें।"],
    ]),
    during: asCopy([
      ["Check plumb, level, square, anchors and clearances before sealing.", "Seal से पहले plumb, level, square, anchor और clearance जांचें।"],
      ["Protect glass and hardware from following trades.", "Glass और hardware को आगे के काम से बचाएं।"],
    ]),
    after: asCopy([
      ["Operate each shutter, lock, handle, roller and stopper.", "हर shutter, lock, handle, roller और stopper चलाकर देखें।"],
      ["Record defects and water ingress for correction before final payment.", "Final payment से पहले दोष और पानी आने की जगह सुधार के लिए लिखें।"],
    ]),
    payment: {
      complete: c("Units are installed, sealed, adjusted and operational per the agreed schedule.", "Unit तय schedule अनुसार लगी, sealed, adjusted और काम करने योग्य हो।"),
      inspect: c("Check alignment, anchorage, safe glass, hardware, seals and each operation.", "Alignment, anchorage, safe glass, hardware, seal और हर operation जांचें।"),
      measure: c("Count accepted installed units by the contract's size/type schedule.", "Contract के size/type schedule से स्वीकार की गई लगी unit गिनें।"),
      records: c("Approved product/glass submittals, delivery record, measurement and defect close-out.", "Approved product/glass submittal, delivery record, माप और defect close-out।"),
    },
  },
  {
    id: "stage-11",
    title: c("Painting & finishing", "Painting और finishing"),
    summary: c("Start only on sound, dry, prepared surfaces and assess the approved paint system under consistent light.", "मजबूत, सूखी, तैयार सतह पर ही शुरू करें और एक-जैसी रोशनी में स्वीकृत paint system जांचें।"),
    image: "/assets/modern-residence-mysore.webp",
    imageAlt: c("Finished residential facade as a visual reference, not evidence of paint-system performance", "पूरा residential facade दृश्य संदर्भ है, paint-system performance का प्रमाण नहीं"),
    photoCredit: "Evan Lovely · CC BY 2.0",
    activities: [
      ["Surface preparation", "सतह की तैयारी"], ["Putty application", "Putty लगाना"], ["Primer", "Primer"],
      ["Interior painting", "अंदरूनी painting"], ["Exterior painting", "बाहरी painting"], ["Wood polish", "Wood polish"],
      ["Metal painting", "Metal painting"], ["Final finishing inspection", "अंतिम finishing inspection"],
    ],
    inspections: asCopy([
      ["Surface is dry, sound, clean and free from active dampness, dust, oil or loose material.", "सतह सूखी, मजबूत और साफ़ हो; सक्रिय नमी, धूल, तेल या ढीली सामग्री न हो।"],
      ["Leak/crack causes are assessed and resolved before cosmetic coating.", "Cosmetic coating से पहले leakage/crack का कारण जांचकर ठीक करें।"],
      ["Primer, putty, coating system, shade and number of coats follow approved sample/product data.", "Primer, putty, coating system, shade और coat संख्या स्वीकृत sample/product data से हो।"],
      ["Sample patch is reviewed in the actual room/light before large-area application.", "बड़े area से पहले असली कमरे/रोशनी में sample patch जांचें।"],
      ["Coverage, uniformity, edges, cut-ins and protection of fittings are checked.", "Coverage, uniformity, किनारे, cut-in और fitting की सुरक्षा जांचें।"],
      ["Wood/metal substrate and compatible primer/topcoat are verified.", "Wood/metal सतह और compatible primer/topcoat जांचें।"],
      ["Paint is not applied outside the manufacturer's temperature/moisture conditions.", "Manufacturer की temperature/moisture condition के बाहर paint न करें।"],
      ["Peeling, blister, patchiness, cracks or damp marks are logged under normal light.", "सामान्य रोशनी में peeling, blister, patchiness, crack और नमी दर्ज करें।"],
    ]),
    method: asCopy([
      ["Find and fix moisture, leakage, movement or substrate defects before covering.", "ढकने से पहले नमी, leakage, movement या सतह का दोष खोजकर सुधारें।"],
      ["Prepare and prime substrate using the approved compatible product sequence.", "स्वीकृत compatible product क्रम से सतह तैयार और prime करें।"],
      ["Apply putty/coats to the product data and agreed sample; allow specified drying between coats.", "Product data और तय sample अनुसार putty/coat लगाएं; coats के बीच तय drying दें।"],
      ["Protect fixtures, floors and adjacent finishes; maintain ventilation and safe access.", "Fitting, floor और पास की finish बचाएं; हवा और सुरक्षित पहुंच रखें।"],
      ["Inspect colour, coverage, adhesion and defects after drying in suitable light.", "सूखने के बाद सही रोशनी में colour, coverage, adhesion और दोष जांचें।"],
    ]),
    tools: asCopy([
      ["Approved shade/sample card and product data sheets", "स्वीकृत shade/sample card और product data sheet"],
      ["Inspection light, straight edge and moisture assessment by competent person", "Inspection light, straight edge और सक्षम व्यक्ति से moisture assessment"],
      ["Masking/protection materials and safe access equipment", "Masking/protection सामग्री और सुरक्षित पहुंच उपकरण"],
    ]),
    quality: asCopy([
      ["Coat count, spreading rate, drying time and moisture limits follow the selected manufacturer's data and project specification.", "Coat, spreading rate, drying time और moisture limit चुने manufacturer data/project specification से हों।"],
      ["Paint is decorative protection, not a substitute for diagnosing leaks, cracks or structural movement.", "Paint सजावटी सुरक्षा है; leak, crack या structural movement का निदान नहीं।"],
    ]),
    mistakes: asCopy([
      ["Painting over dampness, efflorescence, active cracks or uncured plaster.", "नमी, salt deposit, active crack या अधपके plaster पर paint करना।"],
      ["Skipping primer/preparation or mixing incompatible product systems.", "Primer/preparation छोड़ना या incompatible product system मिलाना।"],
      ["Accepting colour/coverage under only one lighting condition or before drying.", "सिर्फ एक रोशनी में या सूखने से पहले colour/coverage स्वीकार करना।"],
    ]),
    warnings: asCopy([
      ["Bubbling, peeling, persistent damp patch or a crack reappearing through the finish.", "Bubble, peeling, लगातार नमी या finish में दोबारा दिखती crack।"],
      ["Strong fumes, unsafe access, uncovered live fittings or no ventilation.", "तेज़ fumes, असुरक्षित पहुंच, खुली live fitting या ventilation न होना।"],
    ]),
    before: asCopy([
      ["Close water ingress and allow substrate to meet product moisture limits.", "पानी आने का कारण रोकें और सतह product moisture limit तक सूखने दें।"],
      ["Approve shade, system and sample patch.", "Shade, system और sample patch स्वीकृत करें।"],
    ]),
    during: asCopy([
      ["Check preparation, primer, coat sequence and drying intervals.", "Preparation, primer, coat sequence और drying interval जांचें।"],
      ["Protect finished work and occupants from dust/fumes.", "पूरे काम और लोगों को धूल/fumes से बचाएं।"],
    ]),
    after: asCopy([
      ["Inspect uniformity, coverage, adhesion and visible defects after drying.", "सूखने के बाद uniformity, coverage, adhesion और दिखने वाले दोष जांचें।"],
      ["Collect shade and product details for future touch-up.", "भविष्य के touch-up के लिए shade और product detail लें।"],
    ]),
    payment: {
      complete: c("Agreed surfaces and coats are complete, dry, inspected and defects rectified.", "तय सतह और coats पूरे, सूखे, जांचे और दोष सुधारे गए हों।"),
      inspect: c("Review sample/shade, surface preparation, coverage and final defects in suitable light.", "सही रोशनी में sample/shade, सतह तैयारी, coverage और final defect जांचें।"),
      measure: c("Measure accepted net area/units and agreed preparation/coats under the contract.", "Contract अनुसार स्वीकार net area/unit और तय तैयारी/coats नापें।"),
      records: c("Approved product/shade, measurements, receipts and close-out photographs.", "स्वीकृत product/shade, माप, रसीद और close-out फोटो।"),
    },
  },
  {
    id: "stage-12",
    title: c("Final inspection & handover", "अंतिम निरीक्षण और handover"),
    summary: c("Test systems, document defects, close agreed work and collect operating records before settling the final account.", "अंतिम हिसाब चुकाने से पहले system test करें, दोष लिखें, तय काम पूरा कराएं और संचालन के रिकॉर्ड लें।"),
    image: "/assets/hero-modern-residence-960.webp",
    imageAlt: c("A finished modern home, shown as a handover visual and not a defect-free certification", "पूरा आधुनिक घर—handover दृश्य, defect-free प्रमाणपत्र नहीं"),
    photoCredit: "Unsplash License",
    activities: [
      ["Complete house inspection", "पूरे घर का निरीक्षण"], ["Roof leakage inspection", "छत leakage जांचना"], ["Plumbing leakage inspection", "Plumbing leakage जांचना"],
      ["Electrical testing", "Electrical testing"], ["Door and window operation", "Door/window चलाकर जांचना"], ["Tile and flooring inspection", "Tile और flooring जांचना"],
      ["Wall and paint inspection", "दीवार और paint जांचना"], ["Drainage inspection", "Drainage जांचना"], ["Water tank inspection", "Water tank जांचना"],
      ["Defect list preparation", "Defect list बनाना"], ["Pending work completion", "बाकी काम पूरा कराना"], ["Final payment verification", "अंतिम भुगतान की पुष्टि"],
      ["Keys and document handover", "चाबी और दस्तावेज़ लेना"],
    ],
    inspections: asCopy([
      ["Walk every room, roof, service area and external drain with a dated snag list.", "हर कमरा, छत, service area और बाहरी drain तारीख वाली snag list से देखें।"],
      ["Observe roof/wet-area leakage and confirm waterproofing test/repair records.", "छत/wet-area leakage देखें और waterproofing test/repair record जांचें।"],
      ["Run taps, flushes, drains, pumps and accessible valves; document leaks or slow flow.", "Tap, flush, drain, pump और सुलभ valve चलाकर leak/धीमा flow दर्ज करें।"],
      ["Qualified electrician tests protective devices, circuits, earthing and labels.", "Qualified electrician protective device, circuit, earthing और label test करे।"],
      ["Operate each door/window, lock, shutter and safety fitting.", "हर door/window, lock, shutter और safety fitting चलाकर देखें।"],
      ["Check floor falls, drainage, cracked/hollow/loose finishes and paint defects.", "Floor slope, drainage, cracked/hollow/loose finish और paint दोष जांचें।"],
      ["Collect approved as-built drawings, test certificates, warranties and product manuals.", "Approved as-built drawing, test certificate, warranty और product manual लें।"],
      ["Reconcile final measurements, variations, paid amounts, retention and pending defects per agreement.", "Agreement अनुसार final measurement, बदलाव, भुगतान, retention और बाकी दोष मिलाएं।"],
    ]),
    method: asCopy([
      ["Prepare a room-by-room snag list with location, photo, responsible party and due date.", "कमरे के हिसाब से snag list बनाएं—जगह, फोटो, जिम्मेदार पक्ष और तारीख लिखें।"],
      ["Test plumbing, electrical, drainage, waterproofing and equipment with qualified trades.", "Qualified trade से plumbing, electrical, drainage, waterproofing और equipment test कराएं।"],
      ["Agree which defects block acceptance and record closure evidence for each item.", "कौन सा defect acceptance रोकेगा तय करें और हर item के closure का प्रमाण रखें।"],
      ["Reconcile measured work and changes against signed bills and the contract.", "मापे काम और बदलाव को हस्ताक्षरित bill व contract से मिलाएं।"],
      ["Collect keys, access codes, manuals, warranties, approved drawings and test records at handover.", "Handover पर चाबी, access code, manual, warranty, स्वीकृत drawing और test record लें।"],
    ]),
    tools: asCopy([
      ["Room-by-room handover checklist, tape and inspection light", "कमरे-दर-कमरे handover checklist, tape और inspection light"],
      ["Phone/camera and dated defect log", "Phone/camera और तारीख वाली defect log"],
      ["Qualified electrician/plumber and relevant test equipment", "Qualified electrician/plumber और संबंधित test equipment"],
      ["Contract, BOQ, variation log, invoices and payment ledger", "Contract, BOQ, variation log, invoice और payment ledger"],
    ]),
    quality: asCopy([
      ["Acceptance criteria, retention and final payment are determined by the signed contract and applicable local requirements.", "Acceptance criteria, retention और final payment हस्ताक्षरित contract व लागू स्थानीय शर्तों से तय हों।"],
      ["Visual checks help identify issues but do not certify structural safety or replace professional tests.", "देखकर जांच से समस्या पहचानने में मदद है; यह structural safety प्रमाणित या professional test का विकल्प नहीं।"],
    ]),
    mistakes: asCopy([
      ["Paying the full amount before snag closure, agreed tests and document handover.", "Snag closure, तय test और दस्तावेज़ handover से पहले पूरी रकम देना।"],
      ["Accepting verbal warranty promises or missing keys/manuals/test reports.", "मौखिक warranty मानना या चाबी/manual/test report न लेना।"],
      ["Signing a no-defects acceptance without recording unresolved issues and contractual treatment.", "बाकी समस्या और contract में उसका निपटारा लिखे बिना defect-free acceptance पर हस्ताक्षर।"],
    ]),
    warnings: asCopy([
      ["Active leakage, exposed electrical hazards, unsafe access, significant cracks or movement.", "चलता leakage, खुला electrical खतरा, असुरक्षित पहुंच, बड़ी crack या movement।"],
      ["Pressure for final payment before measurements, agreed defect corrections or handover records.", "माप, तय defect सुधार या handover record से पहले final payment का दबाव।"],
    ]),
    before: asCopy([
      ["Review contract acceptance criteria, testing scope, retention and handover deliverables.", "Contract की acceptance, testing, retention और handover deliverable जांचें।"],
      ["Prepare room/area inspection plan and invite qualified service professionals.", "कमरा/क्षेत्र inspection plan बनाएं और qualified service professional बुलाएं।"],
    ]),
    during: asCopy([
      ["Photograph and list each defect; agree owner and date for correction.", "हर defect की फोटो/list बनाएं; सुधार का जिम्मेदार और तारीख तय करें।"],
      ["Witness applicable tests and collect signed results.", "लागू test देखें और हस्ताक्षरित result लें।"],
    ]),
    after: asCopy([
      ["Retest corrected items and sign only the acceptance status actually achieved.", "सुधरे item दोबारा test करें और जितनी acceptance हुई उतनी ही लिखें।"],
      ["Reconcile final measured bill and contract holdbacks before release.", "रकम जारी करने से पहले final measured bill और contract holdback मिलाएं।"],
      ["Receive keys, manuals, warranties, drawings and service contacts.", "चाबी, manual, warranty, drawing और service contact लें।"],
    ]),
    payment: {
      complete: c("Contractual handover conditions are met, agreed snags are closed and final measured bill is reconciled.", "Contract की handover शर्तें पूरी, तय snag बंद और final measured bill मिलाया गया हो।"),
      inspect: c("Walk the snag list, witness tests and confirm written closure/acceptance.", "Snag list देखें, test witness करें और लिखित closure/acceptance लें।"),
      measure: c("Reconcile all measured work, approved variations, prior payments and contractual retention.", "सारा मापा काम, मंज़ूर बदलाव, पिछले भुगतान और contractual retention मिलाएं।"),
      records: c("Signed final account, test reports, warranties, as-builts, manuals, keys and closure list.", "हस्ताक्षरित final account, test report, warranty, as-built, manual, चाबी और closure list।"),
    },
  },
];

export const HOUSE_OWNER_STAGES: OwnerGuideStage[] = stages.map((stage) => ({
  ...stage,
  activities: stage.activities.map(([en, hi], activityIndex) => ({
    id: `${stage.id}-activity-${String(activityIndex + 1).padStart(2, "0")}`,
    title: c(en, hi),
    youtube: c(
      `${en} house construction inspection procedure`,
      `${hi} घर निर्माण जांच कैसे करें`,
    ),
  })),
}));

export const OWNER_GUIDE_WARNINGS = [
  { stageId: "stage-04", activityIndex: 2, en: "Do not allow concreting before reinforcement, cover, formwork and embedded services are inspected.", hi: "Reinforcement, cover, formwork और embedded service की जांच से पहले concrete न डालने दें।" },
  { stageId: "stage-08", activityIndex: 5, en: "Do not conceal plumbing or electrical work before the specified tests and dated photographs.", hi: "तय test और तारीख वाली फोटो से पहले plumbing/electrical काम न छिपाएं।" },
  { stageId: "stage-07", activityIndex: 0, en: "Do not install bathroom tiles before waterproofing tests and written acceptance.", hi: "Waterproofing test और लिखित स्वीकृति से पहले bathroom tile न लगाएं।" },
  { stageId: "stage-09", activityIndex: 8, en: "Do not accept flooring until the specified fall and drainage flow are checked.", hi: "तय slope और drainage flow जांचे बिना flooring स्वीकार न करें।" },
  { stageId: "stage-12", activityIndex: 11, en: "Do not release final or milestone payment without checking measured work and the signed agreement.", hi: "मापा काम और हस्ताक्षरित समझौता जांचे बिना final/milestone payment न दें।" },
  { stageId: "stage-04", activityIndex: 0, en: "Never change structural reinforcement or member sizes without approval from the responsible structural engineer.", hi: "Responsible structural engineer की मंज़ूरी बिना structural reinforcement या member size न बदलें।" },
] as const;

export const OWNER_PAYMENT_STAGES: { stageId: string; en: string; hi: string }[] = [
  { stageId: "stage-01", en: "Agreement & mobilisation", hi: "समझौता और mobilisation" },
  { stageId: "stage-03", en: "Excavation & foundation", hi: "खुदाई और नींव" },
  { stageId: "stage-03", en: "Plinth completion", hi: "Plinth पूरा होना" },
  { stageId: "stage-04", en: "RCC columns, beams & slabs", hi: "RCC column, beam और slab" },
  { stageId: "stage-05", en: "Brickwork", hi: "ईंट का काम" },
  { stageId: "stage-06", en: "Plastering", hi: "Plastering" },
  { stageId: "stage-07", en: "Waterproofing", hi: "Waterproofing" },
  { stageId: "stage-08", en: "Plumbing & electrical rough-in", hi: "Plumbing और electrical rough-in" },
  { stageId: "stage-09", en: "Flooring & tiles", hi: "Flooring और tiles" },
  { stageId: "stage-10", en: "Doors & windows", hi: "Doors और windows" },
  { stageId: "stage-11", en: "Painting & finishing", hi: "Painting और finishing" },
  { stageId: "stage-12", en: "Final handover", hi: "अंतिम handover" },
];

export const OWNER_GUIDE_CHECKLIST_COUNT = HOUSE_OWNER_STAGES.reduce(
  (total, stage) => total + stage.inspections.length,
  0,
);
