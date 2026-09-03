// Rendered fixtures for the dialog and pattern catalogs.
//
// Component metadata lives in component-manifest.json; this file owns only the
// *content* that dialogs and full screens are rendered with. That content is the
// mock's own seed workspace (docs/mocks/app.js): Maya Chen, Noah Williams, Amara
// Okafor, the Client Delivery Excellence and AI-Enabled Consulting initiatives, and
// stories QBC-097 through QBC-106. The copy is part of the design language, so it is
// reused verbatim rather than reinvented. This is a one-time content copy; the design
// system has no runtime dependency on the mocks.

export const iconNames = [
  'board', 'backlog', 'initiatives', 'assistants', 'menu', 'add', 'close',
  'search', 'arrow-left', 'arrow-right', 'more', 'alert', 'empty', 'initiative',
];

/* ------------------------------------------------------------------ helpers */

const button = (label, variant = '', size = '', icon = '') =>
  `<qbc-button${variant ? ` variant="${variant}"` : ''}${size ? ` size="${size}"` : ''}>` +
  `${icon ? `<qbc-icon slot="leading" name="${icon}" size="14"></qbc-icon>` : ''}${label}</qbc-button>`;

const actionSlots = (items) => items.map(({ label, variant = '', icon = '', action = 'close' }) =>
  `<qbc-button slot="actions"${variant ? ` variant="${variant}"` : ''} data-dialog-${action}>` +
  `${icon ? `<qbc-icon slot="leading" name="${icon}" size="14"></qbc-icon>` : ''}${label}</qbc-button>`).join('');

const field = (label, control, opts = {}) =>
  `<qbc-field label="${label}"${opts.hint ? ` hint="${opts.hint}"` : ''}` +
  `${opts.required ? ' required' : ''}${opts.full ? ' full' : ''}>${control}</qbc-field>`;

const pageHead = (title, copy, actions = '') =>
  `<header class="page-head"><div><h1>${title}</h1><p>${copy}</p></div>` +
  `${actions ? `<div class="page-actions">${actions}</div>` : ''}</header>`;

const POINT_OPTIONS = ':Choose points,1:1,2:2,3:3,5:5,8:8,13:13';
const EPIC_OPTIONS = ':Choose an epic,portal:Client project portal,playbook:Delivery playbook,copilot:Consulting copilot';
const OWNER_OPTIONS = ':Unassigned,maya:Maya Chen,noah:Noah Williams,amara:Amara Okafor';

/* ------------------------------------------------------------------ dialogs */

const storyFormBody = (withTasks) => `
  <div class="form-grid">
    ${field('Story title', '<qbc-text-input value="See a concise project health summary" placeholder="Describe the outcome"></qbc-text-input>', { required: true, full: true })}
    ${field('Epic', `<qbc-select value="portal" options="${EPIC_OPTIONS}"></qbc-select>`, { required: true })}
    ${field('Owner', `<qbc-select value="noah" options="${OWNER_OPTIONS}"></qbc-select>`)}
    ${field('User story', '<qbc-textarea placeholder="As a… I want… so that…"></qbc-textarea>', { required: true, full: true })}
    ${field('Acceptance criteria', '<qbc-textarea placeholder="What must be true when this is complete?"></qbc-textarea>', { required: true, full: true })}
    ${field('Story points', `<qbc-select value="5" options="${POINT_OPTIONS}"></qbc-select>`, { required: true })}
    ${field('Lifecycle', '<qbc-select value="draft" options="draft:Draft,active:Active"></qbc-select>', { hint: 'New stories begin as drafts. Use story actions to archive work.' })}
    ${withTasks ? `
    <div class="task-editor">
      <qbc-section-label title="Tasks" hint="A lightweight checklist inside this story.">
        ${button('Add', 'secondary', 'sm', 'add')}
      </qbc-section-label>
      <div class="task-list">
        <qbc-task-item title="Agree the health metrics" assignee="Maya Chen" done></qbc-task-item>
        <qbc-task-item title="Draft the summary query" assignee="Noah Williams"></qbc-task-item>
      </div>
    </div>` : ''}
  </div>`;

