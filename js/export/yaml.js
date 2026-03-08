// ============================================================
//  YAML 导出 / 预览 / 清空
// ============================================================
function escapeYaml(str) {
    if (!str) return str;
    if (str.includes(':') || str.includes('#') || str.includes("'") || str.includes('"') || str.startsWith(' ') || str.endsWith(' ')) {
        return '"' + str.replace(/"/g, '\\"') + '"';
    }
    return str;
}

function getArrayValues(containerId, className) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    return Array.from(container.querySelectorAll('.' + className)).map(el => el.value.trim()).filter(v => v);
}

function generateYaml() {
    const indent = '  ';
    let yaml = '<info>\n<character>\n```yaml\n';
    const v = id => (document.getElementById(id)?.value || '').trim();

    const charName = v('char_name'), chineseName = v('chinese_name'), nickname = v('nickname');
    const age = v('age'), bDate = v('birthday_date'), bZodiac = v('birthday_zodiac');
    const gender = v('gender'), height = v('height');
    const hair = v('hair'), eyes = v('eyes'), skin = v('skin'), faceStyle = v('face_style');
    const attireFormal = v('attire_formal'), attireBusiness = v('attire_business');
    const attireCasual = v('attire_casual'), attireHome = v('attire_home');
    const emotionalAngry = v('emotional_angry'), emotionalHappy = v('emotional_happy'), emotionalSad = v('emotional_sad');
    const speechWithUser = v('speech_with_user'), speechReasoning = v('speech_reasoning');
    const speechAccent = v('speech_accent'), speechOnline = v('speech_online');
    const additionalNotes = v('additional_notes');
    const nsfwExperiences = v('nsfw_experiences'), nsfwOrientation = v('nsfw_orientation');

    const identities = getArrayValues('identity-container', 'identity-item');
    const archetypes = getArrayValues('archetype-container', 'archetype-item');
    const social = getArrayValues('social-container', 'social-item');
    const childhood = getArrayValues('childhood-container', 'childhood-item');
    const teenage = getArrayValues('teenage-container', 'teenage-item');
    const youth = getArrayValues('youth-container', 'youth-item');
    const current = getArrayValues('current-container', 'current-item');
    const build = getArrayValues('build-container', 'build-item');
    const coreTraits = getArrayValues('core-traits-container', 'core-traits-item');
    const romanticTraits = getArrayValues('romantic-traits-container', 'romantic-traits-item');
    const weakness = getArrayValues('weakness-container', 'weakness-item');
    const likes = getArrayValues('likes-container', 'likes-item');
    const dislikes = getArrayValues('dislikes-container', 'dislikes-item');
    const goals = getArrayValues('goals-container', 'goals-item');
    const userPast = getArrayValues('past_events-container', 'past_events-item');
    const userImpression = getArrayValues('impression-container', 'impression-item');
    const userNotes = getArrayValues('relation_notes-container', 'relation_notes-item');
    const lifestyle = getArrayValues('lifestyle-container', 'lifestyle-item');
    const workBehaviors = getArrayValues('work-container', 'work-item');
    const boundaries = getArrayValues('boundaries-container', 'boundaries-item');
    const workSkills = getArrayValues('work-skills-container', 'work-skills-item');
    const lifeSkills = getArrayValues('life-skills-container', 'life-skills-item');
    const hobbySkills = getArrayValues('hobby-skills-container', 'hobby-skills-item');
    const catchphrases = getArrayValues('catchphrase-container', 'catchphrase-item');
    const mannerisms = getArrayValues('mannerisms-container', 'mannerisms-item');
    const trauma = getArrayValues('trauma-container', 'trauma-item');
    const values = getArrayValues('values-container', 'values-item');
    const conflicts = getArrayValues('conflicts-container', 'conflicts-item');
    const secrets = getArrayValues('secrets-container', 'secrets-item');
    const relationships = getArrayValues('relationships-container', 'relationships-item');
    const definingMoments = getArrayValues('defining-moments-container', 'defining-moments-item');
    const nsfwRole = getArrayValues('nsfw-role-container', 'nsfw-role-item');
    const nsfwHabits = getArrayValues('nsfw-habits-container', 'nsfw-habits-item');
    const kinks = getArrayValues('kinks-container', 'kinks-item');
    const limits = getArrayValues('limits-container', 'limits-item');

    if (charName) yaml += `name: ${escapeYaml(charName)}\n`;
    if (chineseName) yaml += `chinese_name: ${escapeYaml(chineseName)}\n`;
    if (nickname) yaml += `nickname: ${escapeYaml(nickname)}\n`;
    if (age) yaml += `age: ${escapeYaml(age)}\n`;
    if (bDate || bZodiac) {
        yaml += `birthday:\n`;
        if (bDate) yaml += `${indent}date: ${escapeYaml(bDate)}\n`;
        if (bZodiac) yaml += `${indent}zodiac: ${escapeYaml(bZodiac)}\n`;
    }
    if (gender) yaml += `gender: ${escapeYaml(gender)}\n`;
    if (height) yaml += `height: ${escapeYaml(height)}\n`;
    if (identities.length) { yaml += `identity:\n`; identities.forEach(i => yaml += `${indent}- ${escapeYaml(i)}\n`); }
    if (social.length) { yaml += `social_status:\n`; social.forEach(i => yaml += `${indent}- ${escapeYaml(i)}\n`); }

    const bgAge = { childhood: v('age_range_childhood'), teenage: v('age_range_teenage'), youth: v('age_range_youth'), current: v('age_range_current') };
    if (childhood.length || teenage.length || youth.length || current.length) {
        yaml += `background:\n`;
        if (childhood.length) { yaml += `${indent}childhood${bgAge.childhood ? ' (' + bgAge.childhood + ')' : ''}:\n`; childhood.forEach(i => yaml += `${indent}${indent}- ${escapeYaml(i)}\n`); }
        if (teenage.length) { yaml += `${indent}teenage${bgAge.teenage ? ' (' + bgAge.teenage + ')' : ''}:\n`; teenage.forEach(i => yaml += `${indent}${indent}- ${escapeYaml(i)}\n`); }
        if (youth.length) { yaml += `${indent}youth${bgAge.youth ? ' (' + bgAge.youth + ')' : ''}:\n`; youth.forEach(i => yaml += `${indent}${indent}- ${escapeYaml(i)}\n`); }
        if (current.length) { yaml += `${indent}current${bgAge.current ? ' (' + bgAge.current + ')' : ''}:\n`; current.forEach(i => yaml += `${indent}${indent}- ${escapeYaml(i)}\n`); }
    }

    if (hair || eyes || skin || faceStyle || build.length) {
        yaml += `appearance:\n`;
        if (hair) yaml += `${indent}hair: ${escapeYaml(hair)}\n`;
        if (eyes) yaml += `${indent}eyes: ${escapeYaml(eyes)}\n`;
        if (skin) yaml += `${indent}skin: ${escapeYaml(skin)}\n`;
        if (faceStyle) yaml += `${indent}face_style: ${escapeYaml(faceStyle)}\n`;
        if (build.length) { yaml += `${indent}build:\n`; build.forEach(i => yaml += `${indent}${indent}- ${escapeYaml(i)}\n`); }
    }

    if (attireFormal || attireBusiness || attireCasual || attireHome) {
        yaml += `attire:\n`;
        if (attireFormal) yaml += `${indent}business_formal: ${escapeYaml(attireFormal)}\n`;
        if (attireBusiness) yaml += `${indent}business_casual: ${escapeYaml(attireBusiness)}\n`;
        if (attireCasual) yaml += `${indent}casual_wear: ${escapeYaml(attireCasual)}\n`;
        if (attireHome) yaml += `${indent}home_wear: ${escapeYaml(attireHome)}\n`;
    }

    if (archetypes.length) { yaml += `archetype:\n`; archetypes.forEach(i => yaml += `${indent}- ${escapeYaml(i)}\n`); }
    if (coreTraits.length || romanticTraits.length) {
        yaml += `personality:\n`;
        if (coreTraits.length) { yaml += `${indent}core_traits:\n`; coreTraits.forEach(i => yaml += `${indent}${indent}- ${escapeYaml(i)}\n`); }
        if (romanticTraits.length) { yaml += `${indent}romantic_traits:\n`; romanticTraits.forEach(i => yaml += `${indent}${indent}- ${escapeYaml(i)}\n`); }
    }
    if (userPast.length || userImpression.length || userNotes.length) {
        yaml += `relationship_with_user:\n`;
        if (userPast.length) { yaml += `${indent}past_events:\n`; userPast.forEach(i => yaml += `${indent}${indent}- ${escapeYaml(i)}\n`); }
        if (userImpression.length) { yaml += `${indent}impression:\n`; userImpression.forEach(i => yaml += `${indent}${indent}- ${escapeYaml(i)}\n`); }
        if (userNotes.length) { yaml += `${indent}notes:\n`; userNotes.forEach(i => yaml += `${indent}${indent}- ${escapeYaml(i)}\n`); }
    }
    if (lifestyle.length) { yaml += `lifestyle_behaviors:\n`; lifestyle.forEach(i => yaml += `${indent}- ${escapeYaml(i)}\n`); }
    if (workBehaviors.length) { yaml += `work_behaviors:\n`; workBehaviors.forEach(i => yaml += `${indent}- ${escapeYaml(i)}\n`); }
    if (emotionalAngry || emotionalHappy || emotionalSad) {
        yaml += `emotional_behaviors:\n`;
        if (emotionalAngry) yaml += `${indent}angry: ${escapeYaml(emotionalAngry)}\n`;
        if (emotionalHappy) yaml += `${indent}happy: ${escapeYaml(emotionalHappy)}\n`;
        if (emotionalSad) yaml += `${indent}sad: ${escapeYaml(emotionalSad)}\n`;
    }
    if (boundaries.length) { yaml += `relationship_boundaries:\n`; boundaries.forEach(i => yaml += `${indent}- ${escapeYaml(i)}\n`); }
    if (speechWithUser || speechReasoning || speechAccent || speechOnline) {
        yaml += `speech_style:\n`;
        if (speechWithUser) yaml += `${indent}with_user: ${escapeYaml(speechWithUser)}\n`;
        if (speechReasoning) yaml += `${indent}reasoning: ${escapeYaml(speechReasoning)}\n`;
        if (speechAccent) yaml += `${indent}accent: ${escapeYaml(speechAccent)}\n`;
        if (speechOnline) yaml += `${indent}online_chatting_style: ${escapeYaml(speechOnline)}\n`;
    }
    if (goals.length) { yaml += `goals:\n`; goals.forEach(i => yaml += `${indent}- ${escapeYaml(i)}\n`); }
    if (weakness.length) { yaml += `weakness:\n`; weakness.forEach(i => yaml += `${indent}- ${escapeYaml(i)}\n`); }
    if (likes.length) { yaml += `likes:\n`; likes.forEach(i => yaml += `${indent}- ${escapeYaml(i)}\n`); }
    if (dislikes.length) { yaml += `dislikes:\n`; dislikes.forEach(i => yaml += `${indent}- ${escapeYaml(i)}\n`); }
    if (workSkills.length || lifeSkills.length || hobbySkills.length) {
        yaml += `skills:\n`;
        if (workSkills.length) { yaml += `${indent}工作:\n`; workSkills.forEach(i => yaml += `${indent}${indent}- ${escapeYaml(i)}\n`); }
        if (lifeSkills.length) { yaml += `${indent}生活:\n`; lifeSkills.forEach(i => yaml += `${indent}${indent}- ${escapeYaml(i)}\n`); }
        if (hobbySkills.length) { yaml += `${indent}爱好:\n`; hobbySkills.forEach(i => yaml += `${indent}${indent}- ${escapeYaml(i)}\n`); }
    }

    const extraFields = [
        { data: catchphrases, key: 'catchphrases' }, { data: mannerisms, key: 'mannerisms' },
        { data: trauma, key: 'psychological_trauma' }, { data: values, key: 'core_values' },
        { data: conflicts, key: 'inner_conflicts' }, { data: secrets, key: 'secrets' },
        { data: relationships, key: 'important_relationships' }, { data: definingMoments, key: 'defining_moments' },
    ];
    extraFields.forEach(f => {
        if (f.data.length) { yaml += `${f.key}:\n`; f.data.forEach(i => yaml += `${indent}- ${escapeYaml(i)}\n`); }
    });

    if (nsfwExperiences || nsfwOrientation || nsfwRole.length || nsfwHabits.length || kinks.length || limits.length) {
        yaml += `NSFW_information:\n`;
        if (nsfwExperiences || nsfwOrientation || nsfwRole.length || nsfwHabits.length) {
            yaml += `${indent}Sex_related_traits:\n`;
            if (nsfwExperiences) yaml += `${indent}${indent}experiences: ${escapeYaml(nsfwExperiences)}\n`;
            if (nsfwOrientation) yaml += `${indent}${indent}sexual_orientation: ${escapeYaml(nsfwOrientation)}\n`;
            if (nsfwRole.length) { yaml += `${indent}${indent}sexual_role:\n`; nsfwRole.forEach(i => yaml += `${indent}${indent}${indent}- ${escapeYaml(i)}\n`); }
            if (nsfwHabits.length) { yaml += `${indent}${indent}sexual_habits:\n`; nsfwHabits.forEach(i => yaml += `${indent}${indent}${indent}- ${escapeYaml(i)}\n`); }
        }
        if (kinks.length) { yaml += `${indent}Kinks:\n`; kinks.forEach(i => yaml += `${indent}${indent}- ${escapeYaml(i)}\n`); }
        if (limits.length) { yaml += `${indent}Limits:\n`; limits.forEach(i => yaml += `${indent}${indent}- ${escapeYaml(i)}\n`); }
    }

    yaml += '```\n</character>\n</info>';
    if (additionalNotes) yaml += '\n\n' + additionalNotes;
    const alias = v('replace_alias');
    if (alias) yaml = yaml.split(alias).join('{{user}}');
    return yaml;
}

function previewYaml() {
    document.getElementById('yamlPreview').textContent = generateYaml();
    document.getElementById('previewModal').classList.add('active');
}

function closeModal() { document.getElementById('previewModal').classList.remove('active'); }

function exportYaml() {
    navigator.clipboard.writeText(generateYaml()).then(() => showToast('✅ 已复制到剪贴板！')).catch(() => alert('复制失败'));
}

function clearForm() {
    if (confirm('确定清空当前角色的所有内容吗？')) {
        clearFormFields();
        triggerAutoSave();
    }
}