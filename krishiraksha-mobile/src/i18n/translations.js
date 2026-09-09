// Comprehensive Multilingual Dictionaries: English (en), Hindi (hi), Marathi (mr)

export const translations = {
  en: {
    // Navigation tabs
    tab_feed: 'Feed',
    tab_scan: 'Scan',
    tab_sensors: 'Sensors',
    tab_alerts: 'Alerts',
    tab_chat: 'Messages',
    tab_profile: 'Profile',
    tab_map: 'India Map',
    tab_queue: 'Triage Queue',

    // App Header & Branding
    app_name: 'KrishiRaksha',
    app_tagline: 'AI Closed-Loop Crop Protection',
    live_badge: 'LIVE',
    offline_badge: 'Offline',
    synced_toast: 'Scans synced successfully',
    offline_banner: 'Offline — {{count}} scan(s) queued to sync',

    // Onboarding Walkthrough
    onboard_title_1: 'Welcome to KrishiRaksha',
    onboard_desc_1: 'A closed-loop agricultural decision platform. Never just guess — observe, investigate, and protect.',
    onboard_title_2: 'Instant Leaf Scanning',
    onboard_desc_2: 'Scan affected leaves like a QR code. Get instant differential diagnosis with zero guesswork.',
    onboard_title_3: 'Live Field Telemetry',
    onboard_desc_3: 'Real-time soil, moisture, and pest trap counts pushed live straight to your pocket.',
    onboard_title_4: 'Expert & AI Copilot',
    onboard_desc_4: 'Connect directly with ICAR agronomists and our grounded AI assistant for trusted advisories.',
    btn_get_started: 'Get Started',
    btn_next: 'Next',
    btn_skip: 'Skip',

    // Feed / Home Screen
    feed_title: 'Community Field Health',
    feed_subtitle: 'Recent verified events in your agro-climatic zone',
    feed_filter_all: 'All Zones',
    feed_filter_verified: 'Expert Verified',
    feed_risk_high: 'High Risk',
    feed_risk_med: 'Medium Risk',
    feed_risk_low: 'Low Risk',
    feed_pull_refresh: 'Pull to refresh crop signals',
    feed_empty: 'No crop events recorded yet in this zone.',

    // Scan Screen
    scan_title: 'Scan Plant Leaf',
    scan_subtitle: 'Point your camera at an affected leaf or pick a field sample',
    btn_take_photo: 'Scan with Camera',
    btn_pick_gallery: 'Pick from Gallery',
    btn_try_samples: 'Demo Sample Catalog',
    scan_tip: 'Hold the camera 15–20 cm away under natural light. Focus on spots or discoloration.',
    scan_analyzing: 'Analyzing your leaf photo...',
    scan_analyzing_sub: 'Extracting morphological texture, HSV color space, and lesion density (< 3s)',
    scan_analyzing_step1: '1. Checking leaf foliage geometry...',
    scan_analyzing_step2: '2. Running computer vision classifier...',
    scan_analyzing_step3: '3. Calculating differential diagnostic margins...',
    scan_rejected_title: 'Non-Plant Photo Detected',
    scan_rejected_msg: 'This photo does not appear to show plant leaves or crop foliage. Please point your camera at the affected crop leaf and scan again.',
    btn_scan_again: 'Scan Again',

    // Multi-step numbered progress
    step_1: 'Step 1 of 4: Primary Leaf Scan',
    step_2: 'Step 2 of 4: Targeted Investigation',
    step_3: 'Step 3 of 4: Differential Diagnosis',
    step_4: 'Step 4 of 4: Expert Verification',

    // Case Status Chips
    status_analyzing: 'Analyzing...',
    status_awaiting_info: 'Awaiting More Info',
    status_expert_review: 'Under Expert Review',
    status_reviewed: 'Expert Verified',
    status_followup_scheduled: 'Follow-up Scheduled',
    status_resolved: 'Resolved',

    // Scan Result Screen
    result_title: 'Diagnostic Result',
    diagnosis_label: 'Primary Candidate',
    confidence_label: 'Confidence',
    severity_label: 'Estimated Severity',
    margin_alert: 'Close Diagnostic Margin Detected',
    differentials_title: 'Ranked Differential Candidates',
    ai_explanation_title: 'Simplified AI Advisory',
    advisory_loading: 'Simplifying guidance via gpt-oss:120b-cloud...',

    // What to do / What not to do card
    dos_and_donts_title: 'What To Do / What NOT To Do',
    do_item_1: 'Isolate affected plants and sanitize pruning shears.',
    do_item_2: 'Ensure row ventilation and morning root-zone drip only.',
    dont_item_1: 'Do NOT spray arbitrary chemical mixtures without expert confirmation.',
    dont_item_2: 'Do NOT use evening overhead sprinkler irrigation (promotes spore spread).',

    // Investigation prompt
    inv_title: 'Secondary Evidence Required',
    inv_desc: 'To confirm between overlapping diseases, please inspect and scan a close-up photo of the leaf underside.',
    btn_scan_underside: 'Scan Leaf Underside',
    btn_narrow_diagnosis: 'Confirm & Narrow Diagnosis',
    btn_escalate_expert: 'Escalate to Pathologist',
    escalated_success: 'Case sent to Dr. Meera Nair (Expert). Usually replies within 2–4 hours.',

    // Sensors Screen
    sensors_title: 'Live Field Telemetry',
    sensors_subtitle: 'Streaming real-time IoT sensors and pheromone trap telemetry',
    sensor_soil_moisture: 'Root-Zone Moisture',
    sensor_leaf_wetness: 'Leaf Wetness Duration',
    sensor_canopy_humidity: 'Canopy Relative Humidity',
    trap_counts_title: 'Pheromone & Sticky Traps',
    trap_threshold_breached: 'THRESHOLD BREACHED',
    trap_normal: 'Normal Baseline',
    btn_manual_entry: 'Log Manual Reading',
    manual_modal_title: 'Manual Field Sensor Entry',
    btn_submit_reading: 'Save Reading',

    // Chat / Messages Screen
    chat_title: 'Messages',
    chat_search: 'Search cases or experts...',
    chat_empty: 'No message threads yet.',
    chat_case_prefix: 'Case #',
    chat_type_message: 'Write message to expert...',
    btn_send: 'Send',
    msg_sent: 'Sent',
    msg_delivered: 'Delivered',
    msg_read: 'Read',

    // Copilot Screen
    copilot_title: 'AI Agricultural Copilot',
    copilot_tagline: 'Powered by gpt-oss:120b-cloud (Language Layer)',
    copilot_placeholder: 'Ask a question about your field or crop...',
    copilot_disclaimer: 'Advisories follow ICAR/IPM safety guidelines. Non-prescriptive.',
    copilot_btn_ask: 'Ask',

    // Alerts Screen
    alerts_title: 'Regional Outbreak Alerts',
    alerts_subtitle: 'Real-time epidemiological warnings and microclimate forecasts',
    alert_proximity: 'Proximity Warning',
    alert_weather: 'Weather Risk Window',

    // Officer India Map Screen
    map_title: 'All-India Epidemiological Map',
    map_subtitle: 'Nationwide outbreak clusters across ~6°N–37°N, 68°E–97°E',
    map_clusters_active: 'Active Regional Clusters',
    map_cases: 'Verified Cases',
    map_spread_rate: 'Spread Rate',

    // Expert Queue Screen
    queue_title: 'Uncertainty Triage Queue',
    queue_subtitle: 'Cases flagged with low confidence or close diagnostic margins',
    btn_verify_case: 'Verify Diagnosis',
    btn_confirm: 'Confirm Ground Truth',

    // Profile & Settings
    profile_title: 'Profile & Settings',
    logged_in_as: 'Signed in as',
    role_label: 'Role',
    field_label: 'Primary Field',
    language_selector: 'Language (भाषा)',
    theme_selector: 'Theme',
    theme_light: 'Light Mode',
    theme_dark: 'Dark Mode',
    demo_switch_title: 'Quick Switch Demo Persona',
    btn_logout: 'Sign Out',
  },

  hi: {
    // Navigation tabs
    tab_feed: 'फीड',
    tab_scan: 'स्कैन',
    tab_sensors: 'सेंसर',
    tab_alerts: 'अलर्ट',
    tab_chat: 'संदेश',
    tab_profile: 'प्रोफाइल',
    tab_map: 'भारत नक्शा',
    tab_queue: 'समीक्षा कतार',

    // App Header & Branding
    app_name: 'कृषि रक्षा',
    app_tagline: 'एआई संचालित फसल सुरक्षा',
    live_badge: 'लाइव',
    offline_badge: 'ऑफ़लाइन',
    synced_toast: 'स्कैन सफलतापूर्वक सिंक हो गए',
    offline_banner: 'ऑफ़लाइन — {{count}} स्कैन सिंक होने की प्रतीक्षा में',

    // Onboarding Walkthrough
    onboard_title_1: 'कृषि रक्षा में आपका स्वागत है',
    onboard_desc_1: 'फसल स्वास्थ्य का संपूर्ण समाधान। बिना अनुमान लगाए देखें, जांचें और सुरक्षित करें।',
    onboard_title_2: 'तुरंत पत्ती स्कैन करें',
    onboard_desc_2: 'क्यूआर कोड की तरह पत्ती स्कैन करें और सेकंडों में सही रोग पहचानें।',
    onboard_title_3: 'खेत के लाइव आंकड़े',
    onboard_desc_3: 'मिट्टी की नमी और कीट ट्रैप की सीधी जानकारी आपके मोबाइल पर लाइव।',
    onboard_title_4: 'विशेषज्ञ एवं एआई साथी',
    onboard_desc_4: 'कृषि वैज्ञानिकों और हमारे एआई साथी से तुरंत सुरक्षित सलाह प्राप्त करें।',
    btn_get_started: 'शुरू करें',
    btn_next: 'आगे बढ़ें',
    btn_skip: 'छोड़ें',

    // Feed / Home Screen
    feed_title: 'क्षेत्रीय फसल स्वास्थ्य',
    feed_subtitle: 'आपके कृषि क्षेत्र में हाल ही में पुष्टि हुए मामले',
    feed_filter_all: 'सभी क्षेत्र',
    feed_filter_verified: 'विशेषज्ञ सत्यापित',
    feed_risk_high: 'उच्च जोखिम',
    feed_risk_med: 'मध्यम जोखिम',
    feed_risk_low: 'सामान्य',
    feed_pull_refresh: 'ताज़ा करने के लिए नीचे खींचें',
    feed_empty: 'इस क्षेत्र में अभी कोई मामला दर्ज नहीं है।',

    // Scan Screen
    scan_title: 'पौधे की पत्ती स्कैन करें',
    scan_subtitle: 'कैमरे को प्रभावित पत्ती पर रखें या नमूना चुनें',
    btn_take_photo: 'कैमरे से स्कैन करें',
    btn_pick_gallery: 'गैलरी से चुनें',
    btn_try_samples: 'डेमो नमूना सूची',
    scan_tip: 'प्राकृतिक रोशनी में कैमरे को 15-20 सेमी दूरी पर रखें। धब्बों पर फोकस करें।',
    scan_analyzing: 'आपकी पत्ती का विश्लेषण हो रहा है...',
    scan_analyzing_sub: 'पत्ती की बनावट, रंग और धब्बों का त्वरित परीक्षण (< 3 सेकंड)',
    scan_analyzing_step1: '1. पत्ती की संरचना की जांच...',
    scan_analyzing_step2: '2. कंप्यूटर विज़न मॉडल से मिलान...',
    scan_analyzing_step3: '3. संभावित रोगों के अंतर की गणना...',
    scan_rejected_title: 'पत्ती की फोटो नहीं है',
    scan_rejected_msg: 'यह फोटो किसी पौधे या पत्ती की नहीं दिख रही है। कृपया कैमरे को प्रभावित पौधे की पत्ती पर रखकर पुनः स्कैन करें।',
    btn_scan_again: 'पुनः स्कैन करें',

    // Multi-step numbered progress
    step_1: 'चरण 1/4: मुख्य पत्ती स्कैन',
    step_2: 'चरण 2/4: पत्ती के नीचे की जांच',
    step_3: 'चरण 3/4: संभावित रोग परिणाम',
    step_4: 'चरण 4/4: विशेषज्ञ पुष्टि',

    // Case Status Chips
    status_analyzing: 'विश्लेषण जारी...',
    status_awaiting_info: 'अतिरिक्त जानकारी प्रतीक्षित',
    status_expert_review: 'वैज्ञानिक समीक्षाधीन',
    status_reviewed: 'विशेषज्ञ द्वारा सत्यापित',
    status_followup_scheduled: 'फॉलो-अप निर्धारित',
    status_resolved: 'निपटारा हुआ',

    // Scan Result Screen
    result_title: 'जांच परिणाम',
    diagnosis_label: 'मुख्य संभावित रोग',
    confidence_label: 'निश्चितता',
    severity_label: 'अनुमानित गंभीरता',
    margin_alert: 'दो रोगों में कम अंतर पाया गया',
    differentials_title: 'संभावित रोगों की सूची',
    ai_explanation_title: 'सरल एआई सलाह',
    advisory_loading: 'gpt-oss:120b-cloud द्वारा सरल सलाह तैयार हो रही है...',

    // What to do / What not to do card
    dos_and_donts_title: 'क्या करें / क्या न करें',
    do_item_1: 'रोगग्रस्त पत्तों को काटकर अलग करें और औजारों को साफ रखें।',
    do_item_2: 'खेत में हवा का संचार बनाए रखें और सुबह ड्रिप से सिंचाई करें।',
    dont_item_1: 'बिना विशेषज्ञ पुष्टि के कोई भी रासायनिक कीटनाशक न छिड़कें।',
    dont_item_2: 'शाम के समय फव्वारा सिंचाई न करें (इससे फफूंद फैलती है)।',

    // Investigation prompt
    inv_title: 'अतिरिक्त जांच आवश्यक',
    inv_desc: 'सटीक पुष्टि के लिए कृपया पत्ती के निचले हिस्से की एक साफ फोटो स्कैन करें।',
    btn_scan_underside: 'निचले हिस्से को स्कैन करें',
    btn_narrow_diagnosis: 'पुष्टि करें और रोग तय करें',
    btn_escalate_expert: 'वैज्ञानिक को भेजें',
    escalated_success: 'मामला डॉ. मीरा नायर (कृषि वैज्ञानिक) को भेजा गया। उत्तर 2-4 घंटे में प्राप्त होगा।',

    // Sensors Screen
    sensors_title: 'खेत के लाइव आंकड़े',
    sensors_subtitle: 'मिट्टी की नमी और कीट ट्रैप का वास्तविक समय प्रसारण',
    sensor_soil_moisture: 'जड़ क्षेत्र की नमी',
    sensor_leaf_wetness: 'पत्ती पर नमी का समय',
    sensor_canopy_humidity: 'पौधों के बीच हवा की नमी',
    trap_counts_title: 'फेरोमोन एवं स्टिकी ट्रैप',
    trap_threshold_breached: 'खतरे की सीमा पार',
    trap_normal: 'सामान्य स्तर',
    btn_manual_entry: 'हाथ से दर्ज करें',
    manual_modal_title: 'सेंसर रीडिंग दर्ज करें',
    btn_submit_reading: 'सहेजें',

    // Chat / Messages Screen
    chat_title: 'संदेश',
    chat_search: 'मामला या विशेषज्ञ खोजें...',
    chat_empty: 'अभी कोई संदेश नहीं है।',
    chat_case_prefix: 'मामला #',
    chat_type_message: 'विशेषज्ञ को संदेश लिखें...',
    btn_send: 'भेजें',
    msg_sent: 'भेजा गया',
    msg_delivered: 'पहुंच गया',
    msg_read: 'पढ़ा गया',

    // Copilot Screen
    copilot_title: 'एआई कृषि सहायक',
    copilot_tagline: 'gpt-oss:120b-cloud भाषा मॉडल द्वारा संचालित',
    copilot_placeholder: 'अपने खेत या फसल के बारे में पूछें...',
    copilot_disclaimer: 'सलाह आईसीएआर दिशानिर्देशों पर आधारित है। गैर-दवायुक्त।',
    copilot_btn_ask: 'पूछें',

    // Alerts Screen
    alerts_title: 'क्षेत्रीय चेतावनी',
    alerts_subtitle: 'मौसम पूर्वानुमान और निकटवर्ती खेतों में रोग चेतावनी',
    alert_proximity: 'निकटता चेतावनी',
    alert_weather: 'मौसम जोखिम',

    // Officer India Map Screen
    map_title: 'अखिल भारतीय रोग मानचित्र',
    map_subtitle: 'देश भर के हॉटस्पॉट क्लस्टर (~6°N–37°N, 68°E–97°E)',
    map_clusters_active: 'सक्रिय क्लस्टर',
    map_cases: 'सत्यापित मामले',
    map_spread_rate: 'प्रसार गति',

    // Expert Queue Screen
    queue_title: 'समीक्षा कतार',
    queue_subtitle: 'संदेहास्पद अथवा कम निश्चितता वाले मामले',
    btn_verify_case: 'मामले की जांच करें',
    btn_confirm: 'सत्यापित करें',

    // Profile & Settings
    profile_title: 'प्रोफाइल एवं सेटिंग्स',
    logged_in_as: 'उपयोगकर्ता',
    role_label: 'भूमिका',
    field_label: 'मुख्य खेत',
    language_selector: 'भाषा चुनें',
    theme_selector: 'थीम',
    theme_light: 'लाइट मोड',
    theme_dark: 'डार्क मोड',
    demo_switch_title: 'डेमो भूमिका बदलें',
    btn_logout: 'लॉग आउट',
  },

  mr: {
    // Navigation tabs
    tab_feed: 'फीड',
    tab_scan: 'स्कॅन',
    tab_sensors: 'सेन्सर',
    tab_alerts: 'सूचना',
    tab_chat: 'संदेश',
    tab_profile: 'प्रोफाइल',
    tab_map: 'भारत नकाशा',
    tab_queue: 'तपासणी रांग',

    // App Header & Branding
    app_name: 'कृषि रक्षा',
    app_tagline: 'एआय पीक संरक्षण प्रणाली',
    live_badge: 'थेट (LIVE)',
    offline_badge: 'ऑफलाईन',
    synced_toast: 'स्कॅन यशस्वीरित्या सिंक झाले',
    offline_banner: 'ऑफलाईन — {{count}} स्कॅन सिंक होण्याच्या प्रतीक्षेत',

    // Onboarding Walkthrough
    onboard_title_1: 'कृषि रक्षामध्ये आपले स्वागत',
    onboard_desc_1: 'पिकांच्या आरोग्याची खात्रीशीर तपासणी. अचूक निदान आणि शास्त्रीय सल्ला.',
    onboard_title_2: 'पानांचे झटपट स्कॅनिंग',
    onboard_desc_2: 'क्यूआर कोडप्रमाणे पानाचा फोटो स्कॅन करा आणि क्षणात अचूक रोग ओळखा.',
    onboard_title_3: 'थेट सेन्सर आकडेवारी',
    onboard_desc_3: 'जमिनीतील ओलावा आणि कीटक ट्रॅपची थेट माहिती आपल्या मोबाईलवर.',
    onboard_title_4: 'तज्ज्ञ आणि एआय सहाय्यक',
    onboard_desc_4: 'कृषी विद्यापीठातील शास्त्रज्ञ व एआय कडून सुरक्षित व योग्य मार्गदर्शन मिळवा.',
    btn_get_started: 'सुरू करा',
    btn_next: 'पुढे चला',
    btn_skip: 'वगळा',

    // Feed / Home Screen
    feed_title: 'परिसरातील पीक आरोग्य',
    feed_subtitle: 'आपल्या भागातील नोंदणीकृत पिकांची सद्यस्थिती',
    feed_filter_all: 'सर्व भाग',
    feed_filter_verified: 'तज्ज्ञ प्रमाणित',
    feed_risk_high: 'अति धोका',
    feed_risk_med: 'मध्यम धोका',
    feed_risk_low: 'कमी धोका',
    feed_pull_refresh: 'रिफ्रेश करण्यासाठी खाली ओढा',
    feed_empty: 'सध्या या भागात कोणतीही नवीन नोंद नाही.',

    // Scan Screen
    scan_title: 'झाडाचे पान स्कॅन करा',
    scan_subtitle: 'कॅमेरा बाधित पानावर धरा किंवा नमुना निवडा',
    btn_take_photo: 'कॅमेऱ्याने स्कॅन करा',
    btn_pick_gallery: 'गॅलरीतून निवडा',
    btn_try_samples: 'डेमो नमुना यादी',
    scan_tip: 'कॅमेरा पानाच्या १५-२० सेमी अंतरावर नैसर्गिक प्रकाशात धरा.',
    scan_analyzing: 'पानाचे विश्लेषण सुरू आहे...',
    scan_analyzing_sub: 'पानाचे रंग व डागांची कॉम्प्युटर व्हिजनद्वारे तपासणी (< ३ सेकंद)',
    scan_analyzing_step1: '१. पानाच्या आकाराची तपासणी...',
    scan_analyzing_step2: '२. व्हिजन मॉडेलशी तुलना...',
    scan_analyzing_step3: '३. रोगाच्या शक्यतेचे विश्लेषण...',
    scan_rejected_title: 'पानाचा फोटो आढळला नाही',
    scan_rejected_msg: 'हा फोटो पिकाच्या पानाचा दिसत नाही. कृपया कॅमेरा पिकाच्या बाधित पानावर धरून पुन्हा स्कॅन करा.',
    btn_scan_again: 'पुन्हा स्कॅन करा',

    // Multi-step numbered progress
    step_1: 'टप्पा १/४: मुख्य पान स्कॅन',
    step_2: 'टप्पा २/४: पानाच्या खालची तपासणी',
    step_3: 'टप्पा ३/४: रोगाचे संभाव्य निदान',
    step_4: 'टप्पा ४/४: शास्त्रज्ञ तपासणी',

    // Case Status Chips
    status_analyzing: 'विश्लेषण सुरू...',
    status_awaiting_info: 'माहितीची प्रतीक्षा',
    status_expert_review: 'तज्ज्ञांकडे प्रलंबित',
    status_reviewed: 'तज्ज्ञांनी तपासले',
    status_followup_scheduled: 'फॉलो-अप नियोजित',
    status_resolved: 'निवारण झाले',

    // Scan Result Screen
    result_title: 'निदान अहवाल',
    diagnosis_label: 'प्राथमिक शक्यता',
    confidence_label: 'अचूकता',
    severity_label: 'तीव्रता अंदाज',
    margin_alert: 'दोन रोगांमध्ये कमी तफावत',
    differentials_title: 'इतर संभाव्य रोग',
    ai_explanation_title: 'सोपा एआय सल्ला',
    advisory_loading: 'gpt-oss:120b-cloud द्वारे सल्ला तयार होत आहे...',

    // What to do / What not to do card
    dos_and_donts_title: 'काय करावे / काय करू नये',
    do_item_1: 'बाधित पाने खुडून नष्ट करा आणि छाटणीची कात्री निर्जंतुक करा.',
    do_item_2: 'झाडांमध्ये हवा खेळती ठेवा आणि सकाळी ठिबक सिंचनाने पाणी द्या.',
    dont_item_1: 'तज्ज्ञांच्या सल्ल्याशिवाय कोणतेही रासायनिक कीटकनाशक फवारू नका.',
    dont_item_2: 'संध्याकाळी तुषार सिंचन करू नका (याने बुरशी वाढते).',

    // Investigation prompt
    inv_title: 'अतिरिक्त तपासणी आवश्यक',
    inv_desc: 'अचूक निदानासाठी कृपया पानाच्या खालच्या भागाचा स्पष्ट फोटो स्कॅन करा.',
    btn_scan_underside: 'पानाची खालची बाजू स्कॅन करा',
    btn_narrow_diagnosis: 'निश्चित करा',
    btn_escalate_expert: 'तज्ज्ञांकडे पाठवा',
    escalated_success: 'केस डॉ. मीरा नायर (रोगशास्त्रज्ञ) यांच्याकडे पाठवली. २-४ तासांत उत्तर मिळेल.',

    // Sensors Screen
    sensors_title: 'थेट सेन्सर माहिती',
    sensors_subtitle: 'मातीतील ओलावा आणि कीटक सापळ्यांची थेट नोंद',
    sensor_soil_moisture: 'मुळांतील ओलावा',
    sensor_leaf_wetness: 'पानावरील ओलावा काळ',
    sensor_canopy_humidity: 'झाडांमधील हवेतील आर्द्रता',
    trap_counts_title: 'कामगंध व चिकट सापळे',
    trap_threshold_breached: 'धोका पातळी ओलांडली',
    trap_normal: 'सर्वसाधारण स्थिती',
    btn_manual_entry: 'नोंदणी करा',
    manual_modal_title: 'सेन्सर नोंद करा',
    btn_submit_reading: 'जतन करा',

    // Chat / Messages Screen
    chat_title: 'संदेश',
    chat_search: 'केस किंवा तज्ज्ञ शोधा...',
    chat_empty: 'कोणताही संदेश उपलब्ध नाही.',
    chat_case_prefix: 'केस #',
    chat_type_message: 'तज्ज्ञांना संदेश लिहा...',
    btn_send: 'पाठवा',
    msg_sent: 'पाठवले',
    msg_delivered: 'पोहोचले',
    msg_read: 'वाचले',

    // Copilot Screen
    copilot_title: 'एआय कृषी साथीदार',
    copilot_tagline: 'gpt-oss:120b-cloud द्वारे समर्थित',
    copilot_placeholder: 'आपल्या शेताबद्दल प्रश्न विचारा...',
    copilot_disclaimer: 'सल्ला आयसीएआर नियमांनुसार सुरक्षित व रासायनिक औषधांशिवाय आहे.',
    copilot_btn_ask: 'विचारा',

    // Alerts Screen
    alerts_title: 'प्रादेशिक सूचना',
    alerts_subtitle: 'हवामान अंदाज आणि जवळच्या भागातील रोग प्रसार सूचना',
    alert_proximity: 'जवळचा धोका',
    alert_weather: 'हवामान जोखीम',

    // Officer India Map Screen
    map_title: 'अखिल भारतीय पीक नकाशा',
    map_subtitle: 'देशभरातील प्रमुख हॉटस्पॉट क्लस्टर (~6°N–37°N, 68°E–97°E)',
    map_clusters_active: 'सक्रिय क्लस्टर',
    map_cases: 'पुष्टी झालेले रुग्ण',
    map_spread_rate: 'प्रसार गती',

    // Expert Queue Screen
    queue_title: 'तपासणी रांग',
    queue_subtitle: 'कमी खात्री किंवा संशयास्पद असणाऱ्या केसेस',
    btn_verify_case: 'केस तपासा',
    btn_confirm: 'प्रमाणित करा',

    // Profile & Settings
    profile_title: 'प्रोफाइल व सेटिंग्स',
    logged_in_as: 'वापरकर्ता',
    role_label: 'भूमिका',
    field_label: 'मुख्य शेत',
    language_selector: 'भाषा निवडा',
    theme_selector: 'थीम',
    theme_light: 'लाईट मोड',
    theme_dark: 'डार्क मोड',
    demo_switch_title: 'डेमो भूमिका बदला',
    btn_logout: 'बाहेर पडा',
  },
};