const dialogDefinitions = {
  'story-form/create': {
    title: 'New story',
    subtitle: 'Describe the outcome this story delivers.',
    content: storyFormBody(false),
    actions: [{ label: 'Cancel', variant: 'secondary' }, { label: 'Create', action: 'confirm' }],
  },
  'story-form/edit': {
    title: 'Edit QBC-101',
    subtitle: 'Grooming requires a description, acceptance criteria, and an estimate.',
    content: storyFormBody(true),
    actions: [{ label: 'Cancel', variant: 'secondary' }, { label: 'Save changes', action: 'confirm' }],
  },
  'initiative-form/create': {
    title: 'New initiative',
    subtitle: 'Give a body of work a shared direction.',
    content: `<div class="form-grid">
      ${field('Initiative name', '<qbc-text-input placeholder="Client Delivery Excellence"></qbc-text-input>', { required: true, full: true })}
      ${field('Description', '<qbc-textarea placeholder="What outcome does this move forward?"></qbc-textarea>', { full: true })}
    </div>`,
    actions: [{ label: 'Cancel', variant: 'secondary' }, { label: 'Create', action: 'confirm' }],
  },
  'epic-form/create': {
    title: 'New epic',
    subtitle: 'Group related stories beneath an initiative.',
    content: `<div class="form-grid">
      ${field('Epic name', '<qbc-text-input placeholder="Client project portal"></qbc-text-input>', { required: true, full: true })}
      ${field('Initiative', '<qbc-select options=":Choose an initiative,cde:Client Delivery Excellence,aic:AI-Enabled Consulting"></qbc-select>', { required: true })}
      ${field('Summary', '<qbc-text-input placeholder="A calm status surface"></qbc-text-input>')}
    </div>`,
    actions: [{ label: 'Cancel', variant: 'secondary' }, { label: 'Create', action: 'confirm' }],
  },
  'assistant-form/create': {
    title: 'New assistant',
    subtitle: 'Record who can take ownership of stories and tasks.',
    content: `<div class="form-grid">
      ${field('Name', '<qbc-text-input placeholder="Maya Chen"></qbc-text-input>', { required: true })}
      ${field('Role', '<qbc-text-input placeholder="Product &amp; Research Assistant"></qbc-text-input>', { required: true })}
      ${field('Specialties', '<qbc-text-input placeholder="Research, APIs, Quality"></qbc-text-input>', { hint: 'Separate each specialty with a comma.', full: true })}
      ${field('Availability', '<qbc-select value="available" options="available:Available,limited:Limited,unavailable:Unavailable"></qbc-select>')}
    </div>`,
    actions: [{ label: 'Cancel', variant: 'secondary' }, { label: 'Create', action: 'confirm' }],
  },
  'sprint-form/create': {
    title: 'New sprint',
    subtitle: 'A sprint is a fixed fourteen-day interval with one goal.',
    content: `<div class="form-grid">
      ${field('Sprint name', '<qbc-text-input value="Sprint 16" ></qbc-text-input>', { required: true })}
      ${field('Start date', '<qbc-text-input type="date" value="2026-09-28"></qbc-text-input>', { required: true, hint: 'The sprint runs for fourteen calendar days.' })}
      ${field('Sprint goal', '<qbc-textarea placeholder="What outcome will this sprint create?"></qbc-textarea>', { required: true, full: true })}
    </div>`,
    actions: [{ label: 'Cancel', variant: 'secondary' }, { label: 'Create', action: 'confirm' }],
  },
  'sprint-manager/default': {
    title: 'Manage sprints',
    subtitle: 'Plan, start, and complete focused two-week cycles.',
    content: `
      <qbc-section-label title="3 sprints">${button('New sprint', '', 'sm', 'add')}</qbc-section-label>
      <div class="sprint-list">
        <qbc-sprint-row name="Sprint 14" status="active" meta="Aug 31, 2026 – Sep 13, 2026 · Give clients a calm, current view of delivery">
          <qbc-button slot="actions" variant="secondary" size="sm">Complete</qbc-button>
          <qbc-button slot="actions" variant="quiet" size="sm">Edit</qbc-button>
        </qbc-sprint-row>
        <qbc-sprint-row name="Sprint 15" status="planned" meta="Sep 14, 2026 – Sep 27, 2026 · Make the copilot useful on real engagements">
          <qbc-button slot="actions" variant="secondary" size="sm">Start</qbc-button>
          <qbc-button slot="actions" variant="quiet" size="sm">Edit</qbc-button>
          <qbc-button slot="actions" variant="quiet" size="sm">Delete</qbc-button>
        </qbc-sprint-row>
        <qbc-sprint-row name="Sprint 13" status="completed" meta="Aug 17, 2026 – Aug 30, 2026 · Establish the delivery playbook">
          <qbc-button slot="actions" variant="quiet" size="sm">Edit</qbc-button>
        </qbc-sprint-row>
      </div>`,
    actions: [{ label: 'Done', variant: 'secondary' }],
  },
};

