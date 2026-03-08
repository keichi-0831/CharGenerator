// ============================================================
//  AI 配置 / 生成
// ============================================================
function getProviders() { try { return JSON.parse(localStorage.getItem(LS_AI_PROVIDERS)) || {}; } catch (e) { return {}; } }
function saveProviders(p) { localStorage.setItem(LS_AI_PROVIDERS, JSON.stringify(p)); }
function getCurrentProviderId() { return localStorage.getItem(LS_AI_CURRENT_P) || null; }
function setCurrentProviderId(id) { localStorage.setItem(LS_AI_CURRENT_P, id); }
function generateProviderId() { return 'prov_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5); }

function migrateOldAiConfig() {
    const providers = getProviders();
    if (Object.keys(providers).length > 0) return;
    try {
        const old = JSON.parse(localStorage.getItem(LS_AI_CONFIG));
        if (old && (old.baseUrl || old.apiKey)) {
            const id = generateProviderId();
            providers[id] = { name: '默认供应商', baseUrl: old.baseUrl || '', apiKey: old.apiKey || '', selectedModel: '' };
            saveProviders(providers);
            setCurrentProviderId(id);
        }
    } catch (e) {}
}

function initProviderSystem() {
    migrateOldAiConfig();
    let providers = getProviders();
    let currentId = getCurrentProviderId();
    if (Object.keys(providers).length === 0) {
        const id = generateProviderId();
        providers[id] = { name: '默认供应商', baseUrl: '', apiKey: '', selectedModel: '' };
        saveProviders(providers);
        currentId = id;
        setCurrentProviderId(id);
    }
    if (!providers[currentId]) {
        currentId = Object.keys(providers)[0];
        setCurrentProviderId(currentId);
    }
    renderProviderSelect(providers, currentId);
    loadProviderConfig(currentId);
}

function renderProviderSelect(providers, currentId) {
    const sel = document.getElementById('providerSelect');
    sel.innerHTML = '';
    Object.entries(providers).forEach(([id, p]) => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = p.name;
        if (id === currentId) opt.selected = true;
        sel.appendChild(opt);
    });
}

function switchProvider(newId) {
    saveCurrentProviderConfig();
    setCurrentProviderId(newId);
    loadProviderConfig(newId);
    document.getElementById('modelList').innerHTML = '';
    setApiStatus('', '');
    AppState.selectedModel = '';
}

function loadProviderConfig(id) {
    const providers = getProviders();
    const p = providers[id];
    if (!p) return;
    document.getElementById('aiBaseUrl').value = p.baseUrl || '';
    document.getElementById('aiApiKey').value = p.apiKey || '';
    AppState.selectedModel = p.selectedModel || '';
    document.getElementById('modelList').innerHTML = '';
    if (AppState.selectedModel) setApiStatus('', `上次选择的模型: ${AppState.selectedModel}`);
    else setApiStatus('', '');
}

function saveCurrentProviderConfig() {
    const id = getCurrentProviderId();
    if (!id) return;
    const providers = getProviders();
    if (!providers[id]) return;
    providers[id].baseUrl = document.getElementById('aiBaseUrl').value.trim();
    providers[id].apiKey = document.getElementById('aiApiKey').value.trim();
    providers[id].selectedModel = AppState.selectedModel || '';
    saveProviders(providers);
    scheduleCloudConfigSync();
}

function newProvider() {
    const name = prompt('新建 API 供应商名称：', '新供应商');
    if (!name) return;
    saveCurrentProviderConfig();
    const providers = getProviders();
    const id = generateProviderId();
    providers[id] = { name: name.trim(), baseUrl: '', apiKey: '', selectedModel: '' };
    saveProviders(providers);
    setCurrentProviderId(id);
    renderProviderSelect(providers, id);
    loadProviderConfig(id);
    document.getElementById('modelList').innerHTML = '';
    setApiStatus('', '');
    AppState.selectedModel = '';
    showToast('✨ 已新建供应商：' + name.trim());
}

function renameProvider() {
    const id = getCurrentProviderId();
    if (!id) return;
    const providers = getProviders();
    const oldName = providers[id]?.name || '';
    const name = prompt('重命名供应商：', oldName);
    if (!name || name.trim() === oldName) return;
    providers[id].name = name.trim();
    saveProviders(providers);
    renderProviderSelect(providers, id);
    showToast('✏️ 已重命名为：' + name.trim());
}

