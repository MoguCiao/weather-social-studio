'use strict';

const calendarPlatformNames = ['TikTok','Instagram','Facebook','YouTube','X','Threads','LinkedIn'];
const calendarPlatformMarks = {TikTok:'♪',Instagram:'◎',Facebook:'f',YouTube:'▶',X:'𝕏',Threads:'@',LinkedIn:'in'};
const calendarPlatformColors = {TikTok:'#29394f',Instagram:'#c876aa',Facebook:'#6a9de6',YouTube:'#e3938d',X:'#6f7d91',Threads:'#8993a3',LinkedIn:'#79a1bd'};
let calendarUI = {week:calendarWeekStart(calendarToday()),view:'week',platform:'all',status:'all'};
let pendingCalendarTask = null;
let lastCalendarRemoval = null;
let calendarRemovalTimer;

function calendarToday() { return new Date(Date.now()+28800000).toISOString().slice(0,10); }
function calendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value ? date : null;
}
function calendarShift(value, amount) {
  const date = calendarDate(value) || calendarDate(calendarToday());
  date.setUTCDate(date.getUTCDate()+amount);
  return date.toISOString().slice(0,10);
}
function calendarWeekStart(value) {
  const date = calendarDate(value) || calendarDate(calendarToday());
  return calendarShift(date.toISOString().slice(0,10), -(date.getUTCDay()+6)%7);
}
function calendarFormatDate(value, options={month:'short',day:'numeric'}) {
  const date = calendarDate(value);
  return date ? new Intl.DateTimeFormat('en-US',{...options,timeZone:'UTC'}).format(date) : value;
}
function calendarWeekLabel() {
  const end = calendarShift(calendarUI.week,6);
  const first = calendarDate(calendarUI.week), last = calendarDate(end);
  if (first.getUTCFullYear() !== last.getUTCFullYear()) return `${calendarFormatDate(calendarUI.week,{month:'short',day:'numeric',year:'numeric'})} – ${calendarFormatDate(end,{month:'short',day:'numeric',year:'numeric'})}`;
  if (first.getUTCMonth() !== last.getUTCMonth()) return `${calendarFormatDate(calendarUI.week)} – ${calendarFormatDate(end,{month:'short',day:'numeric',year:'numeric'})}`;
  return `${calendarFormatDate(calendarUI.week)} – ${last.getUTCDate()}, ${last.getUTCFullYear()}`;
}
function calendarTime(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value || '');
  if (!match) return 'Time to be set';
  const hour = Number(match[1]);
  return `${hour%12 || 12}:${match[2]} ${hour<12?'AM':'PM'}`;
}
function calendarStatus(record) { return record.status === 'draft' ? 'draft' : 'scheduled'; }
function calendarRecords() { return Array.isArray(state.records) ? state.records : []; }
function calendarWeekRecords(filtered=true) {
  const end = calendarShift(calendarUI.week,7);
  return calendarRecords().filter(record => calendarDate(record.date) && record.date>=calendarUI.week && record.date<end
    && (!filtered || calendarUI.platform==='all' || record.platforms?.includes(calendarUI.platform))
    && (!filtered || calendarUI.status==='all' || calendarStatus(record)===calendarUI.status))
    .sort((a,b)=>`${a.date} ${a.time || ''}`.localeCompare(`${b.date} ${b.time || ''}`));
}
function calendarPlatformChip(platform, small=false) {
  return `<span class="cal-platform ${small?'cal-platform-small':''}" title="${esc(platform)}"><span class="cal-platform-mark" style="--platform-color:${calendarPlatformColors[platform] || '#8b99af'}" aria-hidden="true">${esc(calendarPlatformMarks[platform] || '•')}</span>${small?'':`<span>${esc(platform)}</span>`}</span>`;
}
function calendarSaveButton() {
  return `<button type="button" class="secondary-btn calendar-save-button" data-calendar-action="save-current">${icon('calendar')}Save to Calendar</button>`;
}
function calendarPostCard(record) {
  const platforms = Array.isArray(record.platforms) ? record.platforms : [];
  const status = calendarStatus(record);
  return `<button type="button" class="cal-post" data-calendar-action="view-task" data-id="${esc(record.id)}" style="--post-accent:${calendarPlatformColors[platforms[0]] || '#9cabcf'}" aria-label="View ${esc(record.title)} on ${esc(record.date)} at ${esc(record.time || '')}">
    <span class="cal-post-top"><span class="cal-post-time">${icon('clock')}${esc(calendarTime(record.time))}</span><span class="cal-state-dot ${status}" title="${status==='draft'?'Draft':'Scheduled'}"></span></span>
    <span class="cal-post-content">${record.image?`<img src="${img(record.image)}" alt="" loading="lazy">`:`<span class="cal-post-placeholder">${icon('text')}</span>`}<strong>${esc(record.title || 'Untitled story')}</strong></span>
    <span class="cal-post-bottom"><span class="cal-post-platforms">${platforms.slice(0,3).map(p=>calendarPlatformChip(p,true)).join('')}${platforms.length>3?`<span class="cal-more-platforms">+${platforms.length-3}</span>`:''}</span><span class="cal-post-status ${status}">${status==='draft'?'Draft':'Scheduled'}</span></span>
  </button>`;
}
function calendarWeekGrid(records) {
  const today = calendarToday();
  return `<div class="cal-week-scroll" tabindex="0" aria-label="Weekly publishing calendar. Scroll horizontally to see all seven days."><div class="cal-week-grid">${Array.from({length:7},(_,index)=>{
    const date = calendarShift(calendarUI.week,index);
    const tasks = records.filter(record=>record.date===date);
    return `<section class="cal-day ${date===today?'is-today':''} ${index>4?'is-weekend':''}" aria-label="${esc(calendarFormatDate(date,{weekday:'long',month:'long',day:'numeric'}))}">
      <header class="cal-day-heading"><span>${calendarFormatDate(date,{weekday:'short'})}</span><strong>${calendarDate(date).getUTCDate()}</strong><span class="cal-day-count">${tasks.length || '—'}</span></header>
      <div class="cal-day-posts">${tasks.map(calendarPostCard).join('')}${!tasks.length?`<button type="button" class="cal-empty-day" data-calendar-action="add-day" data-date="${date}" aria-label="Add post on ${date}"><span>+</span>Plan a post</button>`:''}</div>
      ${tasks.length?`<button type="button" class="cal-day-add" data-calendar-action="add-day" data-date="${date}" aria-label="Add post on ${date}">+ Add post</button>`:''}
    </section>`;
  }).join('')}</div></div>`;
}
function calendarList(records) {
  if (!records.length) return '';
  return `<div class="cal-list">${Array.from({length:7},(_,index)=>{
    const date = calendarShift(calendarUI.week,index), tasks = records.filter(r=>r.date===date);
    if (!tasks.length) return '';
    return `<section class="cal-list-day"><h3>${esc(calendarFormatDate(date,{weekday:'long',month:'short',day:'numeric'}))}${date===calendarToday()?'<span>Today</span>':''}</h3>${tasks.map(record=>`<button type="button" class="cal-list-post" data-calendar-action="view-task" data-id="${esc(record.id)}" aria-label="View ${esc(record.title)}"><span class="cal-list-time">${esc(calendarTime(record.time))}</span>${record.image?`<img src="${img(record.image)}" alt="">`:icon('text')}<span class="cal-list-copy"><strong>${esc(record.title)}</strong><small>${esc(record.kind || record.brief?.type || 'Social post')}</small></span><span class="cal-list-platforms">${(record.platforms || []).map(p=>calendarPlatformChip(p,true)).join('')}</span><span class="cal-post-status ${calendarStatus(record)}">${calendarStatus(record)==='draft'?'Draft':'Scheduled'}</span>${icon('chevron')}</button>`).join('')}</section>`;
  }).join('')}</div>`;
}
function publishingCalendarPage() {
  const all = calendarWeekRecords(false), records = calendarWeekRecords();
  const scheduled = all.filter(r=>calendarStatus(r)==='scheduled').length;
  const drafts = all.length-scheduled;
  const days = new Set(all.map(r=>r.date)).size;
  const filtered = calendarUI.platform!=='all' || calendarUI.status!=='all';
  const empty = !records.length;
  return `<section class="publishing-calendar">
    <div class="cal-page-heading"><div class="cal-heading-copy"><span class="eyebrow">A LITTLE PLANNING. A WORLD OF STORIES.</span><h1>Publishing Calendar</h1><p>Give every story its moment. See your week at a glance.</p></div><button class="primary-btn" data-calendar-action="new-task">${icon('create')}New Post</button></div>
    <div class="cal-summary panel"><div><span class="cal-summary-icon">${icon('calendar')}</span><span><strong>${scheduled}</strong><small>Scheduled this week</small></span></div><div><span class="cal-summary-icon draft">${icon('edit')}</span><span><strong>${drafts}</strong><small>Drafts to finish</small></span></div><div><span class="cal-summary-icon days">${icon('sun')}</span><span><strong>${days}<em> / 7</em></strong><small>Days with a plan</small></span></div><span class="cal-summary-note">${icon('save')}Saved on this device</span></div>
    <div class="cal-board panel">
      <div class="cal-toolbar"><div class="cal-week-controls"><div class="cal-week-arrows"><button type="button" data-calendar-action="previous-week" aria-label="Previous week">${icon('back')}</button><button type="button" data-calendar-action="next-week" aria-label="Next week">${icon('arrow')}</button></div><h2 aria-live="polite">${calendarWeekLabel()}</h2><button class="cal-today" data-calendar-action="today">Today</button></div><div class="cal-toolbar-end"><span class="cal-timezone">${icon('globe')}Asia / Shanghai</span><div class="cal-view-toggle" role="group" aria-label="Calendar view"><button data-calendar-action="view-week" aria-pressed="${calendarUI.view==='week'}">${icon('calendar')}Week</button><button data-calendar-action="view-list" aria-pressed="${calendarUI.view==='list'}">${icon('layers')}List</button></div></div></div>
      <div class="cal-filters"><div class="cal-platform-filters" role="group" aria-label="Filter by platform"><button class="${calendarUI.platform==='all'?'selected':''}" data-calendar-action="filter-platform" data-value="all" aria-pressed="${calendarUI.platform==='all'}">All platforms</button>${calendarPlatformNames.map(platform=>`<button class="${calendarUI.platform===platform?'selected':''}" data-calendar-action="filter-platform" data-value="${platform}" aria-pressed="${calendarUI.platform===platform}">${calendarPlatformChip(platform,true)}<span>${platform}</span></button>`).join('')}</div><div class="cal-status-filters" role="group" aria-label="Filter by status">${[['all','All'],['scheduled','Scheduled'],['draft','Drafts']].map(([value,label])=>`<button data-calendar-action="filter-status" data-value="${value}" aria-pressed="${calendarUI.status===value}">${label}</button>`).join('')}</div></div>
      ${calendarUI.view==='week'?calendarWeekGrid(records):calendarList(records)}
      ${empty?`<div class="cal-empty-week">${icon(filtered?'search':'calendar')}<div><h3>${filtered?'No stories match these filters.':'Your week is full of possibilities.'}</h3><p>${filtered?'Try another platform or status to see more of your plan.':'Save a script or creative to your calendar, or add a post to get started.'}</p></div><button class="text-btn" data-calendar-action="${filtered?'clear-filters':calendarRecords().length?'planned-week':'new-task'}">${filtered?'Clear filters':calendarRecords().length?'Go to a planned week':'Plan your first post'} ${icon('arrow')}</button></div>`:''}
      <div class="cal-board-footer"><span><i class="cal-state-dot scheduled"></i>Scheduled<i class="cal-state-dot draft"></i>Draft</span><span>${records.length} ${records.length===1?'story':'stories'} this week${filtered?' · Filtered':''}</span>${calendarUI.view==='week'?`<span class="cal-swipe-hint">Swipe to explore the week ${icon('arrow')}</span>`:''}</div>
    </div>
    <div class="cal-page-footer"><span>${icon('shield')}Your saved content stays here when you refresh. Demo schedules do not publish live.</span><a href="#create/brief">Find your next story ${icon('arrow')}</a></div>
  </section>`;
}

