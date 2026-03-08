// ============================================================
//  基础常量 / 共享状态
// ============================================================
const SIMPLE_IDS = [
    'char_name','chinese_name','nickname','age','birthday_date','birthday_zodiac',
    'gender','height','replace_alias',
    'hair','eyes','skin','face_style',
    'attire_formal','attire_business','attire_casual','attire_home',
    'emotional_angry','emotional_happy','emotional_sad',
    'speech_with_user','speech_reasoning','speech_accent','speech_online',
    'additional_notes',
    'age_range_childhood','age_range_teenage','age_range_youth','age_range_current',
    'nsfw_experiences','nsfw_orientation'
];

const ARRAY_DEFS = [
    ['identity-container',        'identity-item',        false],
    ['archetype-container',       'archetype-item',       false],
    ['social-container',          'social-item',          false],
    ['childhood-container',       'childhood-item',       true],
    ['teenage-container',         'teenage-item',         true],
    ['youth-container',           'youth-item',           true],
    ['current-container',         'current-item',         true],
    ['build-container',           'build-item',           false],
    ['core-traits-container',     'core-traits-item',     false],
    ['romantic-traits-container', 'romantic-traits-item', false],
    ['weakness-container',        'weakness-item',        false],
    ['likes-container',           'likes-item',           false],
    ['dislikes-container',        'dislikes-item',        false],
    ['goals-container',           'goals-item',           false],
    ['past_events-container',     'past_events-item',     true],
    ['impression-container',      'impression-item',      true],
    ['relation_notes-container',  'relation_notes-item',  true],
    ['lifestyle-container',       'lifestyle-item',       true],
    ['work-container',            'work-item',            true],
    ['boundaries-container',      'boundaries-item',      true],
    ['work-skills-container',     'work-skills-item',     false],
    ['life-skills-container',     'life-skills-item',     false],
    ['hobby-skills-container',    'hobby-skills-item',    false],
    ['catchphrase-container',     'catchphrase-item',     false],
    ['mannerisms-container',      'mannerisms-item',      false],
    ['trauma-container',          'trauma-item',          true],
    ['values-container',          'values-item',          false],
    ['conflicts-container',       'conflicts-item',       true],
    ['secrets-container',         'secrets-item',         true],
    ['relationships-container',   'relationships-item',   true],
    ['defining-moments-container','defining-moments-item',true],
    ['nsfw-role-container',       'nsfw-role-item',       true],
    ['nsfw-habits-container',     'nsfw-habits-item',     true],
    ['kinks-container',           'kinks-item',           false],
    ['limits-container',          'limits-item',          false],
];

const LS_CHARS = 'rp_characters';
const LS_CURRENT = 'rp_current_char';
const LS_INSPO = 'rp_inspo_pool';
const LS_INSPO_LAST_ROLL = 'rp_inspo_last_roll';
const LS_SYNC_USER = 'sync_user_id';
const LS_SYNC_USERS = 'sync_user_ids';
const LS_SYNC_USER_CURRENT = 'sync_user_id_current';
const LS_VISITOR_ID = 'unique_visitor_id';
const LS_SURNAMES = 'rp_namer_surnames';
const LS_CHARNAMES = 'rp_namer_charnames';
const LS_AI_PROVIDERS = 'rp_ai_providers';
const LS_AI_CURRENT_P = 'rp_ai_current_provider';
const LS_AI_CONFIG = 'rp_ai_config';
const CLOUD_META_CONFIG_ID = '__cloud_meta_config__';

const SUPABASE_URL = 'https://cukfyqnrsrikimipbyrh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1a2Z5cW5yc3Jpa2ltaXBieXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MjY2MTEsImV4cCI6MjA4ODIwMjYxMX0.Dj7zH_OGJZ5X2jJolRXx4nTnOKN4_rUnRvboUm0-OoU';

const DEFAULT_SURNAMES = ['李','王','张','刘','陈','杨','赵','黄','周','吴','徐','孙','朱','马','胡','郭','林','何','高','梁','郑','谢','宋','唐','许','韩','冯','邓','曹','彭','曾','萧','田','董','袁','潘','于','蒋','蔡','余','杜','叶','程','苏','魏','吕','丁','任','沈','姚','卢','姜','崔','钟','谭','陆','汪','范','白','廖','秦','金','江','史','顾','侯','邵','孟','龙','万','段','漕','钱','汤','尹','黎','易','常','武','乔','贺','赖','龚','文'];
const DEFAULT_CHARNAMES = ['若','安','清','云','月','雪','烟','霜','风','竹','梅','兰','菊','莲','瑾','璃','玉','珏','珊','瑶','璇','琛','琰','瑜','熙','辰','宸','晨','曦','昊','昕','旭','晓','明','远','深','浩','澜','渊','泽','涵','沁','滟','溪','洛','汐','泠','漪','鸢','翎','鸿','羽','凌','烨','炎','焰','煜','灼','焱','霆','霖','霓','灵','皓','皎','皙','奕','弈','亦','亦','逸','渺','邈','悠','沉','衡','衍','庭','廷','琦','琰','钰','锦','绯','绮','缦','纱','纨','绢','素','织','绫','罗','缎','纶','弦','韵','音','律','谐','和','静','幽','谧','澄','淡','淑','惠','雅','致','萱','蘅','芷','芸','茉','莺','蓉','菱','荷','芙','蔷','薇','苓','苒','苏','蓓','蕊','蕾','馨','芳','蔚','葳','葵','蒲','菡','荣','华','秀','英','颖','卿','莞','婉','婧','嫣','嫦','媛','姝','姣','婵','娴','娉','婷'];