function deleteProvider() {
    const id = getCurrentProviderId();
    if (!id) return;
    const providers = getProviders();
    if (Object.keys(providers).length <= 1) { alert('至少保留一个供应商！'); return; }
    if (!confirm(`确定删除供应商「${providers[id]?.name}」吗？`)) return;
    delete providers[id];
    saveProviders(providers);
    const newId = Object.keys(providers)[0];
    setCurrentProviderId(newId);
    renderProviderSelect(providers, newId);
    loadProviderConfig(newId);
    document.getElementById('modelList').innerHTML = '';
    setApiStatus('', '');
    AppState.selectedModel = '';
    showToast('🗑️ 供应商已删除');
}

function saveAiConfig() { saveCurrentProviderConfig(); }
function toggleApiKey() { const inp = document.getElementById('aiApiKey'); inp.type = inp.type === 'password' ? 'text' : 'password'; }

async function fetchModels() {
    const baseUrl = document.getElementById('aiBaseUrl').value.trim().replace(/\/+$/, '');
    const apiKey = document.getElementById('aiApiKey').value.trim();
    if (!baseUrl) { showToast('请先填写 API 地址'); return; }
    setApiStatus('loading', '正在获取模型列表…');
    document.getElementById('modelList').innerHTML = '';
    AppState.selectedModel = '';
    try {
        const res = await fetch(`${baseUrl}/v1/models`, {
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const models = (data.data || data.models || []).map(m => m.id || m).filter(Boolean);
        if (models.length === 0) throw new Error('未找到可用模型');
        setApiStatus('valid', `已连接 · ${models.length} 个模型可用`);
        renderModelList(models);
        saveAiConfig();
    } catch (err) {
        setApiStatus('invalid', `连接失败：${err.message}`);
    }
}

function setApiStatus(state, text) {
    document.getElementById('apiDot').className = 'api-dot ' + state;
    document.getElementById('apiStatusText').textContent = text;
}

function renderModelList(models) {
    const list = document.getElementById('modelList');
    list.innerHTML = '';
    models.forEach(id => {
        const card = document.createElement('div');
        card.className = 'model-card';
        card.dataset.model = id;
        card.innerHTML = `<span class="model-dot"></span>${escapeHtml(id)}`;
        card.onclick = () => {
            document.querySelectorAll('.model-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            AppState.selectedModel = id;
            scheduleCloudConfigSync();
        };
        list.appendChild(card);
        if (!AppState.selectedModel) card.click();
        else if (AppState.selectedModel === id) card.classList.add('selected');
    });
}

function getSelectedModules() {
    return Array.from(document.querySelectorAll('input[name="aiModule"]:checked')).map(el => el.value);
}

function getActiveAiSubtab() {
    return AppState.aiActiveSubtab || AI_SUBTAB_PERSONA_CARD;
}

function isOpeningMode() {
    return getActiveAiSubtab() === AI_SUBTAB_OPENING;
}

function updateAiInstructionsByActiveTab(force = false) {
    const el = document.getElementById('aiInstructions');
    if (!el) return;
    const activeTab = getActiveAiSubtab();
    const defaults = {
        [AI_SUBTAB_PERSONA_CARD]: AI_PERSONA_CARD_INSTRUCTIONS_DEFAULT,
        [AI_SUBTAB_WORLDVIEW]: '',
        [AI_SUBTAB_OPENING]: AI_OPENING_INSTRUCTIONS_DEFAULT
    };
    const currentDefault = defaults[activeTab] || '';
    if (force || !el.value.trim()) el.value = currentDefault;
    else if (AppState.aiInstructionDrafts && AppState.aiInstructionDrafts[activeTab] !== undefined) el.value = AppState.aiInstructionDrafts[activeTab];
}

function syncAiTabUI() {
    const previewBlock = document.getElementById('modulePreviewBlock');
    const previewTitle = document.getElementById('aiPreviewTitle');
    const fillBtn = document.querySelector('.btn-ai-fill');
    const isOpening = isOpeningMode();
    if (previewBlock) previewBlock.style.display = isOpening ? 'none' : '';
    if (previewTitle) previewTitle.textContent = isOpening ? '📋 本次将发送的 XML 预览' : '📋 本次将发送的 JSON 格式预览';
    if (fillBtn) fillBtn.style.display = isOpening ? 'none' : '';
}

function buildOpeningPreview() {
    const xpCore = document.getElementById('aiXpCore')?.value.trim() || '';
    const trope = document.getElementById('aiTrope')?.value.trim() || '';
    const sendTrope = !!document.getElementById('sendTropeToAi')?.checked;
    const yamlCard = typeof generateYaml === 'function' ? (generateYaml() || '').trim() : '';
    const openingScene = document.getElementById('guide_opening_scene')?.value.trim() || '';
    const wordCount = document.getElementById('aiOpeningWordCount')?.value.trim() || '800-1000字';
    const instructions = document.getElementById('aiInstructions')?.value.trim() || AI_OPENING_INSTRUCTIONS_DEFAULT;
    const tropeBlock = (sendTrope && trope) ? `<trope>\n${trope}\n</trope>\n\n` : '';
    const yamlBlock = yamlCard
        ? `<character_card_yaml>\n以下是这个角色当前的人设卡 YAML，请严格参考其中设定来写开场白，避免与既有人设冲突：\n${yamlCard}\n</character_card_yaml>\n\n`
        : '';
    return `${tropeBlock}<XP_core>\n${xpCore}\n</XP_core>\n\n${yamlBlock}<OpeningScene>\n现在，我需要你为这个角色创作故事的开场白：\n${openingScene}\n</OpeningScene>\n\n<WordCount>\n${wordCount}\n</WordCount>\n\n<instructions>\n${instructions}\n</instructions>`;
}

function buildAiMessages() {
    const persona = document.getElementById('aiPersona').value.trim();
    const trope = document.getElementById('aiTrope').value.trim();
    const sendTrope = document.getElementById('sendTropeToAi').checked;
    const includeExistingContent = document.getElementById('includeExistingContentToAi')?.checked;
    const xpCore = document.getElementById('aiXpCore').value.trim();
    const modules = getSelectedModules();
    const openingScene = document.getElementById('guide_opening_scene')?.value.trim() || '';
    const wordCount = document.getElementById('aiOpeningWordCount')?.value.trim() || '800-1000字';
    const instructions = document.getElementById('aiInstructions')?.value.trim() || (isOpeningMode() ? AI_OPENING_INSTRUCTIONS_DEFAULT : AI_PERSONA_CARD_INSTRUCTIONS_DEFAULT);

    const tropeBlock = (sendTrope && trope) ? `<trope>\n${trope}\n</trope>\n\n` : '';
    const systemMsg = `<persona>\n${persona}\n</persona>`;
    let userMsg = '';

    if (isOpeningMode()) {
        const yamlCard = typeof generateYaml === 'function' ? (generateYaml() || '').trim() : '';
        const yamlBlock = yamlCard
            ? `<character_card_yaml>\n以下是这个角色当前的人设卡 YAML，请严格参考其中设定来写开场白，避免与既有人设冲突：\n${yamlCard}\n</character_card_yaml>\n\n`
            : '';
        userMsg = `${tropeBlock}<XP_core>\n${xpCore}\n</XP_core>\n\n${yamlBlock}<OpeningScene>\n现在，我需要你为这个角色创作故事的开场白：\n${openingScene}\n</OpeningScene>\n\n<WordCount>\n${wordCount}\n</WordCount>\n\n<instructions>\n${instructions}\n</instructions>`;
    } else {
        const moduleNames = modules.map(m => MODULE_LABELS[m] || m).join('、');
        const guideTexts = modules.map(m => {
            const guideEl = document.getElementById('guide_' + m);
            const guideText = guideEl ? guideEl.value.trim() : '';
            return guideText ? `【${MODULE_LABELS[m] || m}】${guideText}` : '';
        }).filter(Boolean);
        const selectedSchema = modules.map(m => MODULE_JSON_SCHEMA[m] || '').filter(Boolean);
        const schemaHeader = '请严格按照以下JSON格式回复，不要包含任何其他文字或markdown标记。\n只需填写被请求的模块，其余留空。列表字段提供2-5个条目，描述精炼有层次感。若表单已有部分内容，你需要进行参考并补全要求的内容。';
        const dynamicInstructions = instructions || (schemaHeader + '\n\n{\n' + selectedSchema.join(',\n') + '\n}');
        const existingRef = includeExistingContent ? buildExistingContentForModules(modules) : '';
        const existingBlock = existingRef
            ? `<existing_filled_content>\n以下是表单里已经写好的内容，请优先参考并保持设定一致，在此基础上补全缺失内容：\n${existingRef}\n</existing_filled_content>\n\n`
            : '';
        userMsg = `${tropeBlock}<XP_core>\n${xpCore}\n</XP_core>\n\n<requested_modules>\n${moduleNames}\n</requested_modules>\n\n${existingBlock}<module_guides>\n${guideTexts.join('\n\n')}\n</module_guides>\n\n<instructions>\n${dynamicInstructions}\n</instructions>`;
    }

    return { systemMsg, userMsg, modules };
}

function togglePromptPreview() {
    const preview = document.getElementById('aiPromptPreviewContent');
    const toggle = document.getElementById('promptPreviewToggle');
    if (!preview || !toggle) return;
    if (preview.style.display === 'none') {
        preview.style.display = '';
        toggle.classList.add('open');
        updatePromptPreview();
    } else {
        preview.style.display = 'none';
        toggle.classList.remove('open');
    }
}

function updatePromptPreview() {
    const el = document.getElementById('aiPromptPreviewContent');
    if (!el || el.style.display === 'none') return;
    const { systemMsg, userMsg } = buildAiMessages();
    el.textContent = `[system]\n${systemMsg}\n\n[user]\n${userMsg}`;
}

function pruneEmptyDeep(value) {
    if (Array.isArray(value)) {
        return value
            .map(v => pruneEmptyDeep(v))
            .filter(v => !(v === '' || v === null || v === undefined || (Array.isArray(v) && v.length === 0) || (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)));
    }
    if (value && typeof value === 'object') {
        const out = {};
        Object.entries(value).forEach(([k, v]) => {
            const cleaned = pruneEmptyDeep(v);
            const isEmpty = cleaned === '' || cleaned === null || cleaned === undefined || (Array.isArray(cleaned) && cleaned.length === 0) || (typeof cleaned === 'object' && !Array.isArray(cleaned) && Object.keys(cleaned).length === 0);
            if (!isEmpty) out[k] = cleaned;
        });
        return out;
    }
    return typeof value === 'string' ? value.trim() : value;
}

function buildExistingContentForModules(modules) {
    const f = serializeForm();
    const arr = k => (f[k] || []).map(v => String(v || '').trim()).filter(Boolean);
    const out = {};

    if (modules.includes('basic')) {
        out.basic = { char_name: f.char_name || '', chinese_name: f.chinese_name || '', nickname: f.nickname || '', age: f.age || '', birthday_date: f.birthday_date || '', birthday_zodiac: f.birthday_zodiac || '', gender: f.gender || '', height: f.height || '', identity: arr('identity-container'), archetype: arr('archetype-container'), social: arr('social-container') };
    }
    if (modules.includes('background')) {
        out.background = { childhood_range: f.age_range_childhood || '', childhood: arr('childhood-container'), teenage_range: f.age_range_teenage || '', teenage: arr('teenage-container'), youth_range: f.age_range_youth || '', youth: arr('youth-container'), current_range: f.age_range_current || '', current: arr('current-container') };
    }
    if (modules.includes('appearance')) {
        out.appearance = { hair: f.hair || '', eyes: f.eyes || '', skin: f.skin || '', face_style: f.face_style || '', build: arr('build-container'), attire_formal: f.attire_formal || '', attire_business: f.attire_business || '', attire_casual: f.attire_casual || '', attire_home: f.attire_home || '' };
    }
    if (modules.includes('personality')) {
        out.personality = { core_traits: arr('core-traits-container'), romantic_traits: arr('romantic-traits-container'), weakness: arr('weakness-container'), likes: arr('likes-container'), dislikes: arr('dislikes-container'), goals: arr('goals-container') };
    }
    if (modules.includes('user_relation')) {
        out.user_relation = { past_events: arr('past_events-container'), impression: arr('impression-container'), notes: arr('relation_notes-container') };
    }
    if (modules.includes('behavior')) {
        out.behavior = { lifestyle: arr('lifestyle-container'), work_behaviors: arr('work-container'), emotional_angry: f.emotional_angry || '', emotional_happy: f.emotional_happy || '', emotional_sad: f.emotional_sad || '', boundaries: arr('boundaries-container'), work_skills: arr('work-skills-container'), life_skills: arr('life-skills-container'), hobby_skills: arr('hobby-skills-container') };
    }
    if (modules.includes('speech')) {
        out.speech = { speech_with_user: f.speech_with_user || '', speech_reasoning: f.speech_reasoning || '', speech_accent: f.speech_accent || '', speech_online: f.speech_online || '' };
    }
    if (modules.includes('extra')) {
        out.extra = { additional_notes: f.additional_notes || '', catchphrases: arr('catchphrase-container'), mannerisms: arr('mannerisms-container'), trauma: arr('trauma-container'), values: arr('values-container'), conflicts: arr('conflicts-container'), secrets: arr('secrets-container'), relationships: arr('relationships-container'), defining_moments: arr('defining-moments-container') };
    }
    if (modules.includes('nsfw')) {
        out.nsfw = { experiences: f.nsfw_experiences || '', sexual_orientation: f.nsfw_orientation || '', sexual_role: arr('nsfw-role-container'), sexual_habits: arr('nsfw-habits-container'), kinks: arr('kinks-container'), limits: arr('limits-container') };
    }

    const cleaned = pruneEmptyDeep(out);
    return Object.keys(cleaned).length ? JSON.stringify(cleaned, null, 2) : '';
}

function toggleJsonPreview() {
    const preview = document.getElementById('moduleJsonPreview');
    const toggle = document.getElementById('jsonPreviewToggle');
    if (preview.style.display === 'none') {
        preview.style.display = '';
        toggle.classList.add('open');
        updateModulePreview();
    } else {
        preview.style.display = 'none';
        toggle.classList.remove('open');
    }
}

function updateModulePreview() {
    const el = document.getElementById('moduleJsonPreview');
    if (!el || el.style.display === 'none') return;
    if (isOpeningMode()) {
        el.textContent = buildOpeningPreview();
        return;
    }
    const modules = getSelectedModules();
    if (modules.length === 0) { el.textContent = '（未勾选任何模块）'; return; }
    const header = '请严格按照以下JSON格式回复，不要包含任何其他文字或markdown标记。\n只需填写被请求的模块，其余留空。列表字段提供2-5个条目，描述精炼有层次感。\n\n{\n';
    const lines = modules.map(m => MODULE_JSON_SCHEMA[m] || '').filter(Boolean);
    el.textContent = header + lines.join(',\n') + '\n}';
}

function bindModuleCheckboxes() {
    document.querySelectorAll('input[name="aiModule"]').forEach(cb => {
        cb.addEventListener('change', () => {
            updateModulePreview();
            updatePromptPreview();
        });
    });
}

function bindAiSubTabEvents() {
    document.querySelectorAll('.ai-subtab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const instructionsEl = document.getElementById('aiInstructions');
            const prevTab = getActiveAiSubtab();
            if (instructionsEl) AppState.aiInstructionDrafts[prevTab] = instructionsEl.value;
            document.querySelectorAll('.ai-subtab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.ai-subtab-panel').forEach(panel => panel.classList.remove('active'));
            btn.classList.add('active');
            const panel = document.getElementById('ai-subtab-' + btn.dataset.aiTab);
            if (panel) panel.classList.add('active');
            AppState.aiActiveSubtab = btn.dataset.aiTab;
            updateAiInstructionsByActiveTab();
            syncAiTabUI();
            updateModulePreview();
            updatePromptPreview();
            scheduleCloudConfigSync();
        });
    });

    const instructionsEl = document.getElementById('aiInstructions');
    if (instructionsEl) {
        instructionsEl.addEventListener('input', () => {
            AppState.aiInstructionDrafts[getActiveAiSubtab()] = instructionsEl.value;
            scheduleCloudConfigSync();
            updateModulePreview();
            updatePromptPreview();
        });
    }

    ['guide_opening_scene', 'aiOpeningWordCount', 'aiXpCore'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                if (isOpeningMode()) updateModulePreview();
                updatePromptPreview();
                scheduleCloudConfigSync();
            });
        }
    });

    ['aiPersona', 'aiTrope', 'aiXpCore', 'sendTropeToAi', 'includeExistingContentToAi'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const eventName = el.type === 'checkbox' ? 'change' : 'input';
        el.addEventListener(eventName, updatePromptPreview);
    });

    document.querySelectorAll('[id^="guide_"]').forEach(el => {
        el.addEventListener('input', updatePromptPreview);
    });

    updateAiInstructionsByActiveTab(true);
    syncAiTabUI();
}