function calendarSnapshot() {
  const onScripts = route().page==='create' && route().sub==='scripts';
  return {
    id:crypto.randomUUID(),title:onScripts?scriptVariants()[state.selectedScript].name:state.heading,
    heading:state.heading,topic:state.brief.topic,caption:state.caption,image:currentAsset().image,
    assetId:state.selectedAsset,ratio:state.ratio,kind:state.brief.type,
    brief:JSON.parse(JSON.stringify(state.brief)),script:scriptRows().map(row=>[...row]),
    platforms:Object.entries({...state.platforms,...state.additional}).filter(([,value])=>value).map(([name])=>name),
    date:state.scheduleDate || calendarToday(),time:state.scheduleTime || '10:00',status:'draft',
    timeZone:'Asia/Shanghai',createdAt:new Date().toISOString()
  };
}
function openCalendarComposer({record=null,date=null,status='draft'}={}) {
  pendingCalendarTask = record ? JSON.parse(JSON.stringify(record)) : calendarSnapshot();
  pendingCalendarTask.status = record ? calendarStatus(record) : status;
  if (date) pendingCalendarTask.date = date;
  pendingCalendarTask.platforms = Array.isArray(pendingCalendarTask.platforms) ? pendingCalendarTask.platforms : [];
  const task = pendingCalendarTask;
  modal(`<div class="eyebrow">GIVE YOUR STORY A MOMENT</div><h2 id="modal-title">${record?'Edit your calendar post':'Save to your calendar'}</h2><p>${record?'Adjust the details, date, and platforms for this saved post.':'Save a copy of your content so it is ready to find in your weekly plan.'}</p>
    <form id="calendar-task-form"><div class="field"><label for="calendar-title">Post Title</label><input id="calendar-title" name="title" maxlength="100" value="${esc(task.title)}" required></div><div class="cal-editor-grid"><div class="field"><label for="calendar-date">Date</label><input type="date" id="calendar-date" name="date" value="${esc(task.date)}" required></div><div class="field"><label for="calendar-time">Time · Asia / Shanghai</label><input type="time" id="calendar-time" name="time" value="${esc(task.time || '10:00')}" required></div></div>
    <fieldset class="cal-editor-fieldset"><legend>Status</legend><div class="cal-editor-status" role="radiogroup" aria-label="Post status">${[['draft','Draft','Keep it in your plan'],['scheduled','Scheduled','Ready for its moment']].map(([value,label,description])=>`<button type="button" role="radio" aria-checked="${task.status===value}" data-calendar-action="editor-status" data-value="${value}"><span class="cal-state-dot ${value}"></span><span><strong>${label}</strong><small>${description}</small></span>${icon('check')}</button>`).join('')}</div></fieldset>
    <fieldset class="cal-editor-fieldset"><legend>Platforms</legend><div class="cal-editor-platforms">${calendarPlatformNames.map(platform=>`<button type="button" data-calendar-action="editor-platform" data-value="${platform}" aria-pressed="${task.platforms.includes(platform)}">${calendarPlatformChip(platform)}${icon('check')}</button>`).join('')}</div></fieldset>
    <div class="field"><label for="calendar-caption">Caption</label><textarea id="calendar-caption" name="caption" maxlength="2200" rows="3">${esc(task.caption || '')}</textarea></div><div class="cal-snapshot-note">${icon('save')}The script, creative and brief are saved with this post.</div><div class="modal-actions"><button type="button" class="secondary-btn" data-action="close-modal">Cancel</button><button type="submit" class="primary-btn">${icon('calendar')}Save to Calendar</button></div><p class="cal-editor-note">Demo calendar · Saving a scheduled post does not publish it live.</p></form>`,{wide:true});
}
function calendarValidate(task) {
  if (!task.title?.trim()) return 'Give your post a title first.';
  if (!calendarDate(task.date) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(task.time || '')) return 'Choose a valid date and time.';
  if (calendarStatus(task)==='scheduled') {
    if (!task.platforms?.length) return 'Choose at least one platform for a scheduled post.';
    if (!task.caption?.trim()) return 'Add a caption before scheduling your post.';
    if (new Date(`${task.date}T${task.time}:00+08:00`)<=new Date()) return 'Choose a future date and time, or save this post as a draft.';
  }
  return '';
}
function calendarCommitTask(task) {
  const issue = calendarValidate(task);
  if (issue) { toast(issue); return false; }
  const record = {...task,title:task.title.trim(),timeZone:'Asia/Shanghai',updatedAt:new Date().toISOString()};
  const index = calendarRecords().findIndex(item=>item.id===record.id);
  if (index>=0) state.records[index]=record;
  else state.records.unshift(record);
  persist();
  calendarUI.week=calendarWeekStart(record.date);calendarUI.platform='all';calendarUI.status='all';
  if (route().page==='publish') render();
  modal(`<span class="success-icon">${icon('check')}</span><h2 id="modal-title">A place in your week.</h2><p>Your content is saved to the calendar, ready to revisit whenever you need it.</p><div class="success-details"><div><span>Your story</span><strong>${esc(record.title)}</strong></div><div><span>In your calendar</span><strong>${esc(calendarFormatDate(record.date,{month:'short',day:'numeric',year:'numeric'}))} · ${esc(calendarTime(record.time))}</strong></div><div><span>Platforms</span><strong>${esc(record.platforms?.join(', ') || 'To be chosen')}</strong></div><div><span>Status</span><strong>${calendarStatus(record)==='draft'?'Draft':'Demo scheduled'}</strong></div><div><span>Saved content</span><strong>Brief, script, caption & creative</strong></div></div><div class="modal-actions"><button class="secondary-btn" data-action="close-modal">Keep Creating</button><button class="primary-btn" data-calendar-action="open-calendar">View Calendar ${icon('arrow')}</button></div>`);
  return true;
}
function scheduleCurrentToCalendar() {
  const record = {...calendarSnapshot(),status:'scheduled'};
  if (!calendarCommitTask(record)) {
    if (!calendarDate(record.date) || new Date(`${record.date}T${record.time}:00+08:00`)<=new Date()) document.getElementById('schedule-date')?.focus();
  }
}
function calendarViewTask(id) {
  const record = calendarRecords().find(task=>task.id===id);
  if (!record) { toast('This calendar post is no longer available.'); return; }
  modal(`<div class="eyebrow">A STORY IN YOUR WEEK</div><h2 id="modal-title">${esc(record.title)}</h2><p>${esc(calendarFormatDate(record.date,{weekday:'long',month:'long',day:'numeric',year:'numeric'}))} · ${esc(calendarTime(record.time))} · Asia / Shanghai</p><div class="cal-detail-layout">${record.image?`<img class="cal-detail-image" src="${img(record.image)}" alt="Saved creative for ${esc(record.title)}">`:''}<div class="cal-detail-copy"><span class="cal-post-status ${calendarStatus(record)}">${calendarStatus(record)==='draft'?'Draft':'Demo scheduled'}</span><div class="cal-detail-platforms">${(record.platforms || []).map(p=>calendarPlatformChip(p)).join('') || '<span class="muted">Platforms to be chosen</span>'}</div><h3>Saved caption</h3><p class="cal-saved-caption">${esc(record.caption || 'Add a caption when you are ready.')}</p><span class="cal-detail-format">${icon('layers')}${esc(record.kind || record.brief?.type || 'Social post')}</span></div></div>${record.script?.length?`<section class="cal-saved-script"><h3>Saved script</h3>${record.script.map(([label,text])=>`<div><span>${esc(label)}</span><p>${esc(text)}</p></div>`).join('')}</section>`:''}<div class="cal-detail-actions"><button class="text-btn cal-remove" data-calendar-action="remove-task" data-id="${esc(record.id)}">${icon('trash')}Remove from Calendar</button><div><button class="secondary-btn" data-calendar-action="export-task" data-id="${esc(record.id)}">${icon('download')}Export</button><button class="primary-btn" data-calendar-action="edit-task" data-id="${esc(record.id)}">Edit Schedule ${icon('edit')}</button></div></div>`,{wide:true});
}
function calendarExportTask(id) {
  const task=calendarRecords().find(record=>record.id===id);if(!task)return;
  const text=`ATMOS — SAVED CALENDAR POST\n\nTITLE\n${task.title}\n\nTOPIC\n${task.topic || ''}\n\nDATE\n${task.date} ${task.time} (Asia/Shanghai)\n\nSTATUS\n${calendarStatus(task)}\n\nPLATFORMS\n${(task.platforms || []).join(', ')}\n\nCAPTION\n${task.caption || ''}\n\nSCRIPT\n${(task.script || []).map(([label,line])=>`${label}\n${line}`).join('\n\n')}\n\nSaved demo content; no live post has been sent.\n`;
  downloadBlob(new Blob([text],{type:'text/plain;charset=utf-8'}),'atmos-calendar-post.txt');toast('Your saved calendar content has been exported.');
}
function calendarRemoveTask(id) {
  const index=calendarRecords().findIndex(record=>record.id===id);if(index<0)return;
  lastCalendarRemoval={record:state.records[index],index};
  state.records.splice(index,1);persist();closeModal();render();
  clearTimeout(toastTimer);clearTimeout(calendarRemovalTimer);
  document.getElementById('toast-root').innerHTML=`<div class="toast cal-undo-toast" role="status">${icon('check')}<span>Post removed from your calendar.</span><button data-calendar-action="undo-remove">Undo</button></div>`;
  calendarRemovalTimer=setTimeout(()=>document.getElementById('toast-root').innerHTML='',8000);
}
function calendarHandleAction(action, button) {
  const value=button.dataset.value,id=button.dataset.id;
  switch(action) {
    case 'save-current':openCalendarComposer();break;
    case 'new-task':openCalendarComposer({date:calendarUI.week===calendarWeekStart(calendarToday())?calendarToday():calendarUI.week});break;
    case 'add-day':openCalendarComposer({date:button.dataset.date});break;
    case 'view-task':calendarViewTask(id);break;
    case 'edit-task':{const record=calendarRecords().find(task=>task.id===id);if(record)openCalendarComposer({record});break;}
    case 'open-calendar':navigate('publish');break;
    case 'previous-week':calendarUI.week=calendarShift(calendarUI.week,-7);render();break;
    case 'next-week':calendarUI.week=calendarShift(calendarUI.week,7);render();break;
    case 'today':calendarUI.week=calendarWeekStart(calendarToday());render();break;
    case 'view-week':calendarUI.view='week';render();break;
    case 'view-list':calendarUI.view='list';render();break;
    case 'filter-platform':calendarUI.platform=value;render();break;
    case 'filter-status':calendarUI.status=value;render();break;
    case 'clear-filters':calendarUI.platform='all';calendarUI.status='all';render();break;
    case 'planned-week':{const dates=calendarRecords().filter(task=>calendarDate(task.date)).map(task=>task.date).sort();const date=dates.find(date=>date>=calendarUI.week) || dates.at(-1);if(date)calendarUI.week=calendarWeekStart(date);render();break;}
    case 'editor-status':if(pendingCalendarTask){pendingCalendarTask.status=value;document.querySelectorAll('[data-calendar-action="editor-status"]').forEach(item=>item.setAttribute('aria-checked',String(item.dataset.value===value)));}break;
    case 'editor-platform':if(pendingCalendarTask){const selected=pendingCalendarTask.platforms.includes(value);pendingCalendarTask.platforms=selected?pendingCalendarTask.platforms.filter(p=>p!==value):[...pendingCalendarTask.platforms,value];button.setAttribute('aria-pressed',String(!selected));}break;
    case 'export-task':calendarExportTask(id);break;
    case 'remove-task':calendarRemoveTask(id);break;
    case 'undo-remove':if(lastCalendarRemoval){state.records.splice(lastCalendarRemoval.index,0,lastCalendarRemoval.record);persist();lastCalendarRemoval=null;clearTimeout(calendarRemovalTimer);render();toast('Your calendar post has been restored.');}break;
  }
}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-calendar-action]');if(!button)return;
  event.preventDefault();event.stopImmediatePropagation();calendarHandleAction(button.dataset.calendarAction,button);
});
document.addEventListener('submit',event=>{
  if(event.target.id!=='calendar-task-form')return;
  event.preventDefault();event.stopImmediatePropagation();
  if(!pendingCalendarTask)return;
  const data=new FormData(event.target);
  const record={...pendingCalendarTask,title:String(data.get('title') || '').trim(),date:String(data.get('date') || ''),time:String(data.get('time') || ''),caption:String(data.get('caption') || '')};
  if(calendarCommitTask(record))pendingCalendarTask=null;
});