const MODULE_LABELS = {
    basic: '基础信息', background: '背景故事', appearance: '外貌穿着',
    personality: '性格特质', user_relation: '{{user}}相关',
    behavior: '行为习惯', speech: '说话风格', extra: '额外补充',
    nsfw: '🔞 NSFW信息'
};

const MODULE_JSON_SCHEMA = {
    basic: `  "basic": { "char_name":"", "chinese_name":"", "nickname":"", "age":"", "birthday_date":"", "birthday_zodiac":"", "gender":"", "height":"", "identity":[], "archetype":[], "social":[] }`,
    background: `  "background": { "childhood_range":"0-12岁", "childhood":[], "teenage_range":"13-18岁", "teenage":[], "youth_range":"19-24岁", "youth":[], "current_range":"", "current":[] }`,
    appearance: `  "appearance": { "hair":"", "eyes":"", "skin":"", "face_style":"", "build":[], "attire_formal":"", "attire_business":"", "attire_casual":"", "attire_home":"" }`,
    personality: `  "personality": { "core_traits":[], "romantic_traits":[], "weakness":[], "likes":[], "dislikes":[], "goals":[] }`,
    user_relation: `  "user_relation": { "past_events":[], "impression":[], "notes":[] }`,
    behavior: `  "behavior": { "lifestyle":[], "work_behaviors":[], "emotional_angry":"", "emotional_happy":"", "emotional_sad":"", "boundaries":[], "work_skills":[], "life_skills":[], "hobby_skills":[] }`,
    speech: `  "speech": { "speech_with_user":"", "speech_reasoning":"", "speech_accent":"", "speech_online":"" }`,
    extra: `  "extra": { "additional_notes":"", "catchphrases":[], "mannerisms":[], "trauma":[], "values":[], "conflicts":[], "secrets":[], "relationships":[], "defining_moments":[] }`,
    nsfw: `  "nsfw": { "experiences":"", "sexual_orientation":"", "sexual_role":[], "sexual_habits":[], "kinks":[], "limits":[] }`,
};

const AI_SUBTAB_PERSONA_CARD = 'persona-card';
const AI_SUBTAB_WORLDVIEW = 'worldview';
const AI_SUBTAB_OPENING = 'opening';

const AI_PRONOUN_LABELS = {
    first: '第一人称',
    second: '第二人称',
    third: '第三人称'
};

const AI_PERSONA_CARD_INSTRUCTIONS_DEFAULT = `请根据用户提供的需求与各模块引导词，补全对应的人设卡内容。
要求：
1. 只生成本次请求的模块；
2. 若表单里已有内容，请优先参考并保持设定一致；
3. 列表字段尽量提供 2-5 个条目，描述精炼但有层次；
4. 设定之间要前后呼应，避免互相冲突；
5. 风格保持细腻、自然、适合角色卡直接使用。`;

const AI_OPENING_INSTRUCTIONS_DEFAULT = `请直接输出一段可用于故事开篇的正文，不要使用JSON、标题、分点、注释或markdown格式。
需要满足以下要求：
1. 紧扣用户提供的角色设定、关系线索、氛围关键词与故事开端描述；
2. 重点呈现角色登场、场景氛围、冲突伏笔或情绪张力；
3. 语言有画面感与文学性，但保持可读性；
4. 正文长度尽量贴近用户要求的字数范围；
5. 只回复开场白正文本身，不要附加解释。`;

window.AppState = window.AppState || {
    supabaseClient: null,
    syncUserId: '',
    configSyncTimer: null,
    isApplyingCloudConfig: false,
    hasPendingCloudChanges: false,
    saveTimer: null,
    aiLastJson: null,
    aiActiveSubtab: AI_SUBTAB_PERSONA_CARD,
    aiInstructionDrafts: {
        [AI_SUBTAB_PERSONA_CARD]: AI_PERSONA_CARD_INSTRUCTIONS_DEFAULT,
        [AI_SUBTAB_WORLDVIEW]: '',
        [AI_SUBTAB_OPENING]: AI_OPENING_INSTRUCTIONS_DEFAULT
    },
    selectedModel: '',
    currentAbortController: null,
    namerImportType: 'surname'
};