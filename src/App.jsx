import React, { useEffect, useMemo, useRef, useState } from 'react';

const KEY = 'acl-service-hours-v1';

// Fictional volunteering programs for the self-contained UI/UX exercise.
// Staff names, partners and descriptions are examples, not real university records.
const PROGRAMS = {
  ENV110: {
    name: 'Campus Green Team',
    partner: 'University Sustainability Office',
    description: 'Weekly tree planting, recycling audits and awareness stands that help the campus reduce its waste and energy use.',
    history: [
      { year: '2025/26', supervisors: ['Dr. Heba Lotfy'], coordinators: ['Malak Ashraf', 'Ziad Hamdy'] },
      { year: '2024/25', supervisors: ['Dr. Sherif Galal'], coordinators: ['Jana Wael', 'Seif Mostafa'] },
    ],
  },
  EDU210: {
    name: 'Peer Tutoring Circle',
    partner: 'Student Learning Center',
    description: 'Senior students run small study groups for first-year courses, preparing worked examples and answering questions.',
    history: [
      { year: '2025/26', supervisors: ['Dr. Nermine Aly'], coordinators: ['Hana Kamal', 'Marwan Essam'] },
      { year: '2024/25', supervisors: ['Dr. Waleed Fouad'], coordinators: ['Laila Samy', 'Kareem Ayman'] },
    ],
  },
  HLT150: {
    name: 'Blood Drive Crew',
    partner: 'Regional Blood Bank',
    description: 'Volunteers organise campus donation days, register donors and support the medical team on site.',
    history: [
      { year: '2025/26', supervisors: ['Dr. Amr Zaki'], coordinators: ['Salma Reda', 'Omar Hesham'] },
      { year: '2024/25', supervisors: ['Dr. Mona Sabry', 'Dr. Amr Zaki'], coordinators: ['Nadia Fikry', 'Tarek Adel'] },
    ],
  },
  COM305: {
    name: 'Community Kitchen',
    partner: 'Neighbourhood Food Network',
    description: 'Preparing and packing meals for local families, managing donations and keeping the kitchen inventory up to date.',
    history: [
      { year: '2025/26', supervisors: ['Dr. Ghada Ibrahim'], coordinators: ['Yasmin Talaat', 'Hazem Farid'] },
      { year: '2024/25', supervisors: ['Dr. Ghada Ibrahim'], coordinators: ['Rania Saleh', 'Mostafa Emad'] },
    ],
  },
  TEC220: {
    name: 'Digital Skills for Seniors',
    partner: 'City Community Library',
    description: 'One-to-one sessions that help older adults use smartphones, video calls, online banking and e-government services safely.',
    history: [
      { year: '2025/26', supervisors: ['Dr. Khaled Mourad'], coordinators: ['Reem Atef', 'Ahmed Nabil'] },
      { year: '2024/25', supervisors: ['Dr. Inas Farag'], coordinators: ['Mai Yehia', 'Bassem Hany'] },
    ],
  },
};

const getProgram = (code) =>
  PROGRAMS[code?.toUpperCase()] || {
    name: 'Program details not yet added',
    partner: '—',
    description: 'This program does not have a profile in the example directory.',
    history: [],
  };

const readRoute = () => {
  const match = window.location.hash.match(/^#\/programs\/([^/?#]+)$/);
  return match ? decodeURIComponent(match[1]).toUpperCase() : null;
};

const seed = [
  { id: 'e1', programCode: 'ENV110', hours: 3, reflection: 'Planting day was well organised and the team lead explained every step.', owner: 'you', name: 'You', date: '2026-10-11' },
  { id: 'e2', programCode: 'EDU210', hours: 2, reflection: 'If you prepare examples in advance the sessions run smoothly.', owner: 'other', name: 'Habiba', date: '2026-10-08' },
  { id: 'e3', programCode: 'HLT150', hours: 6, reflection: 'Long shift but very rewarding. Bring water and snacks.', owner: 'other', name: 'Omar', date: '2026-10-03' },
  { id: 'e4', programCode: 'COM305', hours: 4, reflection: 'Packing went quickly once roles were clear.', owner: 'you', name: 'You', date: '2026-09-29' },
  { id: 'e5', programCode: 'TEC220', hours: 2, reflection: 'Patience matters more than technical knowledge here.', owner: 'other', name: 'Lina', date: '2026-09-25' },
  { id: 'e6', programCode: 'ENV110', hours: 5, reflection: 'Recycling audit took longer than planned.', owner: 'other', name: 'Youssef', date: '2026-09-19' },
  { id: 'e7', programCode: 'EDU210', hours: 3, reflection: 'Students asked great questions about recursion.', owner: 'other', name: 'Mariam', date: '2026-09-12' },
  { id: 'e8', programCode: 'HLT150', hours: 8, reflection: '', owner: 'other', name: 'Ali', date: '2026-09-05' },
  { id: 'e9', programCode: 'COM305', hours: 1, reflection: 'Short orientation session only.', owner: 'other', name: 'Nour', date: '2026-08-28' },
  { id: 'e10', programCode: 'ENV110', hours: 2, reflection: 'Good for a first volunteering experience.', owner: 'other', name: 'Farah', date: '2026-08-20' },
];

function loadEntries() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(s) ? s : seed;
  } catch {
    return seed;
  }
}