const confirmDefinitions = {
  archive: {
    title: 'Archive QBC-104?',
    copy: 'Archiving removes the story from the backlog and any sprint. You can restore it later.',
    confirmLabel: 'Archive story',
  },
  delete: {
    title: 'Delete QBC-104?',
    copy: 'This permanently removes the story and its tasks. This cannot be undone.',
    confirmLabel: 'Delete permanently',
  },
  'complete-sprint': {
    title: 'Complete Sprint 14?',
    copy: 'Unfinished stories return to the backlog and the sprint becomes read-only.',
    confirmLabel: 'Complete sprint',
  },
};

export function dialogMarkup(family, scenario, { staticPreview = true } = {}) {
  if (family === 'confirm') {
    const definition = confirmDefinitions[scenario];
    if (!definition) return notFound('Dialog not found', 'The requested scenario is not in the catalog.');
    return `<qbc-confirm-dialog${staticPreview ? ' static' : ''} open title="${attr(definition.title)}" ` +
      `copy="${attr(definition.copy)}" confirm-label="${attr(definition.confirmLabel)}"></qbc-confirm-dialog>`;
  }

  const definition = dialogDefinitions[`${family}/${scenario}`];
  if (!definition) return notFound('Dialog not found', 'The requested scenario is not in the catalog.');
  const size = family === 'sprint-manager' ? '' : '';
  return `<qbc-dialog${staticPreview ? ' static' : ''} open${size} title="${attr(definition.title)}"` +
    `${definition.subtitle ? ` subtitle="${attr(definition.subtitle)}"` : ''}>` +
    `${definition.content}${actionSlots(definition.actions)}</qbc-dialog>`;
}

/* ----------------------------------------------------------------- patterns */

const navItems = (active) => [
  ['board', 'Board'], ['backlog', 'Backlog'], ['initiatives', 'Initiatives'], ['assistants', 'Assistants'],
].map(([icon, label]) =>
  `<qbc-nav-item icon="${icon}" label="${label}"${icon === active ? ' active' : ''}></qbc-nav-item>`).join('');

const screen = (active, breadcrumb, content, { navOpen = false } = {}) => `
  <qbc-app-shell${navOpen ? ' nav-open' : ''}>
    <qbc-sidebar slot="sidebar"${navOpen ? ' open' : ''}>${navItems(active)}</qbc-sidebar>
    <qbc-topbar slot="topbar" breadcrumb="${attr(breadcrumb)}"${navOpen ? ' nav-open' : ''}>
      ${button('New story', '', '', 'add')}
    </qbc-topbar>
    ${content}
  </qbc-app-shell>`;

const STORIES = [
  ['QBC-101', 'See a concise project health summary', 'Client project portal · 1/2 tasks', '5', 'Noah Williams'],
  ['QBC-102', 'Publish the weekly delivery note', 'Delivery playbook', '3', 'Maya Chen'],
  ['QBC-103', 'Draft the copilot prompt library', 'Consulting copilot', '8', 'Amara Okafor'],
];

