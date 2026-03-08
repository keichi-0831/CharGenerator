// ============================================================
//  角色管理 / 表单 / 自动保存 / Tabs
// ============================================================
function getChars() {
    try { return JSON.parse(localStorage.getItem(LS_CHARS)) || {}; } catch (e) { return {}; }
}

function saveChars(chars) { localStorage.setItem(LS_CHARS, JSON.stringify(chars)); }
function getCurrentId() { return localStorage.getItem(LS_CURRENT) || null; }
function setCurrentId(id) { localStorage.setItem(LS_CURRENT, id); }
function generateId() { return 'char_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6); }

function initCharSystem() {
    let chars = getChars();
    let currentId = getCurrentId();
    if (Object.keys(chars).length === 0) {
        const id = generateId();
        chars[id] = { name: '角色一', data: {} };
        saveChars(chars);
        currentId = id;
        setCurrentId(id);
    }
    if (!chars[currentId]) {
        currentId = Object.keys(chars)[0];
        setCurrentId(currentId);
    }
    renderCharSelect(chars, currentId);
    loadCharacter(currentId);
}

function renderCharSelect(chars, currentId) {
    const sel = document.getElementById('charSelect');
    sel.innerHTML = '';
    Object.entries(chars).forEach(([id, c]) => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = c.name;
        if (id === currentId) opt.selected = true;
        sel.appendChild(opt);
    });
}

function switchCharacter(newId) {
    const oldId = getCurrentId();
    if (oldId) saveCurrentCharData(oldId);
    setCurrentId(newId);
    loadCharacter(newId);
    scheduleCloudConfigSync();
}

function newCharacter() {
    const name = prompt('新角色名称：', '新角色');
    if (!name) return;
    const oldId = getCurrentId();
    if (oldId) saveCurrentCharData(oldId);
    const chars = getChars();
    const id = generateId();
    chars[id] = { name: name.trim(), data: {} };
    saveChars(chars);
    setCurrentId(id);
    renderCharSelect(chars, id);
    clearFormFields();
    scheduleCloudConfigSync();
    showToast('✨ 已新建角色：' + name);
}

function renameCharacter() {
    const id = getCurrentId();
    if (!id) return;
    const chars = getChars();
    const oldName = chars[id]?.name || '';
    const name = prompt('重命名角色：', oldName);
    if (!name || name.trim() === oldName) return;
    chars[id].name = name.trim();
    saveChars(chars);
    renderCharSelect(chars, id);
    showToast('✏️ 已重命名为：' + name.trim());
}

function deleteCharacter() {
    const id = getCurrentId();
    if (!id) return;
    const chars = getChars();
    if (Object.keys(chars).length <= 1) { alert('至少保留一个角色！'); return; }
    if (!confirm(`确定删除角色「${chars[id]?.name}」吗？此操作不可撤销。`)) return;
    delete chars[id];
    saveChars(chars);
    const newId = Object.keys(chars)[0];
    setCurrentId(newId);
    renderCharSelect(chars, newId);
    loadCharacter(newId);
    scheduleCloudConfigSync();
    showToast('🗑️ 角色已删除');
}

function serializeForm() {
    const data = {};
    SIMPLE_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) data[id] = el.value;
    });
    ARRAY_DEFS.forEach(([cid, cls]) => {
        const container = document.getElementById(cid);
        if (container) {
            data[cid] = Array.from(container.querySelectorAll('.' + cls)).map(el => el.value);
        }
    });
    return data;
}

function deserializeForm(data) {
    if (!data) { clearFormFields(); return; }
    SIMPLE_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el && data[id] !== undefined) el.value = data[id];
    });
    ARRAY_DEFS.forEach(([cid, cls, isTextarea]) => {
        const container = document.getElementById(cid);
        if (!container) return;
        let values = data[cid];
        if (!values || values.length === 0) values = [''];
        container.innerHTML = '';
        values.forEach(val => {
            const div = document.createElement('div');
            div.className = 'array-item';
            if (isTextarea) {
                const ta = document.createElement('textarea');
                ta.className = cls;
                ta.value = val;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn btn-remove';
                btn.textContent = '✕';
                btn.onclick = function() { removeArrayItem(this); };
                div.appendChild(ta);
                div.appendChild(btn);
            } else {
                const inp = document.createElement('input');
                inp.type = 'text';
                inp.className = cls;
                inp.value = val;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn btn-remove';
                btn.textContent = '✕';
                btn.onclick = function() { removeArrayItem(this); };
                div.appendChild(inp);
                div.appendChild(btn);
            }
            container.appendChild(div);
        });
    });
}

function clearFormFields() {
    SIMPLE_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el && id !== 'replace_target') el.value = '';
    });
    ARRAY_DEFS.forEach(([cid, cls, isTextarea]) => {
        const container = document.getElementById(cid);
        if (!container) return;
        container.innerHTML = '';
        const div = document.createElement('div');
        div.className = 'array-item';
        if (isTextarea) {
            div.innerHTML = `<textarea class="${cls}"></textarea><button type="button" class="btn btn-remove" onclick="removeArrayItem(this)">✕</button>`;
        } else {
            div.innerHTML = `<input type="text" class="${cls}"><button type="button" class="btn btn-remove" onclick="removeArrayItem(this)">✕</button>`;
        }
        container.appendChild(div);
    });
}

function saveCurrentCharData(id) {
    if (!id) return;
    const chars = getChars();
    if (!chars[id]) return;
    chars[id].data = serializeForm();
    saveChars(chars);
}

function loadCharacter(id) {
    const chars = getChars();
    const charData = chars[id]?.data || {};
    deserializeForm(charData);
    setSaveStatus('saved');
}

function triggerAutoSave() {
    setSaveStatus('saving');
    clearTimeout(AppState.saveTimer);
    AppState.saveTimer = setTimeout(() => {
        const id = getCurrentId();
        if (id) {
            saveCurrentCharData(id);
            scheduleCloudConfigSync();
        }
        setSaveStatus('saved');
    }, 900);
}

function setSaveStatus(state) {
    const el = document.getElementById('saveStatus');
    const text = document.getElementById('saveText');
    el.className = 'save-status ' + state;
    if (state === 'saving') text.textContent = '保存中…';
    else if (state === 'saved') text.textContent = '已自动保存';
    else text.textContent = '等待编辑';
}

function addArrayItem(containerId, className) {
    const container = document.getElementById(containerId);
    const div = document.createElement('div');
    div.className = 'array-item';
    div.innerHTML = `<input type="text" class="${className}"><button type="button" class="btn btn-remove" onclick="removeArrayItem(this)">✕</button>`;
    container.appendChild(div);
    div.querySelector('input').focus();
}

function addTextareaItem(containerId, className) {
    const container = document.getElementById(containerId);
    const div = document.createElement('div');
    div.className = 'array-item';
    div.innerHTML = `<textarea class="${className}"></textarea><button type="button" class="btn btn-remove" onclick="removeArrayItem(this)">✕</button>`;
    container.appendChild(div);
    div.querySelector('textarea').focus();
}

function removeArrayItem(btn) {
    const container = btn.parentElement.parentElement;
    if (container.querySelectorAll('.array-item').length > 1) {
        btn.parentElement.remove();
    } else {
        btn.parentElement.querySelector('input, textarea').value = '';
    }
    triggerAutoSave();
}

function bindTabEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        });
    });
}

function bindCharacterFormAutoSave() {
    document.getElementById('characterForm').addEventListener('input', triggerAutoSave);
    document.getElementById('characterForm').addEventListener('change', triggerAutoSave);
}