const meanHours = (a) => (a.length ? (a.reduce((s, e) => s + e.hours, 0) / a.length).toFixed(1) : '—');
const sumHours = (a) => a.reduce((s, e) => s + e.hours, 0);

const PROGRAM_CODES = Object.keys(PROGRAMS);

function Kpi({ label, value, hint }) {
  return (
    <div className="kpi">
      <span>{label}</span>
      <b>{value}</b>
      <i>{hint}</i>
    </div>
  );
}

function HoursBadge({ hours }) {
  return (
    <span className="hours-badge" title={`${hours} hours`}>
      {hours}h
    </span>
  );
}

function EntryCard({ entry, onOpenProgram, onEdit }) {
  const program = getProgram(entry.programCode);
  const mine = entry.owner === 'you';
  const open = () => onOpenProgram(entry.programCode);
  return (
    <article
      className={`entry-card entry-card-open${mine ? ' entry-card-mine' : ''}`}
      role="link"
      tabIndex={0}
      aria-label={`Open ${program.name} (${entry.programCode})`}
      title={`Open ${program.name}`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
    >
      <div className="entry-top">
        <div className="entry-title">
          <span className="entry-program">{program.name}</span>
          <span className="code-pill">{entry.programCode}</span>
        </div>
        <HoursBadge hours={entry.hours} />
      </div>
      <p className="entry-note">{entry.reflection || 'No reflection shared.'}</p>
      <footer>
        <span>
          {mine ? 'You' : entry.name} · {entry.date}
        </span>
        {mine && (
          <button
            type="button"
            className="ghost ghost-sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(entry);
            }}
          >
            Edit my hours
          </button>
        )}
      </footer>
    </article>
  );
}