const boardContent = (scenario) => {
  if (scenario === 'empty') {
    return `
      ${pageHead('Sprint board', 'Focus on the work that matters now.', button('Manage sprints', 'secondary'))}
      <qbc-empty-state title="No active sprint" subtitle="Start a planned sprint to bring ready stories onto the board.">
        ${button('Choose a sprint')}
      </qbc-empty-state>`;
  }
  const card = ([key, title, context, points, owner]) => `
    <qbc-story-card story-key="${key}" title="${attr(title)}" context="${attr(context)}" points="${points}" owner="${owner}" draggable-card>
      <qbc-button slot="actions" variant="quiet" size="xs">Edit</qbc-button>
    </qbc-story-card>`;
  return `
    ${pageHead('Sprint board', 'A quiet view of the team&#8217;s current commitment.', button('Manage sprints', 'secondary'))}
    <qbc-sprint-hero eyebrow="Current sprint · Sprint 14"
      goal="Give clients a calm, current view of delivery"
      dates="Aug 31, 2026 – Sep 13, 2026" complete="1" total="3"></qbc-sprint-hero>
    <div class="board">
      <qbc-board-column label="To do" count="1">${card(STORIES[2])}</qbc-board-column>
      <qbc-board-column label="In progress" count="1">${card(STORIES[0])}</qbc-board-column>
      <qbc-board-column label="Done" count="1">${card(STORIES[1])}</qbc-board-column>
    </div>`;
};

const backlogContent = (scenario) => {
  const toolbar = `
    <div class="toolbar">
      <qbc-text-input type="search" placeholder="Search stories or epics"></qbc-text-input>
      <qbc-select value="all" options="all:All stories,unscheduled:Unscheduled,ready:Ready,draft:Draft,archived:Archived"></qbc-select>
    </div>`;
  if (scenario === 'empty') {
    return `
      ${pageHead('Backlog', 'Shape ideas into ready work, then place them into a two-week sprint.')}
      ${toolbar}
      <qbc-empty-state title="No matching stories" subtitle="Try a different search, or create a new story.">
        ${button('New story')}
      </qbc-empty-state>`;
  }
  const row = (key, title, context, tone, label, points) => `
    <qbc-data-row story-key="${key}" title="${attr(title)}" context="${attr(context)}">
      <qbc-pill slot="state" tone="${tone}">${label}</qbc-pill>
      <qbc-points slot="points" value="${points}"></qbc-points>
      <qbc-select slot="sprint" value="s14" options=":Backlog,s14:Sprint 14,s15:Sprint 15"></qbc-select>
      <qbc-button slot="actions" variant="secondary" size="sm">Unready</qbc-button>
      <qbc-button slot="actions" variant="quiet" size="sm">Edit</qbc-button>
    </qbc-data-row>`;
  return `
    ${pageHead('Backlog', 'Shape ideas into ready work, then place them into a two-week sprint.')}
    ${toolbar}
    <div class="data-list">
      ${row('QBC-101', 'See a concise project health summary', 'Client Delivery Excellence / Client project portal', 'ready', 'Ready', '5')}
      ${row('QBC-104', 'Capture engagement retrospectives', 'Client Delivery Excellence / Delivery playbook', 'draft', 'Draft', '')}
      ${row('QBC-106', 'Archive the legacy status deck', 'AI-Enabled Consulting / Consulting copilot', 'archived', 'Archived', '2')}
    </div>`;
};