function extractJsonFromText(rawText) {
    let cleaned = rawText.trim();
    cleaned = cleaned.replace(/^```(?:json|JSON)?\s*\n?/, '').replace(/\n?\s*```\s*$/, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
        let jsonStr = cleaned.slice(start, end + 1);
        jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1');
        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            console.warn('[JSON整体解析失败，尝试正则逐块提取]', e.message);
        }
    }

    const result = {};
    const moduleKeys = ['basic', 'background', 'appearance', 'personality', 'user_relation', 'behavior', 'speech', 'extra', 'nsfw'];
    for (let i = 0; i < moduleKeys.length; i++) {
        const key = moduleKeys[i];
        const regex = new RegExp(`"${key}"\\s*:\\s*\\{`);
        const match = regex.exec(cleaned);
        if (!match) continue;
        let braceCount = 0;
        const blockStart = match.index + match[0].length - 1;
        let blockEnd = -1;
        for (let j = blockStart; j < cleaned.length; j++) {
            if (cleaned[j] === '{') braceCount++;
            else if (cleaned[j] === '}') {
                braceCount--;
                if (braceCount === 0) { blockEnd = j; break; }
            }
        }
        if (blockEnd > blockStart) {
            let blockStr = cleaned.slice(blockStart, blockEnd + 1);
            blockStr = blockStr.replace(/,\s*([\]}])/g, '$1');
            try { result[key] = JSON.parse(blockStr); } catch (e) { console.warn(`[正则提取模块 ${key} 解析失败]`, e.message); }
        }
    }
    return Object.keys(result).length > 0 ? result : null;
}