export default function App() {
  const [entries, setEntries] = useState(loadEntries);
  const [query, setQuery] = useState('');
  const [effort, setEffort] = useState('all');
  const [mineOnly, setMineOnly] = useState(false);
  const [lookup, setLookup] = useState('ENV110');
  const [drawer, setDrawer] = useState(null);
  const [problem, setProblem] = useState('');
  const [toast, setToast] = useState('');
  const [view, setView] = useState('Explore');
  const [programCode, setProgramCode] = useState(readRoute);
  const [programTab, setProgramTab] = useState(() => (readRoute() ? 'Entries' : 'About'));
  const drawerRef = useRef(null);
  const drawerTriggerRef = useRef(null);
  const lookupOtherRef = useRef(null);

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scrollBehavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

  useEffect(() => {
    const onHash = () => {
      const code = readRoute();
      setProgramCode(code);
      setProgramTab(code ? 'Entries' : 'About');
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const main = document.getElementById('main');
    const topbar = document.querySelector('.topbar');
    if (!drawer) {
      main?.removeAttribute('inert');
      topbar?.removeAttribute('inert');
      return;
    }
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    main?.setAttribute('inert', '');
    topbar?.setAttribute('inert', '');
    const root = drawerRef.current;
    const getFocusables = () =>
      [...(root?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) || [])].filter((el) => el.getAttribute('tabindex') !== '-1' && !el.disabled);
    requestAnimationFrame(() => {
      // Prefer hours when editing (program code is read-only)
      const field = drawer.id
        ? root?.querySelector('#drawer-hours')
        : root?.querySelector('#drawer-program');
      const list = getFocusables();
      (field || list?.[0])?.focus();
    });

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setDrawer(null);
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = getFocusables();
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
      main?.removeAttribute('inert');
      topbar?.removeAttribute('inert');
      window.removeEventListener('keydown', onKey);
      drawerTriggerRef.current?.focus?.();
    };
  }, [drawer]);

  useEffect(() => {
    if (PROGRAMS[lookup.trim().toUpperCase()]) return;
    // Focus free-text when switching to Other code
    if (lookup === '') {
      requestAnimationFrame(() => lookupOtherRef.current?.focus());
    }
  }, [lookup]);

  useEffect(() => {
    if (!drawer || !problem) return;
    const root = drawerRef.current;
    requestAnimationFrame(() => {
      const target =
        problem === 'hours'
          ? root?.querySelector('#drawer-hours')
          : problem === 'duplicate'
            ? root?.querySelector('#drawer-error .link-btn, #drawer-program')
            : root?.querySelector('#drawer-program');
      (target || root?.querySelector('#drawer-error'))?.focus?.();
    });
  }, [drawer, problem]);

  useEffect(() => {
    if (programCode) {
      document.title = `${getProgram(programCode).name} · ${programCode}`;
    } else {
      document.title = 'Service Hours Hub';
    }
  }, [programCode]);

  const openProgram = (code) => {
    window.location.hash = `#/programs/${encodeURIComponent(code)}`;
    setProgramCode(code.toUpperCase());
    // Land on reflections so effort + what volunteers said is immediate
    setProgramTab('Entries');
    window.scrollTo({ top: 0, behavior: 'auto' });
    requestAnimationFrame(() => {
      document.querySelector('.program-hero h1')?.focus?.();
    });
  };

  const goHome = (where) => {
    window.location.hash = '#/';
    setProgramCode(null);
    if (where === 'entries') {
      requestAnimationFrame(() =>
        document.getElementById('entries')?.scrollIntoView({ behavior: scrollBehavior() })
      );
    } else {
      window.scrollTo({ top: 0, behavior: scrollBehavior() });
    }
  };

  const shown = useMemo(
    () =>
      entries.filter((e) => {
        if (mineOnly && e.owner !== 'you') return false;
        if (effort !== 'all' && e.hours !== Number(effort)) return false;
        const hay = `${e.programCode} ${getProgram(e.programCode).name} ${e.reflection} ${e.name}`.toLowerCase();
        return hay.includes(query.toLowerCase());
      }),
    [entries, query, effort, mineOnly]
  );

  const looked = entries.filter((e) => e.programCode.toUpperCase() === lookup.trim().toUpperCase());
  const programsLogged = [...new Set(entries.map((e) => e.programCode))];
  const spread = [1, 2, 3, 4, 5, 6, 7, 8].map((h) => ({
    h,
    count: entries.filter((e) => e.hours === h).length,
  }));
  const peak = Math.max(...spread.map((s) => s.count), 1);
  const programEntries = programCode
    ? entries.filter((e) => e.programCode.toUpperCase() === programCode)
    : [];

  const directory = useMemo(
    () =>
      PROGRAM_CODES.map((code) => {
        const forCode = entries.filter((e) => e.programCode.toUpperCase() === code);
        return {
          code,
          ...getProgram(code),
          avg: meanHours(forCode),
          count: forCode.length,
        };
      }),
    [entries]
  );

  const yourEntryFor = (code) =>
    entries.find((e) => e.owner === 'you' && e.programCode.toUpperCase() === code?.toUpperCase());

  // Create: leave code empty unless opts.prefill is set (edit always uses the entry's code).
  function openDrawer(e, opts = {}) {
    if (e && e.owner !== 'you') return;
    if (!opts.keepTrigger) drawerTriggerRef.current = document.activeElement;
    setProblem('');
    const prefill =
      e?.programCode ||
      (opts.prefill === true ? programCode || '' : typeof opts.prefill === 'string' ? opts.prefill : '');
    if (!e && prefill) {
      const existing = yourEntryFor(prefill);
      if (existing) {
        setDrawer({
          id: existing.id,
          programCode: existing.programCode,
          hours: String(existing.hours),
          reflection: existing.reflection || '',
        });
        return;
      }
    }
    setDrawer({
      id: e?.id || null,
      programCode: prefill,
      hours: e ? String(e.hours) : '',
      reflection: e?.reflection || '',
    });
  }

  function save(ev) {
    ev.preventDefault();
    if (!drawer.programCode.trim()) {
      setProblem('code');
      return;
    }
    if (!/^[1-8]$/.test(drawer.hours.trim())) {
      setProblem('hours');
      return;
    }
    if (
      entries.some(
        (e) =>
          e.id !== drawer.id &&
          e.owner === 'you' &&
          e.programCode.toLowerCase() === drawer.programCode.trim().toLowerCase()
      )
    ) {
      setProblem('duplicate');
      return;
    }
    const data = {
      programCode: drawer.programCode.trim().toUpperCase(),
      hours: Number(drawer.hours.trim()),
      reflection: drawer.reflection.trim(),
      name: 'You',
      owner: 'you',
      date: drawer.id
        ? entries.find((x) => x.id === drawer.id)?.date || new Date().toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    };
    const wasEdit = Boolean(drawer.id);
    if (drawer.id) {
      setEntries((prev) => prev.map((e) => (e.id === drawer.id ? { ...e, ...data } : e)));
    } else {
      setEntries((prev) => [{ ...data, id: 'e-' + Date.now() }, ...prev]);
    }
    setDrawer(null);
    const leftProgram = programCode && data.programCode !== programCode;
    if (leftProgram) {
      setToast(`Logged for ${data.programCode} — ${getProgram(data.programCode).name}.`);
      openProgram(data.programCode);
    } else {
      setToast(wasEdit ? 'Hours saved.' : 'Hours saved. Thanks for volunteering.');
    }
  }

  function resetAll() {
    if (
      !window.confirm(
        'Restore sample data? This replaces your current logged hours with the starter examples.'
      )
    ) {
      return;
    }
    setEntries(seed);
    setQuery('');
    setEffort('all');
    setMineOnly(false);
    setLookup('ENV110');
    setDrawer(null);
    setView('Explore');
    setToast('Sample data restored.');
  }

  function clearFilters() {
    setQuery('');
    setEffort('all');
  }

  function showMine() {
    setMineOnly(true);
    setQuery('');
    setEffort('all');
    setView('My hours');
    goHome('entries');
  }

  function showReflections() {
    setMineOnly(false);
    setQuery('');
    setEffort('all');
    setView('Reflections');
    goHome('entries');
  }

  function showExplore() {
    setMineOnly(false);
    setQuery('');
    setEffort('all');
    setView('Explore');
    goHome('top');
  }

  const lookupCode = lookup.trim().toUpperCase();

  return (
    <div className="hub">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <nav className="topbar" aria-label="Main">
        <button type="button" className="brand" onClick={showExplore} aria-label="Service Hours Hub home">
          <span className="brand-mark" aria-hidden="true" />
          service<b>hub</b>
        </button>
        <div className="tabs" role="navigation" aria-label="Sections">
          <button
            type="button"
            className={programCode || view === 'Explore' ? 'on' : ''}
            aria-current={!programCode && view === 'Explore' ? 'page' : undefined}
            onClick={showExplore}
          >
            Explore
          </button>
          <button
            type="button"
            className={view === 'Reflections' && !programCode ? 'on' : ''}
            aria-current={view === 'Reflections' && !programCode ? 'page' : undefined}
            onClick={showReflections}
          >
            Reflections
          </button>
          <button
            type="button"
            className={view === 'My hours' && !programCode ? 'on' : ''}
            aria-current={view === 'My hours' && !programCode ? 'page' : undefined}
            onClick={showMine}
          >
            My hours
          </button>
        </div>
        <div className="topbar-end">
          <button type="button" className="secondary topbar-cta" onClick={() => openDrawer(null)}>
            Log hours
          </button>
          <span className="avatar" aria-hidden="true">
            Y
          </span>
        </div>
      </nav>

      <main className="page" id="main">
        {programCode ? (
          <section className="program-page">
            <button type="button" className="crumb" onClick={() => {
              goHome('top');
              requestAnimationFrame(() =>
                document.getElementById('directory')?.scrollIntoView({ behavior: scrollBehavior() })
              );
            }}>
              ← All programs
            </button>
            {!PROGRAMS[programCode] && (
              <div className="unknown-banner" role="status">
                <strong>This code isn’t in the directory yet.</strong>
                <span className="muted"> You can still log hours if your supervisor gave you the code.</span>
              </div>
            )}
            <header className="program-hero">
              <div className="program-hero-text">
                <span className="tag">{programCode}</span>
                {yourEntryFor(programCode) ? (
                  <span className="mine-tag program-hero-yours">You already logged this</span>
                ) : null}
                <h1 tabIndex={-1}>{getProgram(programCode).name}</h1>
                <p>{getProgram(programCode).partner}</p>
                {getProgram(programCode).description ? (
                  <p className="program-hero-desc">{getProgram(programCode).description}</p>
                ) : null}
              </div>
              <div className="hero-stats">
                <div>
                  <b>{meanHours(programEntries)}</b>
                  <span>avg hours</span>
                </div>
                <div>
                  <b>{programEntries.length}</b>
                  <span>reflections</span>
                </div>
              </div>
            </header>

            <div className="other-programs" aria-label="Compare other programs">
              <span className="other-programs-label">Compare</span>
              <div className="other-programs-chips">
                {PROGRAM_CODES.filter((c) => c !== programCode).map((code) => {
                  const logged = Boolean(yourEntryFor(code));
                  return (
                    <button
                      key={code}
                      type="button"
                      className={`code-chip${logged ? ' code-chip-logged' : ''}`}
                      onClick={() => openProgram(code)}
                      title={`${getProgram(code).name}${logged ? ' — already logged' : ''}`}
                    >
                      <span className="code-chip-code">
                        {code}
                        {logged ? ' · yours' : ''}
                      </span>
                      <span className="code-chip-name">{getProgram(code).name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="segmented" role="group" aria-label="Program sections">
              {['About', 'Team', 'Entries'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={programTab === t ? 'on' : ''}
                  aria-pressed={programTab === t}
                  onClick={() => setProgramTab(t)}
                >
                  {t === 'Entries' ? 'Reflections' : t}
                </button>
              ))}
            </div>

            {programTab === 'About' && (
              <section className="card about">
                <h2>About this program</h2>
                <p>{getProgram(programCode).description}</p>
                <dl>
                  <dt>Partner</dt>
                  <dd>{getProgram(programCode).partner}</dd>
                  <dt>Program code</dt>
                  <dd>{programCode}</dd>
                </dl>
                <div className="welcome-actions">
                  <button type="button" className="primary" onClick={() => setProgramTab('Entries')}>
                    Read what volunteers said
                  </button>
                  <button type="button" className="secondary" onClick={() => openDrawer(null)}>
                    Log hours for another program
                  </button>
                </div>
              </section>
            )}

            {programTab === 'Team' && (
              <section className="card team">
                <h2>Program team</h2>
                <p className="muted">Faculty supervisors and student coordinators for the last two academic years.</p>
                {getProgram(programCode).history.length ? (
                  <div className="team-grid">
                    {getProgram(programCode).history.map((h) => (
                      <div className="team-year" key={h.year}>
                        <h3>{h.year}</h3>
                        <span className="label">
                          Supervisor{h.supervisors.length === 1 ? '' : 's'}
                        </span>
                        <p>{h.supervisors.join(', ')}</p>
                        <span className="label">Student coordinators</span>
                        <p>{h.coordinators.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted">No example team records for this program yet.</p>
                )}
                <p className="fine-print">Illustrative program and staff records; all names are fictional.</p>
              </section>
            )}

            {programTab === 'Entries' && (
              <section className="card program-entries">
                <div className="card-head">
                  <h2>Volunteer reflections</h2>
                  <div className="card-head-actions">
                    <button type="button" className="primary" onClick={() => openDrawer(null)}>
                      Log hours for another program
                    </button>
                    {yourEntryFor(programCode) ? (
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => openDrawer(yourEntryFor(programCode))}
                      >
                        Edit your hours
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => openDrawer(null, { prefill: true })}
                      >
                        Log for this program
                      </button>
                    )}
                  </div>
                </div>
                {programEntries.length ? (
                  <ul className="timeline">
                    {programEntries.map((e) => (
                      <li key={e.id}>
                        <div className="timeline-top">
                          <b>{e.name}</b>
                          <HoursBadge hours={e.hours} />
                          {e.owner === 'you' && (
                            <button type="button" className="ghost ghost-sm" onClick={() => openDrawer(e)}>
                              Edit my hours
                            </button>
                          )}
                        </div>
                        <p>{e.reflection || 'No reflection shared.'}</p>
                        <small>{e.date}</small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty">
                    <p>No reflections yet. Be the first — or log hours for a different program.</p>
                    <div className="welcome-actions">
                      <button
                        type="button"
                        className="primary"
                        onClick={() => openDrawer(null, { prefill: true })}
                      >
                        Log for this program
                      </button>
                      <button type="button" className="secondary" onClick={() => openDrawer(null)}>
                        Log hours for another program
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}
          </section>
        ) : (
          <>
            <header className="welcome">
              <div>
                <h1>Service Hours Hub</h1>
                <p>
                  Pick a program, see how long others spent and what they wrote, then log your own hours.
                </p>
              </div>
              <div className="welcome-actions">
                <button
                  type="button"
                  className="primary"
                  onClick={() => {
                    setMineOnly(false);
                    setView('Explore');
                    document.getElementById('directory')?.scrollIntoView({ behavior: scrollBehavior() });
                  }}
                >
                  Browse programs
                </button>
              </div>
            </header>

            <ol className="scenario-steps" aria-label="How to use this hub">
              <li className="step">
                <button
                  type="button"
                  className="step-btn"
                  onClick={() => {
                    setMineOnly(false);
                    setView('Explore');
                    document.getElementById('directory')?.scrollIntoView({ behavior: scrollBehavior() });
                  }}
                >
                  <span className="step-num">1</span>
                  <span className="step-label">
                    Explore programs
                    <small>Browse the directory</small>
                  </span>
                </button>
              </li>
              <li className="step">
                <button
                  type="button"
                  className="step-btn"
                  onClick={() => {
                    setMineOnly(false);
                    setView('Reflections');
                    requestAnimationFrame(() =>
                      document.getElementById('entries')?.scrollIntoView({ behavior: scrollBehavior() })
                    );
                  }}
                >
                  <span className="step-num">2</span>
                  <span className="step-label">
                    Read reflections
                    <small>Hours &amp; notes from volunteers</small>
                  </span>
                </button>
              </li>
              <li className="step">
                <button type="button" className="step-btn" onClick={() => openDrawer(null)}>
                  <span className="step-num">3</span>
                  <span className="step-label">
                    Log your hours
                    <small>Program code, hours, optional note</small>
                  </span>
                </button>
              </li>
            </ol>

            <section className="insights" id="overview" aria-labelledby="insights-heading">
              <div className="insights-toggle" id="insights-heading">
                <span>Overview &amp; program check</span>
                <span className="muted">Totals, hours chart, look up a program</span>
              </div>
              <div id="insights-panel" className="insights-panel insights-panel-open">
                  <section className="kpis" aria-label="Overview">
                    <Kpi label="Total reflections" value={entries.length} hint="all time" />
                    <Kpi label="Avg hours" value={meanHours(entries)} hint="per reflection" />
                    <Kpi label="Programs logged" value={programsLogged.length} hint="with hours" />
                  </section>
                  <div className="dash-grid">
                    <section className="card chart">
                      <div className="card-head">
                        <h2>Hours distribution</h2>
                        <span className="muted">How long shifts usually run (1–8h)</span>
                      </div>
                      <div className="chart-body chart-body-bars">
                        <div
                          className="columns"
                          role="img"
                          aria-label={spread.map((s) => `${s.count} reflections at ${s.h} hours`).join('. ')}
                        >
                          {spread.map((s) => (
                            <div
                              className="column"
                              key={s.h}
                              title={`${s.count} at ${s.h}h`}
                              aria-hidden="true"
                            >
                              <div className="column-track">
                                <span className="column-fill" style={{ height: `${(s.count / peak) * 100}%` }} />
                              </div>
                              <small>{s.h}</small>
                            </div>
                          ))}
                        </div>
                        <p className="chart-sr-summary visually-hidden">
                          {spread.map((s) => `${s.h}h: ${s.count}`).join(', ')}
                        </p>
                      </div>
                    </section>
                    <section className="card lookup">
                      <div className="card-head">
                        <h2>Program check</h2>
                        <span className="muted">Pick a program to see its hours</span>
                      </div>
                      <label className="label" htmlFor="lookup-code">
                        Program
                      </label>
                      <div className="lookup-select-wrap">
                        <select
                          id="lookup-code"
                          className="lookup-select"
                          value={PROGRAMS[lookupCode] ? lookupCode : '__other__'}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === '__other__') {
                              setLookup('');
                              return;
                            }
                            setLookup(v);
                          }}
                        >
                          {PROGRAM_CODES.map((code) => (
                            <option key={code} value={code}>
                              {code} — {getProgram(code).name}
                            </option>
                          ))}
                          <option value="__other__">Other code…</option>
                        </select>
                      </div>
                      {!PROGRAMS[lookupCode] && (
                        <>
                          <label className="label" htmlFor="lookup-other">
                            Enter program code
                          </label>
                          <input
                            ref={lookupOtherRef}
                            id="lookup-other"
                            className="lookup-input"
                            value={lookup}
                            onChange={(e) => setLookup(e.target.value.toUpperCase())}
                            placeholder="e.g. XYZ999"
                            autoComplete="off"
                            spellCheck={false}
                          />
                          {lookupCode ? (
                            <p className="muted lookup-unknown">
                              Not in the directory — you can still view or log hours with this code.
                            </p>
                          ) : null}
                        </>
                      )}
                      <div className="lookup-result">
                        <div>
                          <b>{meanHours(looked)}</b>
                          <span>avg hours</span>
                        </div>
                        <div>
                          <b>{looked.length}</b>
                          <span>reflections</span>
                        </div>
                        <div>
                          <b>{sumHours(looked)}</b>
                          <span>total hours</span>
                        </div>
                      </div>
                      <div className="lookup-actions">
                        <button
                          type="button"
                          className="secondary"
                          disabled={!lookupCode}
                          onClick={() => lookupCode && openProgram(lookupCode)}
                        >
                          View program
                        </button>
                      </div>
                    </section>
                  </div>
                  <p className="insights-footer">
                    <button type="button" className="danger-quiet" onClick={resetAll}>
                      Restore sample data
                    </button>
                  </p>
              </div>
            </section>

            <section className="program-directory" id="directory" aria-labelledby="directory-heading">
              <div className="card-head">
                <h2 id="directory-heading">Choose a program</h2>
                <span className="muted">Tap a program for hours and reflections</span>
              </div>
              <div className="entry-grid">
                {directory.map((p) => {
                  const logged = Boolean(yourEntryFor(p.code));
                  return (
                  <button
                    type="button"
                    className={`program-card${logged ? ' program-card-logged' : ''}`}
                    key={p.code}
                    onClick={() => openProgram(p.code)}
                  >
                    <span className="program-card-code">
                      {p.code}
                      {logged ? <span className="mine-tag">Yours</span> : null}
                    </span>
                    <span className="program-card-name">{p.name}</span>
                    <span className="program-card-meta" title={p.partner}>{p.partner}</span>
                    <span className="program-card-stats">
                      <span className="hours-badge">{p.avg === '—' ? '—' : `${p.avg}h avg`}</span>
                      <span className="muted">
                        {p.count} {p.count === 1 ? 'reflection' : 'reflections'}
                      </span>
                    </span>
                  </button>
                  );
                })}
              </div>
            </section>

            <section
              className={`card entries${mineOnly ? ' entries-filtered' : ''}`}
              id="entries"
              aria-labelledby="entries-heading"
            >
              <div className="card-head">
                <h2 id="entries-heading">
                  {mineOnly ? 'Your logged hours' : 'Recent volunteer reflections'}
                </h2>
                <button
                  type="button"
                  className="secondary"
                  aria-pressed={mineOnly}
                  onClick={() => {
                    setMineOnly((m) => {
                      const next = !m;
                      setView(next ? 'My hours' : 'Reflections');
                      if (next) {
                        setQuery('');
                        setEffort('all');
                      }
                      return next;
                    });
                  }}
                >
                  {mineOnly ? 'Show all reflections' : 'My hours'}
                </button>
              </div>
              {mineOnly && (
                <div className="filter-banner" role="status">
                  <div>
                    <strong>Showing only your hours</strong>
                    <span className="muted">
                      {' '}
                      {shown.length} logged {shown.length === 1 ? 'entry' : 'entries'} — one log per program.
                    </span>
                  </div>
                </div>
              )}
              <div className="filters">
                <input
                  className="filter-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search reflections"
                  placeholder="Search by program, name, or reflection…"
                />
                <select
                  value={effort}
                  onChange={(e) => setEffort(e.target.value)}
                  aria-label="Filter by hours"
                >
                  <option value="all">Any hours</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                    <option key={h} value={h}>
                      {`${h}h`}
                    </option>
                  ))}
                </select>
              </div>
              {(() => {
                const mine = shown.filter((e) => e.owner === 'you');
                const others = shown.filter((e) => e.owner !== 'you');
                if (shown.length === 0) {
                  return (
                    <div className="empty">
                      <p>
                        {mineOnly
                          ? 'No matching hours of yours.'
                          : 'No reflections match these filters.'}
                      </p>
                      <p className="muted">
                        {mineOnly
                          ? 'Clear filters, or log hours for a new program (one log per program).'
                          : 'Try clearing search or picking another hour level.'}
                      </p>
                      {(query || effort !== 'all') && (
                        <button type="button" className="secondary" onClick={clearFilters}>
                          Clear filters
                        </button>
                      )}
                    </div>
                  );
                }
                if (mineOnly) {
                  return (
                    <div className="entry-list">
                      {mine.map((e) => (
                        <EntryCard key={e.id} entry={e} onOpenProgram={openProgram} onEdit={openDrawer} />
                      ))}
                    </div>
                  );
                }
                return (
                  <>
                    {others.length > 0 && (
                      <div className="entry-group">
                        <h3 className="entry-group-title">
                          From other volunteers <span className="muted">view only</span>
                        </h3>
                        <div className="entry-list">
                          {others.map((e) => (
                            <EntryCard key={e.id} entry={e} onOpenProgram={openProgram} onEdit={openDrawer} />
                          ))}
                        </div>
                      </div>
                    )}
                    {mine.length > 0 && (
                      <div className="entry-group">
                        <h3 className="entry-group-title">
                          Your hours <span className="muted">editable</span>
                        </h3>
                        <div className="entry-list">
                          {mine.map((e) => (
                            <EntryCard key={e.id} entry={e} onOpenProgram={openProgram} onEdit={openDrawer} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </section>

          </>
        )}
      </main>

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <span>{toast}</span>
          <button type="button" onClick={() => setToast('')} aria-label="Dismiss notification">
            ×
          </button>
        </div>
      )}

      {drawer && (
        <div
          className="scrim"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDrawer(null);
          }}
        >
          <aside
            ref={drawerRef}
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            <div className="drawer-head">
              <h2 id="drawer-title">{drawer.id ? 'Edit your hours' : 'Log your hours'}</h2>
              <button type="button" onClick={() => setDrawer(null)} aria-label="Close">
                ×
              </button>
            </div>
            <form onSubmit={save}>
              <label htmlFor="drawer-program">
                Program code
                <input
                  id="drawer-program"
                  value={drawer.programCode}
                  onChange={(e) => {
                    setProblem('');
                    setDrawer((d) => ({ ...d, programCode: e.target.value }));
                  }}
                  placeholder="e.g. ENV110"
                  autoComplete="off"
                  readOnly={Boolean(drawer.id)}
                  tabIndex={drawer.id ? -1 : undefined}
                  aria-invalid={problem === 'code' || problem === 'duplicate'}
                  aria-describedby={
                    [
                      PROGRAMS[drawer.programCode.trim().toUpperCase()] ? 'drawer-program-name' : null,
                      problem === 'code' || problem === 'duplicate' ? 'drawer-error' : null,
                    ]
                      .filter(Boolean)
                      .join(' ') || undefined
                  }
                />
              </label>
              {!drawer.id && (
              <div className="code-suggestions" role="group" aria-label="Suggested programs">
                {PROGRAM_CODES.map((code) => {
                  const logged = Boolean(yourEntryFor(code));
                  return (
                    <button
                      key={code}
                      type="button"
                      className={`code-chip${logged ? ' code-chip-logged' : ''}`}
                      onClick={() => {
                        setProblem('');
                        if (logged) {
                          openDrawer(yourEntryFor(code), { keepTrigger: true });
                          return;
                        }
                        setDrawer((d) => ({ ...d, programCode: code }));
                      }}
                      aria-pressed={drawer.programCode.toUpperCase() === code}
                      title={logged ? `${getProgram(code).name} — already logged` : getProgram(code).name}
                    >
                      {code}
                      {logged ? ' · yours' : ''}
                    </button>
                  );
                })}
              </div>
              )}
              {PROGRAMS[drawer.programCode.trim().toUpperCase()] && (
                <p className="drawer-program-name" id="drawer-program-name">
                  {PROGRAMS[drawer.programCode.trim().toUpperCase()].name}
                </p>
              )}
              {(problem === 'code' || problem === 'duplicate') && (
                <div className="problem" role="alert" id="drawer-error" tabIndex={-1}>
                  {problem === 'code' && 'Enter a program code.'}
                  {problem === 'duplicate' && (
                    <>
                      You already logged hours for this program —{' '}
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => {
                          const existing = yourEntryFor(drawer.programCode.trim());
                          if (existing) openDrawer(existing, { keepTrigger: true });
                        }}
                      >
                        Edit that entry
                      </button>
                    </>
                  )}
                </div>
              )}
              <label htmlFor="drawer-hours">
                Hours (1–8)
                <select
                  id="drawer-hours"
                  value={drawer.hours}
                  onChange={(e) => {
                    setProblem('');
                    setDrawer((d) => ({ ...d, hours: e.target.value }));
                  }}
                  aria-describedby={problem === 'hours' ? 'hours-hint drawer-error' : 'hours-hint'}
                  aria-invalid={problem === 'hours'}
                >
                  <option value="">Select hours</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                    <option key={h} value={String(h)}>
                      {h === 1 ? '1 hour' : `${h} hours`}
                    </option>
                  ))}
                </select>
              </label>
              <p className="fine-print" id="hours-hint">
                Whole hours only — use what you actually spent.
              </p>
              {problem === 'hours' && (
                <div className="problem" role="alert" id="drawer-error" tabIndex={-1}>
                  Hours must be a whole number from 1 to 8.
                </div>
              )}
              <label htmlFor="drawer-reflection">
                Reflection <span className="muted">(optional)</span>
                <textarea
                  id="drawer-reflection"
                  value={drawer.reflection}
                  rows={5}
                  onChange={(e) => {
                    setProblem('');
                    setDrawer((d) => ({ ...d, reflection: e.target.value }));
                  }}
                  placeholder="What should the next volunteer know?"
                />
              </label>
              <div className="drawer-actions">
                <button type="submit" className="primary">
                  {drawer.id ? 'Save changes' : 'Save hours'}
                </button>
                <button type="button" className="link-btn" onClick={() => setDrawer(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