const initiativesContent = (scenario) => {
  if (scenario === 'empty') {
    return `
      ${pageHead('Initiatives', 'Connect today&#8217;s stories to the outcomes they move forward.')}
      <qbc-empty-state title="No initiatives yet" subtitle="Create an initiative to give your work a shared direction.">
        ${button('New initiative')}
      </qbc-empty-state>`;
  }
  return `
    ${pageHead('Initiatives', 'Connect today&#8217;s stories to the outcomes they move forward.',
      `${button('New epic', 'secondary')}${button('New initiative')}`)}
    <div class="hierarchy-list">
      <qbc-initiative-card title="Client Delivery Excellence"
        description="Make every engagement legible to the client."
        summary="2 epics · 6 stories">
        <qbc-button slot="actions" variant="quiet" size="sm">Edit</qbc-button>
        <qbc-epic-row title="Client project portal" summary="A calm status surface · 4 stories" progress="50">
          <qbc-button slot="actions" variant="quiet" size="sm">Edit</qbc-button>
        </qbc-epic-row>
        <qbc-epic-row title="Delivery playbook" summary="Repeatable engagement practice · 2 stories" progress="25">
          <qbc-button slot="actions" variant="quiet" size="sm">Edit</qbc-button>
        </qbc-epic-row>
      </qbc-initiative-card>
      <qbc-initiative-card title="AI-Enabled Consulting"
        description="Put assistants to work on real engagements."
        summary="1 epic · 3 stories">
        <qbc-button slot="actions" variant="quiet" size="sm">Edit</qbc-button>
        <qbc-epic-row title="Consulting copilot" summary="Draft, review, summarise · 3 stories" progress="0">
          <qbc-button slot="actions" variant="quiet" size="sm">Edit</qbc-button>
        </qbc-epic-row>
      </qbc-initiative-card>
    </div>`;
};

const assistantsContent = (scenario) => {
  if (scenario === 'empty') {
    return `
      ${pageHead('Assistants', 'Keep ownership visible across stories and the tasks inside them.')}
      <qbc-empty-state title="No assistants yet" subtitle="Add an assistant, then assign them to stories and tasks.">
        ${button('New assistant')}
      </qbc-empty-state>`;
  }
  const card = (name, role, availability, stats, tags) => `
    <qbc-assistant-card name="${name}" role="${attr(role)}" availability="${availability}" stats="${stats}">
      ${tags.map(tag => `<qbc-tag>${tag}</qbc-tag>`).join('')}
      <qbc-button slot="actions" variant="quiet" size="sm">Edit</qbc-button>
    </qbc-assistant-card>`;
  return `
    ${pageHead('Assistants', 'Keep ownership visible across stories and the tasks inside them.', button('New assistant'))}
    <div class="assistant-grid">
      ${card('Maya Chen', 'Product &amp; Research Assistant', 'available', '3 stories · 2 open tasks', ['Research', 'Discovery'])}
      ${card('Noah Williams', 'Software Development Assistant', 'available', '4 stories · 1 open task', ['APIs', 'Quality'])}
      ${card('Amara Okafor', 'AI Delivery Assistant', 'limited', '2 stories · 3 open tasks', ['Prompting', 'Evaluation'])}
    </div>`;
};

export function patternMarkup(pattern, scenario) {
  switch (pattern) {
    case 'shell-navigation':
      return scenario === 'mobile'
        ? screen('board', 'Workspace / Board', `<div class="pattern-note">
            <h2>Off-canvas drawer</h2>
            <p>Below 760 CSS pixels the sidebar slides off screen and the breadcrumb gives way to a menu button. A scrim closes the drawer, which the mock omits.</p>
          </div>`, { navOpen: true })
        : screen('board', 'Workspace / Board', `<div class="pattern-note">
            <h2>Persistent sidebar</h2>
            <p>At every width above 760 CSS pixels the 224px rail is fixed and the content region is offset by exactly that width. Layout is CSS only; there is no JavaScript viewport branching.</p>
          </div>`);
    case 'board': return screen('board', 'Workspace / Board', boardContent(scenario));
    case 'backlog': return screen('backlog', 'Workspace / Backlog', backlogContent(scenario));
    case 'initiatives': return screen('initiatives', 'Workspace / Initiatives', initiativesContent(scenario));
    case 'assistants': return screen('assistants', 'Workspace / Assistants', assistantsContent(scenario));
    default: return notFound('Pattern not found', 'The requested pattern is not in the catalog.');
  }
}

/* --------------------------------------------------------------- components */

export function componentMarkup(component) {
  return component?.examples?.[0]?.markup ?? notFound('Example unavailable', 'This component has no example markup.');
}

function notFound(title, subtitle) {
  return `<qbc-empty-state title="${attr(title)}" subtitle="${attr(subtitle)}"></qbc-empty-state>`;
}

function attr(value) {
  return String(value ?? '').replaceAll('"', '&quot;');
}