function copyRawReply() {
    const content = document.getElementById('aiRawReplyContent').textContent;
    navigator.clipboard.writeText(content).then(() => showToast('📋 已复制AI原始回复'));
}

async function generateWithAI() {
    const baseUrl = document.getElementById('aiBaseUrl').value.trim().replace(/\/+$/, '');
    const apiKey = document.getElementById('aiApiKey').value.trim();
    const xpCore = document.getElementById('aiXpCore').value.trim();
    const { systemMsg, userMsg, modules } = buildAiMessages();
    const useStream = document.getElementById('enableStream').checked;
    const openingScene = document.getElementById('guide_opening_scene')?.value.trim() || '';

    if (!baseUrl) { showToast('请先填写 API 地址'); return; }
    if (!AppState.selectedModel) { showToast('请先获取并选择一个模型'); return; }
    if (!xpCore) { showToast('请填写"这次我想要…"'); return; }
    if (!isOpeningMode() && modules.length === 0) { showToast('请至少勾选一个生成模块'); return; }
    if (isOpeningMode() && !openingScene) { showToast('请填写开场白需求描述'); return; }

    const btn = document.getElementById('btnGenerate');
    btn.disabled = true;
    setAiStatus('⏳ 生成中，请稍候…', '');
    document.getElementById('aiResultSection').style.display = 'none';

    const rawReplySection = document.getElementById('aiRawReplySection');
    rawReplySection.style.display = '';
    const rawReplyContent = document.getElementById('aiRawReplyContent');
    rawReplyContent.textContent = '⏳ 等待AI回复…';

    try {
        if (useStream) await generateStream(baseUrl, apiKey, systemMsg, userMsg, modules, rawReplyContent);
        else await generateNonStream(baseUrl, apiKey, systemMsg, userMsg, modules, rawReplyContent);
    } catch (err) {
        console.error('[AI Generate Error]', err);
        setAiStatus(`❌ 出错：${err.message}`, 'error');
    } finally {
        btn.disabled = false;
        AppState.currentAbortController = null;
    }
}

async function generateNonStream(baseUrl, apiKey, systemMsg, userMsg, modules, rawReplyEl) {
    let res;
    try {
        res = await fetch(`${baseUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: AppState.selectedModel,
                messages: [{ role: 'system', content: systemMsg }, { role: 'user', content: userMsg }],
                temperature: 0.85,
                stream: false
            })
        });
    } catch (fetchErr) {
        throw new Error(`网络请求失败：${fetchErr.message}`);
    }
    if (!res.ok) {
        let errBody = '';
        try { errBody = await res.text(); } catch (_) {}
        throw new Error(`HTTP ${res.status} — ${(errBody || '').slice(0, 500)}`);
    }
    let data;
    try { data = await res.json(); } catch (jsonErr) { throw new Error(`非JSON响应: ${jsonErr.message}`); }
    const raw = data.choices?.[0]?.message?.content || '';
    if (!raw) throw new Error('API返回的choices为空');
    rawReplyEl.textContent = raw;
    processAiResult(raw, modules);
}

async function generateStream(baseUrl, apiKey, systemMsg, userMsg, modules, rawReplyEl) {
    AppState.currentAbortController = new AbortController();
    let res;
    try {
        res = await fetch(`${baseUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: AppState.selectedModel,
                messages: [{ role: 'system', content: systemMsg }, { role: 'user', content: userMsg }],
                temperature: 0.85,
                stream: true
            }),
            signal: AppState.currentAbortController.signal
        });
    } catch (fetchErr) {
        if (fetchErr.name === 'AbortError') { setAiStatus('⚠️ 已中断', ''); return; }
        throw new Error(`网络请求失败：${fetchErr.message}`);
    }
    if (!res.ok) {
        let errBody = '';
        try { errBody = await res.text(); } catch (_) {}
        throw new Error(`HTTP ${res.status} — ${(errBody || '').slice(0, 500)}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';
    rawReplyEl.textContent = '';
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data:')) continue;
                const dataStr = trimmed.slice(5).trim();
                if (dataStr === '[DONE]') continue;
                try {
                    const chunk = JSON.parse(dataStr);
                    const delta = chunk.choices?.[0]?.delta?.content || '';
                    if (delta) {
                        fullText += delta;
                        rawReplyEl.textContent = fullText;
                        rawReplyEl.scrollTop = rawReplyEl.scrollHeight;
                    }
                } catch (e) {}
            }
        }
    } catch (err) {
        if (err.name === 'AbortError') setAiStatus('⚠️ 已中断，已接收到的内容已显示', '');
        else console.warn('[Stream read error]', err);
    }
    if (fullText) {
        rawReplyEl.textContent = fullText;
        processAiResult(fullText, modules);
    } else {
        setAiStatus('⚠️ 未收到任何内容', 'error');
    }
}

function processAiResult(raw, modules) {
    if (isOpeningMode()) {
        AppState.aiLastJson = null;
        showAiResult(raw, []);
        setAiStatus('✅ 开场白生成成功！', 'success');
        return;
    }
    AppState.aiLastJson = extractJsonFromText(raw);
    if (AppState.aiLastJson) {
        showAiResult(raw, modules);
        setAiStatus('✅ 生成成功！确认后点击"填入表单"', 'success');
    } else {
        showAiResult(raw, modules);
        setAiStatus('⚠️ 无法自动解析JSON，但原始内容已显示。你可以手动复制修正。', 'error');
    }
}

function setAiStatus(text, cls) {
    const el = document.getElementById('aiStatusText');
    el.textContent = text;
    el.className = 'ai-status-text' + (cls ? ' ' + cls : '');
}

function showAiResult(raw, modules) {
    const section = document.getElementById('aiResultSection');
    section.style.display = '';
    const badges = document.getElementById('aiFillBadges');
    badges.innerHTML = (modules || []).length
        ? modules.map(m => `<span class="ai-fill-badge">${MODULE_LABELS[m] || m}</span>`).join('')
        : (isOpeningMode() ? '<span class="ai-fill-badge">开场白</span>' : '');
    document.getElementById('aiRawResult').textContent = raw;
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function fillFormFromAI() {
    if (!AppState.aiLastJson) { showToast('还没有可填入的 AI 结果'); return; }
    const d = AppState.aiLastJson;
    const filled = [];
    function setVal(id, val) {
        const el = document.getElementById(id);
        if (el && val !== undefined && val !== null && val !== '') el.value = val;
    }
    function fillArray(containerId, cls, values, isTextarea) {
        if (!values || !values.length) return;
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        values.forEach(v => {
            if (!v) return;
            const div = document.createElement('div');
            div.className = 'array-item';
            const el = document.createElement(isTextarea ? 'textarea' : 'input');
            if (!isTextarea) el.type = 'text';
            el.className = cls;
            el.value = v;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-remove';
            btn.textContent = '✕';
            btn.onclick = function() { removeArrayItem(this); };
            div.appendChild(el);
            div.appendChild(btn);
            container.appendChild(div);
        });
    }

    if (d.basic) {
        setVal('char_name', d.basic.char_name); setVal('chinese_name', d.basic.chinese_name); setVal('nickname', d.basic.nickname); setVal('age', d.basic.age); setVal('birthday_date', d.basic.birthday_date); setVal('birthday_zodiac', d.basic.birthday_zodiac); setVal('gender', d.basic.gender); setVal('height', d.basic.height);
        fillArray('identity-container', 'identity-item', d.basic.identity, false);
        fillArray('archetype-container', 'archetype-item', d.basic.archetype, false);
        fillArray('social-container', 'social-item', d.basic.social, false);
        filled.push('基础信息');
    }
    if (d.background) {
        setVal('age_range_childhood', d.background.childhood_range); setVal('age_range_teenage', d.background.teenage_range); setVal('age_range_youth', d.background.youth_range); setVal('age_range_current', d.background.current_range);
        fillArray('childhood-container', 'childhood-item', d.background.childhood, true);
        fillArray('teenage-container', 'teenage-item', d.background.teenage, true);
        fillArray('youth-container', 'youth-item', d.background.youth, true);
        fillArray('current-container', 'current-item', d.background.current, true);
        filled.push('背景故事');
    }
    if (d.appearance) {
        setVal('hair', d.appearance.hair); setVal('eyes', d.appearance.eyes); setVal('skin', d.appearance.skin); setVal('face_style', d.appearance.face_style); setVal('attire_formal', d.appearance.attire_formal); setVal('attire_business', d.appearance.attire_business); setVal('attire_casual', d.appearance.attire_casual); setVal('attire_home', d.appearance.attire_home);
        fillArray('build-container', 'build-item', d.appearance.build, false);
        filled.push('外貌穿着');
    }
    if (d.personality) {
        fillArray('core-traits-container', 'core-traits-item', d.personality.core_traits, false);
        fillArray('romantic-traits-container', 'romantic-traits-item', d.personality.romantic_traits, false);
        fillArray('weakness-container', 'weakness-item', d.personality.weakness, false);
        fillArray('likes-container', 'likes-item', d.personality.likes, false);
        fillArray('dislikes-container', 'dislikes-item', d.personality.dislikes, false);
        fillArray('goals-container', 'goals-item', d.personality.goals, false);
        filled.push('性格特质');
    }
    if (d.user_relation) {
        fillArray('past_events-container', 'past_events-item', d.user_relation.past_events, true);
        fillArray('impression-container', 'impression-item', d.user_relation.impression, true);
        fillArray('relation_notes-container', 'relation_notes-item', d.user_relation.notes, true);
        filled.push('{{user}}相关');
    }
    if (d.behavior) {
        fillArray('lifestyle-container', 'lifestyle-item', d.behavior.lifestyle, true);
        fillArray('work-container', 'work-item', d.behavior.work_behaviors, true);
        fillArray('boundaries-container', 'boundaries-item', d.behavior.boundaries, true);
        fillArray('work-skills-container', 'work-skills-item', d.behavior.work_skills, false);
        fillArray('life-skills-container', 'life-skills-item', d.behavior.life_skills, false);
        fillArray('hobby-skills-container', 'hobby-skills-item', d.behavior.hobby_skills, false);
        setVal('emotional_angry', d.behavior.emotional_angry); setVal('emotional_happy', d.behavior.emotional_happy); setVal('emotional_sad', d.behavior.emotional_sad);
        filled.push('行为习惯');
    }
    if (d.speech) {
        setVal('speech_with_user', d.speech.speech_with_user); setVal('speech_reasoning', d.speech.speech_reasoning); setVal('speech_accent', d.speech.speech_accent); setVal('speech_online', d.speech.speech_online);
        filled.push('说话风格');
    }
    if (d.extra) {
        setVal('additional_notes', d.extra.additional_notes);
        fillArray('catchphrase-container', 'catchphrase-item', d.extra.catchphrases, false);
        fillArray('mannerisms-container', 'mannerisms-item', d.extra.mannerisms, false);
        fillArray('trauma-container', 'trauma-item', d.extra.trauma, true);
        fillArray('values-container', 'values-item', d.extra.values, false);
        fillArray('conflicts-container', 'conflicts-item', d.extra.conflicts, true);
        fillArray('secrets-container', 'secrets-item', d.extra.secrets, true);
        fillArray('relationships-container', 'relationships-item', d.extra.relationships, true);
        fillArray('defining-moments-container', 'defining-moments-item', d.extra.defining_moments, true);
        filled.push('额外补充');
    }
    if (d.nsfw) {
        setVal('nsfw_experiences', d.nsfw.experiences); setVal('nsfw_orientation', d.nsfw.sexual_orientation);
        fillArray('nsfw-role-container', 'nsfw-role-item', d.nsfw.sexual_role, true);
        fillArray('nsfw-habits-container', 'nsfw-habits-item', d.nsfw.sexual_habits, true);
        fillArray('kinks-container', 'kinks-item', d.nsfw.kinks, false);
        fillArray('limits-container', 'limits-item', d.nsfw.limits, false);
        filled.push('🔞 NSFW信息');
    }

    triggerAutoSave();
    showToast(`✨ 已填入：${filled.join('、')}`);
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tab="basic"]').classList.add('active');
    document.getElementById('tab-basic').classList.add('active');
}