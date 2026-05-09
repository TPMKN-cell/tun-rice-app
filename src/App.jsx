import { useState, useCallback, useRef, useMemo, useEffect } from "react"

// ─── Design System ─────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

  :root {
    /* ── Palette from brand color guide ── */
    --ivory:   #F5F0E8;   /* Ivory Cream — main background */
    --wheat:   #E8D8C0;   /* Whispering Wheat — card surfaces */
    --blue-s:  #CDD8E3;   /* Ethereal Blue — sidebar / panels */
    --stone:   #9A9A8E;   /* Subtle Stone — muted text, borders */
    --leather: #A07848;   /* Bronzed Leather — accent / actions */
    --forest:  #1B4A3A;   /* Rich Forest Green — positive / settled */

    /* ── Semantic tokens ── */
    --bg:           var(--ivory);
    --surface:      #FDFAF5;
    --surface2:     var(--wheat);
    --surface3:     #EDE5D5;
    --sidebar-bg:   var(--blue-s);
    --border:       rgba(154,154,142,0.25);
    --border2:      rgba(154,154,142,0.45);

    --accent:       var(--leather);
    --accent2:      #C49050;
    --accent-dim:   rgba(160,120,72,0.10);

    --green:        var(--forest);
    --green-dim:    rgba(27,74,58,0.10);
    --green-bright: #2A7A5E;

    --red:          #B84040;
    --red-dim:      rgba(184,64,64,0.10);

    --blue:         #4A6C8C;
    --blue-dim:     rgba(74,108,140,0.10);

    --text:         #2C2820;
    --text2:        #6B6458;
    --text3:        var(--stone);

    --radius:       6px;
    --font:         'IBM Plex Sans', sans-serif;
    --mono:         'IBM Plex Mono', monospace;
    --serif:        'Cormorant Garamond', serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .app {
    font-family: var(--font);
    background: var(--bg);
    color: var(--text);
    width: 100vw;
    height: 100vh;
    display: flex;
    font-size: 13px;
    line-height: 1.5;
    position: relative;
    overflow: hidden;
  }

  /* ── Sidebar ── */
  .sidebar {
    width: 220px;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--border2);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    height: 100%;
    overflow-y: auto;
  }
  .brand {
    padding: 24px 20px 18px;
    border-bottom: 1px solid var(--border2);
  }
  .brand-mark {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 2.5px;
    color: var(--accent);
    text-transform: uppercase;
    margin-bottom: 5px;
  }
  .brand-name {
    font-family: var(--serif);
    font-size: 17px;
    font-weight: 600;
    color: var(--text);
    line-height: 1.3;
  }
  .brand-sub {
    font-size: 10px;
    color: var(--text3);
    margin-top: 3px;
    letter-spacing: .3px;
  }

  .nav { flex: 1; padding: 10px 8px; }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 9px 10px;
    border-radius: var(--radius);
    cursor: pointer;
    font-size: 12.5px;
    color: var(--text2);
    margin-bottom: 1px;
    transition: all .15s;
    font-weight: 400;
    letter-spacing: .1px;
  }
  .nav-item:hover { background: rgba(44,40,32,0.06); color: var(--text); }
  .nav-item.active {
    background: rgba(160,120,72,0.12);
    color: var(--accent);
    font-weight: 600;
    border-left: 2px solid var(--accent);
    padding-left: 8px;
  }
  .nav-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--stone);
    flex-shrink: 0;
    opacity: .6;
  }
  .nav-item.active .nav-dot { background: var(--accent); opacity: 1; }
  .nav-footer {
    padding: 12px 16px;
    border-top: 1px solid var(--border2);
    font-size: 10px;
    color: var(--text3);
    font-family: var(--mono);
    letter-spacing: .5px;
  }

  /* ── Main ── */
  .main { flex: 1; display: flex; flex-direction: column; min-width: 0; height: 100%; overflow: hidden; }
  .topbar {
    padding: 0 28px;
    height: 54px;
    border-bottom: 1px solid var(--border2);
    background: var(--surface);
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  .page-title { font-size: 14px; font-weight: 600; color: var(--text); letter-spacing: .2px; }
  .page-sub { font-size: 12px; color: var(--text3); margin-left: 8px; }
  .content { padding: 28px; flex: 1; overflow-y: auto; background: var(--bg); max-width: 900px; width: 100%; margin: 0 auto; }

  /* ── Bottom nav (mobile) ── */
  .bnav { display: none; position: absolute; bottom: 0; left: 0; right: 0; background: var(--surface); border-top: 1px solid var(--border2); z-index: 60; padding: 6px 0 calc(6px + env(safe-area-inset-bottom, 0px)); }
  .bnav-item { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 5px 4px; cursor: pointer; flex: 1; }
  .bnav-label { font-size: 10px; color: var(--text3); font-weight: 500; letter-spacing: .3px; }
  .bnav-active .bnav-label { color: var(--accent); font-weight: 600; }
  .bnav-pip { width: 4px; height: 4px; border-radius: 50%; background: var(--stone); opacity:.5; }
  .bnav-active .bnav-pip { background: var(--accent); opacity:1; }

  /* ── Hamburger button ── */
  .ham-btn {
    display: none;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    flex-shrink: 0;
    margin-right: 4px;
  }
  .ham-btn span {
    display: block;
    width: 20px; height: 2px;
    background: var(--text2);
    border-radius: 2px;
    transition: background .15s;
  }
  .ham-btn:hover span { background: var(--accent); }

  /* ── Mobile drawer overlay ── */
  .drawer-overlay {
    display: none;
    position: fixed; inset: 0;
    background: rgba(44,40,32,0.45);
    z-index: 98;
  }
  .drawer-overlay.open { display: block; }

  /* ── Mobile sidebar drawer ── */
  .sidebar-drawer {
    position: fixed;
    top: 0; left: 0; bottom: 0;
    width: 240px;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--border2);
    display: flex;
    flex-direction: column;
    z-index: 99;
    transform: translateX(-100%);
    transition: transform .25s cubic-bezier(.4,0,.2,1);
    overflow-y: auto;
  }
  .sidebar-drawer.open { transform: translateX(0); }

  @media(max-width:640px){
    .sidebar{ display: none; }
    .bnav{ display: flex; }
    .ham-btn{ display: flex; }
    .content{ padding: 14px 12px calc(90px + env(safe-area-inset-bottom, 0px)) 12px; background: var(--bg); }
    .topbar{ padding: 0 14px; }
  }

  /* ── Toast ── */
  .toast {
    position: absolute; bottom: 60px; left: 50%;
    transform: translateX(-50%) translateY(60px);
    background: var(--accent);
    color: #fff;
    padding: 9px 18px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    z-index: 999;
    transition: transform .3s cubic-bezier(.34,1.56,.64,1);
    white-space: nowrap;
    pointer-events: none;
    letter-spacing: .2px;
    box-shadow: 0 4px 16px rgba(160,120,72,0.3);
  }
  .toast-show { transform: translateX(-50%) translateY(0); }


  /* ── Cards & Sections ── */
  .card {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    margin-bottom: 14px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(44,40,32,0.06);
  }
  .card-head {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--surface2);
  }
  .card-title { font-size: 11px; font-weight: 600; color: var(--text2); letter-spacing: .6px; text-transform: uppercase; }
  .card-body { padding: 16px; }

  /* ── Stat Grid ── */
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 16px; }
  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    padding: 14px;
    position: relative;
    box-shadow: 0 1px 3px rgba(44,40,32,0.05);
  }
  .stat-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 2px;
    border-radius: 0 0 var(--radius) var(--radius);
  }
  .sc-gold::after  { background: var(--accent); }
  .sc-green::after { background: var(--green); }
  .sc-red::after   { background: var(--red); }
  .sc-blue::after  { background: var(--blue); }
  .stat-label { font-size: 10px; font-weight: 500; color: var(--text3); letter-spacing: .5px; text-transform: uppercase; margin-bottom: 6px; }
  .stat-val { font-size: 20px; font-weight: 600; font-family: var(--mono); }
  .sc-gold  .stat-val { color: var(--accent); }
  .sc-green .stat-val { color: var(--green); }
  .sc-red   .stat-val { color: var(--red); }
  .sc-blue  .stat-val { color: var(--blue); }

  /* ── Badge ── */
  .tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .4px;
    text-transform: uppercase;
  }
  .tag-gold  { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(160,120,72,.25); }
  .tag-green { background: var(--green-dim);  color: var(--green);  border: 1px solid rgba(27,74,58,.2); }
  .tag-red   { background: var(--red-dim);    color: var(--red);    border: 1px solid rgba(184,64,64,.2); }
  .tag-blue  { background: var(--blue-dim);   color: var(--blue);   border: 1px solid rgba(74,108,140,.2); }

  /* ── Supplier / Type Cards ── */
  .entity-card {
    background: var(--surface2);
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    padding: 12px 14px;
    margin-bottom: 8px;
  }
  .entity-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .entity-name { font-size: 13px; font-weight: 600; color: var(--text); }

  /* ── Mini stats row ── */
  .mini-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(80px,1fr)); gap: 6px; margin-bottom: 8px; }
  .mini-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 8px 8px 6px;
    text-align: center;
  }
  .mini-val { font-size: 12px; font-weight: 600; font-family: var(--mono); }
  .mini-lbl { font-size: 9px; color: var(--text3); margin-top: 2px; text-transform: uppercase; letter-spacing: .4px; }

  /* ── Progress bar ── */
  .prog { background: var(--border2); border-radius: 2px; height: 3px; overflow: hidden; }
  .prog-fill { height: 100%; border-radius: 2px; transition: width .4s; }
  .prog-label { text-align: right; font-size: 10px; color: var(--text3); margin-top: 3px; font-family: var(--mono); }

  /* ── Recent rows ── */
  .list-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
  }
  .list-row:last-child { border-bottom: none; }
  .list-main { font-size: 13px; font-weight: 500; color: var(--text); display: flex; align-items: center; gap: 8px; }
  .list-sub  { font-size: 11px; color: var(--text3); margin-top: 2px; font-family: var(--mono); }
  .list-amt  { font-size: 13px; font-weight: 600; color: var(--accent); font-family: var(--mono); white-space: nowrap; }

  /* ── Forms ── */
  .form-grid { display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 10px; }
  .form-full { grid-column: 1 / -1; }
  @media(max-width:640px){ .form-grid { grid-template-columns: 1fr; } }
  .field { display: flex; flex-direction: column; gap: 5px; }
  .field-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--text3);
    letter-spacing: .5px;
    text-transform: uppercase;
  }
  .field-input {
    font-family: var(--font);
    font-size: 13px;
    padding: 9px 11px;
    background: var(--surface2);
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    color: var(--text);
    outline: none;
    width: 100%;
    text-align: left;
    transition: border-color .15s, box-shadow .15s;
  }
  .field-input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
  .field-input:disabled { opacity: .45; cursor: not-allowed; background: var(--surface3); }
  select.field-input option { background: var(--ivory); color: var(--text); }

  /* ── Buttons ── */
  .btn {
    font-family: var(--font);
    font-size: 12px;
    font-weight: 600;
    padding: 9px 16px;
    border-radius: var(--radius);
    border: none;
    cursor: pointer;
    letter-spacing: .3px;
    transition: all .15s;
  }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: var(--accent2); }
  .btn-ghost { background: transparent; color: var(--text2); border: 1px solid var(--border2); }
  .btn-ghost:hover { border-color: var(--stone); color: var(--text); background: var(--surface2); }
  .btn-danger { background: var(--red-dim); color: var(--red); border: 1px solid rgba(184,64,64,.2); font-size: 11px; padding: 5px 9px; }
  .btn-danger:hover { background: var(--red); color: white; }
  .form-actions { display: flex; gap: 8px; margin-top: 6px; }
  .form-actions .btn:first-child { flex: 1; }
  .form-actions .btn:last-child  { flex: 2; font-size: 13px; padding: 10px; }

  /* ── Step hint ── */
  .step-hint {
    font-size: 11px;
    font-weight: 500;
    color: var(--accent);
    background: var(--accent-dim);
    border: 1px solid rgba(160,120,72,.2);
    border-radius: var(--radius);
    padding: 8px 12px;
    margin-bottom: 10px;
    letter-spacing: .2px;
  }

  /* ── Summary Box ── */
  .summary-box {
    background: var(--surface2);
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    padding: 14px;
    margin: 6px 0 12px;
  }
  .summary-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--text3);
    letter-spacing: .5px;
    text-transform: uppercase;
    margin-bottom: 10px;
  }
  .summary-totals {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    margin-bottom: 12px;
  }
  .summary-cell {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 9px 8px;
    text-align: center;
  }
  .sc-num { font-size: 14px; font-weight: 600; font-family: var(--mono); }
  .sc-lbl { font-size: 9px; color: var(--text3); margin-top: 2px; text-transform: uppercase; letter-spacing: .4px; }
  .divider-label {
    display: flex; align-items: center; gap: 8px;
    font-size: 10px; font-weight: 600; color: var(--text3);
    letter-spacing: .5px; text-transform: uppercase;
    margin: 0 0 10px;
  }
  .divider-label::before,.divider-label::after { content:''; flex:1; height:1px; background:var(--border); }
  .per-bag-row {
    display: flex; align-items: center; gap: 6px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 10px 12px; flex-wrap: wrap;
  }
  .pb-cell { text-align: center; flex: 1; min-width: 50px; }
  .pb-cell.highlight { background: var(--accent-dim); border-radius: 4px; padding: 6px 8px; border: 1px solid rgba(160,120,72,.2); }
  .pb-num { font-size: 13px; font-weight: 600; font-family: var(--mono); color: var(--text); }
  .pb-lbl { font-size: 9px; color: var(--text3); margin-top: 2px; text-transform: uppercase; letter-spacing: .4px; }
  .pb-op  { font-size: 14px; font-weight: 400; color: var(--stone); flex-shrink: 0; }
  @media(max-width:480px){ .summary-totals { grid-template-columns: 1fr 1fr; } }

  /* ── Payment breakdown ── */
  .pay-panel {
    background: var(--surface2);
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    padding: 14px;
    margin: 10px 0 12px;
  }
  .pay-panel-title { font-size: 10px; font-weight: 600; color: var(--text3); letter-spacing: .5px; text-transform: uppercase; margin-bottom: 10px; }
  .pay-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; font-size: 12px; }
  .pay-row-lbl { color: var(--text2); }
  .pay-cat-block {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 9px 12px;
    margin: 5px 0;
  }
  .pay-cat-top { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: var(--text); margin-bottom: 5px; }
  .pay-cat-detail { display: flex; justify-content: space-between; font-size: 11px; color: var(--text2); }
  .pay-divider { height: 1px; background: var(--border); margin: 8px 0; }
  .pay-total-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; }
  .pay-preview {
    display: flex; justify-content: space-between; align-items: center;
    background: rgba(160,120,72,0.07);
    border: 1px solid rgba(160,120,72,.15);
    border-radius: 4px;
    padding: 8px 10px; margin-top: 6px; font-size: 11px; color: var(--text2);
  }
  .deposit-note {
    font-size: 11px; color: var(--green);
    background: var(--green-dim);
    border: 1px solid rgba(61,186,111,.15);
    border-radius: 4px;
    padding: 8px 10px; margin-top: 6px; line-height: 1.6;
  }

  /* ── Category breakdown in supplier card ── */
  .cat-section { border-top: 1px solid var(--border); padding-top: 10px; margin-top: 8px; }
  .cat-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; color: var(--text2); }
  .cat-sep { border-top: 1px dashed var(--border); margin: 5px 0; }

  /* ── Tables ── */
  .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  thead tr { border-bottom: 1px solid var(--border2); }
  thead th {
    padding: 8px 12px; color: var(--text3); font-weight: 600;
    font-size: 10px; text-align: left; white-space: nowrap;
    letter-spacing: .5px; text-transform: uppercase;
  }
  tbody tr { border-bottom: 1px solid var(--border); transition: background .1s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--surface2); }
  tbody td { padding: 10px 12px; color: var(--text); vertical-align: middle; }
  .mono { font-family: var(--mono); font-weight: 500; }
  .td-muted { color: var(--text2); }

  /* ── Filter row ── */
  .filter-row { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
  .filter-row input, .filter-row select { width: 100%; }

  /* ── Stock card ── */
  .stock-card {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    overflow: hidden;
    margin-bottom: 12px;
    box-shadow: 0 1px 3px rgba(44,40,32,0.05);
  }
  .stock-head {
    display: flex; justify-content: space-between; align-items: center;
    padding: 11px 14px;
    background: var(--surface2);
    border-bottom: 1px solid var(--border);
  }
  .stock-section { padding: 11px 14px; border-bottom: 1px solid var(--border); }
  .stock-section:last-child { border-bottom: none; }
  .stock-section-label {
    font-size: 9px; font-weight: 600; color: var(--text3);
    letter-spacing: .6px; text-transform: uppercase; margin-bottom: 8px;
  }

  /* ── Confirm modal ── */
  .modal-overlay {
    position: absolute; inset: 0; background: rgba(44,40,32,0.45);
    z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px;
  }
  .modal {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 8px;
    width: 100%; max-width: 380px; padding: 22px 20px;
    box-shadow: 0 12px 48px rgba(44,40,32,0.2);
  }
  .modal-head { margin-bottom: 16px; }
  .modal-title { font-family: var(--serif); font-size: 18px; font-weight: 600; color: var(--text); margin-bottom: 3px; }
  .modal-sub { font-size: 11px; color: var(--text3); }
  .modal-rows { border: 1px solid var(--border); border-radius: 4px; overflow: hidden; margin-bottom: 10px; }
  .modal-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 12px; font-size: 12px; color: var(--text2); border-bottom: 1px solid var(--border); }
  .modal-row:last-child { border-bottom: none; }
  .modal-row-hl { background: rgba(160,120,72,.06); }
  .modal-result { text-align: center; font-size: 13px; font-weight: 600; padding: 10px; border-radius: 4px; background: var(--surface2); margin-bottom: 8px; }
  .modal-method { text-align: center; font-size: 11px; color: var(--text3); font-family: var(--mono); }
  .modal-footer { display: flex; gap: 8px; margin-top: 16px; }
  .modal-footer .btn { flex: 1; padding: 11px; font-size: 13px; }

  .no-data { text-align: center; padding: 32px; color: var(--text3); font-size: 12px; letter-spacing: .3px; }

  /* ── Date tab ── */
  .date-tab {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 14px;
    background: var(--surface2);
    border: 1px solid var(--border2);
    border-radius: 20px;
    font-family: var(--mono);
    font-size: 12px;
    font-weight: 500;
    color: var(--text);
    cursor: pointer;
    position: relative;
    transition: border-color .15s;
    white-space: nowrap;
    margin-bottom: 10px;
  }
  .date-tab:hover { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
  .date-tab-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
  .date-tab input[type="date"] {
    position: absolute; inset: 0; opacity: 0;
    cursor: pointer; width: 100%; height: 100%;
  }

  /* ── Purchase record card (mobile) ── */
  .rec-card { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px; margin-bottom: 8px; }
  .rec-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 9px; }
  .rec-supplier { font-size: 13px; font-weight: 600; color: var(--text); }
  .rec-meta { font-size: 10px; color: var(--text3); margin-top: 2px; font-family: var(--mono); }
  .rec-per-bag { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 8px; padding: 9px; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; }
  .rpb-item { display: flex; flex-direction: column; gap: 1px; }
  .rpb-lbl { font-size: 9px; color: var(--text3); text-transform: uppercase; letter-spacing: .4px; }
  .rpb-val { font-size: 12px; font-weight: 600; font-family: var(--mono); color: var(--text); }
  .rec-totals { border-top: 1px solid var(--border); padding-top: 7px; }
  .rec-trow { display: flex; justify-content: space-between; padding: 3px 0; font-size: 12px; color: var(--text2); }
`

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => Math.round(n || 0).toLocaleString()
const today = () => new Date().toISOString().split('T')[0]
const PAY_CATS   = ['ဆန်ဖိုး', 'ကားခ', 'စရံ']
const CAT_COLOR  = { 'ဆန်ဖိုး': 'var(--accent)', 'ကားခ': 'var(--blue)', 'စရံ': 'var(--green)' }
const CAT_LABEL  = { 'ဆန်ဖိုး': 'Rice Cost', 'ကားခ': 'Transport', 'စရံ': 'Deposit' }

// ─── Firebase ────────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}
const firebaseApp = initializeApp(firebaseConfig)
const db = getFirestore(firebaseApp)

// ─── Store ───────────────────────────────────────────────────────────────────
function useStore() {
  const [purchases, setPurchases] = useState([])
  const [payments,  setPayments]  = useState([])
  const [sales,     setSales]     = useState([])
  const [dbReady,   setDbReady]   = useState(false)

  // Real-time listeners — data syncs instantly across all devices
  useEffect(() => {
    let done = { p:false, pay:false, s:false }
    const check = () => { if(done.p && done.pay && done.s) setDbReady(true) }

    const unsubP = onSnapshot(
      query(collection(db,'purchases'), orderBy('createdAt','desc')),
      snap => { setPurchases(snap.docs.map(d=>({id:d.id,...d.data()}))); done.p=true; check() }
    )
    const unsubPay = onSnapshot(
      query(collection(db,'payments'), orderBy('createdAt','desc')),
      snap => { setPayments(snap.docs.map(d=>({id:d.id,...d.data()}))); done.pay=true; check() }
    )
    const unsubS = onSnapshot(
      query(collection(db,'sales'), orderBy('createdAt','desc')),
      snap => { setSales(snap.docs.map(d=>({id:d.id,...d.data()}))); done.s=true; check() }
    )
    return () => { unsubP(); unsubPay(); unsubS() }
  }, [])

  const getRiceTypes = () => [...new Set(purchases.map(p => p.type))].filter(Boolean).sort()
  const getSuppliers = () => [...new Set(purchases.map(p => p.supplier))].filter(Boolean).sort()
  const getStockByType = (type) => {
    const bought = purchases.filter(p => p.type === type).reduce((s,p) => s+p.qty, 0)
    const sold   = sales.filter(s => s.type === type).reduce((s,p) => s+p.qty, 0)
    return { bought, sold, remaining: bought - sold }
  }
  const getTotalForScope          = (sup,type) => purchases.filter(p=>p.supplier===sup&&(!type||p.type===type)).reduce((s,p)=>s+p.total,0)
  const getPaidForScope           = (sup,type) => payments.filter(p=>p.supplier===sup&&(!type||p.type===type)&&p.category!=='စရံ').reduce((s,p)=>s+p.amount,0)
  const getDepositForScope        = (sup,type) => payments.filter(p=>p.supplier===sup&&(!type||p.type===type)&&p.category==='စရံ').reduce((s,p)=>s+p.amount,0)
  const getPaidByCategoryForScope = (sup,type) => {
    const rows = payments.filter(p=>p.supplier===sup&&(!type||p.type===type))
    return PAY_CATS.reduce((acc,cat)=>{ acc[cat]=rows.filter(p=>p.category===cat).reduce((s,p)=>s+p.amount,0); return acc },{})
  }
  const getTransportTotalForScope = (sup,type) => purchases.filter(p=>p.supplier===sup&&(!type||p.type===type)).reduce((s,p)=>s+(p.transportTotal||0),0)
  const getRiceCostForScope       = (sup,type) => purchases.filter(p=>p.supplier===sup&&(!type||p.type===type)).reduce((s,p)=>s+(p.total-(p.transportTotal||0)),0)

  const addPurchase = async (r) => { await addDoc(collection(db,'purchases'), {...r, createdAt:serverTimestamp()}) }
  const delPurchase = async (id) => { await deleteDoc(doc(db,'purchases',id)) }
  const addPayment  = async (r) => { await addDoc(collection(db,'payments'),  {...r, createdAt:serverTimestamp()}) }
  const delPayment  = async (id) => { await deleteDoc(doc(db,'payments',id)) }
  const addSale     = async (r) => { await addDoc(collection(db,'sales'),     {...r, createdAt:serverTimestamp()}) }
  const delSale     = async (id) => { await deleteDoc(doc(db,'sales',id)) }

  return { purchases,payments,sales,dbReady,getRiceTypes,getSuppliers,getStockByType,getTotalForScope,getPaidForScope,getDepositForScope,getPaidByCategoryForScope,getTransportTotalForScope,getRiceCostForScope,addPurchase,delPurchase,addPayment,delPayment,addSale,delSale }
}

// ─── Shared UI ──────────────────────────────────────────────────────────────
const Tag = ({ t='tag-gold', children }) => <span className={`tag ${t}`}>{children}</span>

const StatCard = ({ value, label, color='gold' }) => (
  <div className={`stat-card sc-${color}`}>
    <div className="stat-label">{label}</div>
    <div className="stat-val">{value}</div>
  </div>
)

const Card = ({ title, action, children }) => (
  <div className="card">
    <div className="card-head">
      <span className="card-title">{title}</span>
      {action}
    </div>
    <div className="card-body">{children}</div>
  </div>
)

const MiniBox = ({ val, lbl, color }) => (
  <div className="mini-box">
    <div className="mini-val" style={color ? { color } : {}}>{val}</div>
    <div className="mini-lbl">{lbl}</div>
  </div>
)

const ProgBar = ({ pct, color, label }) => (
  <div>
    <div className="prog"><div className="prog-fill" style={{ width:`${pct}%`, background:color }} /></div>
    {label && <div className="prog-label">{label}</div>}
  </div>
)

const Field = ({ label, full, children }) => (
  <div className={`field${full ? ' form-full' : ''}`}>
    <label className="field-label">{label}</label>
    {children}
  </div>
)

const DateTab = ({ value, onChange }) => {
  const display = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
    : 'Select date'
  return (
    <div className="date-tab">
      <span className="date-tab-dot" />
      <span>{display}</span>
      <input type="date" value={value} onChange={onChange} />
    </div>
  )
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ store }) {
  const { purchases, payments, getRiceTypes, getStockByType } = store
  const totalCost = purchases.reduce((a,p)=>a+p.total,0)
  const totalPaid = payments.reduce((a,p)=>a+p.amount,0)
  const totalBags = purchases.reduce((a,p)=>a+p.qty,0)
  const balance   = totalCost - totalPaid
  const types     = getRiceTypes()

  return (
    <div>
      <div className="stat-grid">
        <StatCard value={fmt(totalCost)} label="Total Cost (Ks)" color="gold" />
        <StatCard value={fmt(totalPaid)} label="Paid (Ks)"       color="green" />
        <StatCard value={fmt(balance)}   label="Remaining (Ks)"  color="red" />
        <StatCard value={fmt(totalBags)}  label="Bags Purchased"  color="blue" />
      </div>

      <Card title="Payment by Rice Type">
        {!types.length ? <p className="no-data">No purchase records yet</p> : types.map(type => {
          const rows     = purchases.filter(p=>p.type===type)
          const typeCost = rows.reduce((a,p)=>a+p.total,0)
          const typePaid = payments.filter(p=>p.type===type).reduce((a,p)=>a+p.amount,0)
          const rem      = Math.max(0, typeCost-typePaid)
          const pct      = typeCost>0 ? Math.min(100,Math.round(typePaid/typeCost*100)) : 0
          const col      = rem<=0?'var(--green)':pct>=50?'var(--blue)':'var(--red)'
          const tagT     = rem<=0?'tag-green':pct>=50?'tag-blue':'tag-red'
          const qty      = rows.reduce((a,p)=>a+p.qty,0)
          return (
            <div key={type} className="entity-card">
              <div className="entity-top">
                <span className="entity-name">{type}</span>
                <Tag t={tagT}>{rem<=0?'Settled':pct>=50?'Over 50%':'Pending'}</Tag>
              </div>
              <div className="mini-row">
                <MiniBox val={fmt(typeCost)} lbl="Cost"  color="var(--accent)" />
                <MiniBox val={fmt(typePaid)} lbl="Paid"  color="var(--green)" />
                <MiniBox val={fmt(rem)}      lbl="Remaining" color={col} />
              </div>
              <ProgBar pct={pct} color={col} label={`${fmt(qty)} bags · ${pct}% paid`} />
            </div>
          )
        })}
      </Card>

      <Card title="Stock Status">
        {!types.length ? <p className="no-data">No purchase records yet</p> : types.map(type => {
          const { bought, sold, remaining } = getStockByType(type)
          const pct = bought>0 ? Math.min(100,Math.round(remaining/bought*100)) : 0
          const col = remaining<=0?'var(--red)':pct<20?'var(--accent)':'var(--green)'
          const tagT= remaining<=0?'tag-red':pct<20?'tag-gold':'tag-green'
          return (
            <div key={type} className="entity-card">
              <div className="entity-top">
                <span className="entity-name">{type}</span>
                <Tag t={tagT}>{remaining<=0?'Out of Stock':pct<20?'Low Stock':'In Stock'}</Tag>
              </div>
              <div className="mini-row">
                <MiniBox val={fmt(bought)}    lbl="Bought" color="var(--blue)" />
                <MiniBox val={fmt(sold)}      lbl="Sold"   color="var(--accent)" />
                <MiniBox val={fmt(remaining)} lbl="Remaining" color={col} />
              </div>
              <ProgBar pct={pct} color={col} label={`${pct}% remaining`} />
            </div>
          )
        })}
      </Card>

      <Card title="Recent Purchases">
        {!purchases.length ? <p className="no-data">No records yet</p> : purchases.slice(0,5).map(p => (
          <div key={p.id} className="list-row">
            <div>
              <div className="list-main">{p.supplier} <Tag>{p.type}</Tag></div>
              <div className="list-sub">{p.date} · {fmt(p.qty)} bags</div>
            </div>
            <div className="list-amt">{fmt(p.total)} Ks</div>
          </div>
        ))}
      </Card>
    </div>
  )
}

// ─── Purchase ─────────────────────────────────────────────────────────────
function Purchase({ store, toast }) {
  const { purchases, payments, getRiceTypes, addPurchase, delPurchase } = store
  const INIT = { date:today(), supplier:'', type:'', qty:'', weight:'', price:'', transport:'' }
  const [form, setForm]     = useState(INIT)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const price        = parseFloat(form.price)     || 0
  const qty          = parseFloat(form.qty)        || 0
  const weightPerBag = parseFloat(form.weight)     || 0
  const transport    = parseFloat(form.transport)  || 0
  const weightTotal  = weightPerBag * qty
  const transTotal   = transport * qty
  const perBag       = price + transport
  const total        = perBag * qty

  const showPriceFields = qty > 0
  const showSummary     = qty > 0 && price > 0

  const save = () => {
    if (!form.date||!form.supplier||!form.type||!qty||!price) { toast('Fill in required fields'); return }
    addPurchase({ ...form, qty, price, weight:weightTotal, weightPerBag, transport, transportTotal:transTotal, total })
    setForm(INIT); toast('Purchase saved')
  }

  const types = getRiceTypes()
  const rows  = purchases.filter(p=>(!filter||p.type===filter)&&(!search||p.supplier.toLowerCase().includes(search.toLowerCase())||p.type.toLowerCase().includes(search.toLowerCase())))
  const getPaidForType = (type) => payments.filter(p=>p.type===type&&p.category!=='စရံ').reduce((a,p)=>a+p.amount,0)
  const shownTypes = [...new Set(rows.map(r=>r.type))]

  return (
    <div>
      <Card title="New Purchase Entry">
        <div className="form-grid">
          <Field label="Date *">
            <DateTab value={form.date} onChange={e=>set('date',e.target.value)} />
          </Field>
          <Field label="Supplier *">
            <input className="field-input" value={form.supplier} onChange={e=>set('supplier',e.target.value)} placeholder="e.g. မြဝတီဆန်စက်" list="sup-list" />
            <datalist id="sup-list">{[...new Set(purchases.map(p=>p.supplier))].map(s=><option key={s} value={s}/>)}</datalist>
          </Field>
        </div>
        <div className="form-grid">
          <Field label="Rice Type *" full>
            <input className="field-input" value={form.type} onChange={e=>set('type',e.target.value)} placeholder="e.g. ပေါ်ဆန်း" list="type-list" />
            <datalist id="type-list">{types.map(t=><option key={t} value={t}/>)}</datalist>
          </Field>
        </div>
        <div className="form-grid">
          <Field label="Quantity (bags) *" full>
            <input className="field-input" type="number" min="1" value={form.qty} onChange={e=>set('qty',e.target.value)} placeholder="Bags" min="1" />
          </Field>
        </div>

        {showPriceFields && (
          <>
            <div className="step-hint">Qty: {fmt(qty)} bags — Enter per-bag pricing below</div>
            <div className="form-grid">
              <Field label="Price / bag (Ks) *">
                <input className="field-input" type="number" min="0" value={form.price} onChange={e=>set('price',e.target.value)} placeholder="" />
              </Field>
              <Field label="Transport / bag (Ks)">
                <input className="field-input" type="number" min="0" value={form.transport} onChange={e=>set('transport',e.target.value)} placeholder="" />
              </Field>
            </div>
            <div className="form-grid">
              <Field label="Weight / bag (viss)" full>
                <input className="field-input" type="number" min="0" value={form.weight} onChange={e=>set('weight',e.target.value)} placeholder="" />
              </Field>
            </div>
          </>
        )}

        {showSummary && (
          <div className="summary-box">
            <div className="summary-label">Order Summary</div>
            <div className="summary-totals">
              <div className="summary-cell"><div className="sc-num" style={{color:'var(--accent)'}}>{fmt(total)}</div><div className="sc-lbl">Total (Ks)</div></div>
              <div className="summary-cell"><div className="sc-num" style={{color:'var(--blue)'}}>{fmt(qty)}</div><div className="sc-lbl">Bags</div></div>
              <div className="summary-cell"><div className="sc-num" style={{color:'var(--text2)'}}>{fmt(transTotal)}</div><div className="sc-lbl">Transport</div></div>
              <div className="summary-cell"><div className="sc-num" style={{color:'var(--green)'}}>{weightTotal?fmt(weightTotal):'—'}</div><div className="sc-lbl">Viss Total</div></div>
            </div>
            <div className="divider-label"><span>Per bag breakdown</span></div>
            <div className="per-bag-row">
              <div className="pb-cell"><div className="pb-num">{fmt(price)}</div><div className="pb-lbl">Rice (Ks)</div></div>
              <div className="pb-op">+</div>
              <div className="pb-cell"><div className="pb-num" style={{color:'var(--text2)'}}>{fmt(transport)}</div><div className="pb-lbl">Transport</div></div>
              <div className="pb-op">=</div>
              <div className="pb-cell highlight"><div className="pb-num" style={{color:'var(--accent)'}}>{fmt(perBag)}</div><div className="pb-lbl">Cost / bag</div></div>
              {weightPerBag>0&&<><div className="pb-op">·</div><div className="pb-cell"><div className="pb-num" style={{color:'var(--green)'}}>{fmt(weightPerBag)}</div><div className="pb-lbl">Viss / bag</div></div></>}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={()=>setForm(INIT)}>Reset</button>
          <button className="btn btn-primary" onClick={save}>Save Purchase</button>
        </div>
      </Card>

      <Card title="Purchase Records">
        <div className="filter-row">
          <input className="field-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search supplier or type..." />
          <select className="field-input" value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="">All Types</option>
            {types.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>

        {shownTypes.map(type => {
          const tr   = rows.filter(r=>r.type===type)
          const cost = tr.reduce((a,r)=>a+r.total,0)
          const paid = getPaidForType(type)
          const rem  = Math.max(0,cost-paid)
          const pct  = cost>0?Math.min(100,Math.round(paid/cost*100)):0
          const col  = rem<=0?'var(--green)':pct>=50?'var(--blue)':'var(--red)'
          return (
            <div key={type} className="entity-card" style={{marginBottom:8}}>
              <div className="entity-top">
                <span className="entity-name">{type}</span>
                <span style={{fontSize:11,fontWeight:600,color:col,fontFamily:'var(--mono)'}}>{rem<=0?'Settled':`${fmt(rem)} Ks remaining`}</span>
              </div>
              <div className="mini-row">
                <MiniBox val={fmt(cost)} lbl="Cost"  color="var(--accent)" />
                <MiniBox val={fmt(paid)} lbl="Paid"  color="var(--green)" />
                <MiniBox val={fmt(rem)}  lbl="Remaining" color={col} />
              </div>
              <div className="prog"><div className="prog-fill" style={{width:`${pct}%`,background:col}}/></div>
              <div className="prog-label">{pct}% paid</div>
            </div>
          )
        })}

        {!rows.length && <p className="no-data">No records found</p>}
        {rows.map(p => {
          const typeTotalCost = purchases.filter(x=>x.supplier===p.supplier&&x.type===p.type).reduce((a,x)=>a+x.total,0)
          const typePaidAmt   = payments.filter(x=>x.supplier===p.supplier&&x.type===p.type&&x.category!=='စရံ').reduce((a,x)=>a+x.amount,0)
          const typeRem       = Math.max(0, typeTotalCost - typePaidAmt)
          const col           = typeRem<=0?'var(--green)':'var(--red)'
          return (
            <div key={p.id} className="rec-card">
              <div className="rec-head">
                <div>
                  <div className="rec-supplier">{p.supplier}</div>
                  <div className="rec-meta">{p.date} · <span style={{color:'var(--accent)'}}>{p.type}</span></div>
                </div>
                <button className="btn btn-danger" onClick={()=>delPurchase(p.id)}>Delete</button>
              </div>
              <div className="mini-row" style={{marginBottom:8}}>
                <MiniBox val={fmt(p.total)} lbl="Total Ks"   color="var(--accent)" />
                <MiniBox val={fmt(p.qty)}    lbl="Bags"       color="var(--blue)" />
                <MiniBox val={fmt(p.transportTotal||0)} lbl="Transport" color="var(--text2)" />
                <MiniBox val={p.weight?fmt(p.weight):'—'} lbl="Viss" color="var(--green)" />
              </div>
              <div className="rec-per-bag">
                <div className="rpb-item"><span className="rpb-lbl">Price/bag</span><span className="rpb-val">{fmt(p.price)} Ks</span></div>
                <div className="rpb-item"><span className="rpb-lbl">Transport/bag</span><span className="rpb-val">{fmt(p.transport)} Ks</span></div>
                <div className="rpb-item"><span className="rpb-lbl">Cost/bag</span><span className="rpb-val" style={{color:'var(--accent)'}}>{fmt(p.price+p.transport)} Ks</span></div>
                {p.weightPerBag>0&&<div className="rpb-item"><span className="rpb-lbl">Viss/bag</span><span className="rpb-val" style={{color:'var(--green)'}}>{fmt(p.weightPerBag)}</span></div>}
              </div>
              <div className="rec-totals">
                <div className="rec-trow"><span>Paid (this supplier + type)</span><span style={{color:'var(--green)',fontFamily:'var(--mono)',fontWeight:600}}>{fmt(typePaidAmt)} Ks</span></div>
                <div className="rec-trow"><span>Remaining</span><span style={{color:col,fontFamily:'var(--mono)',fontWeight:700,fontSize:13}}>{fmt(typeRem)} Ks</span></div>
              </div>
            </div>
          )
        })}
      </Card>
    </div>
  )
}

// ─── Payment ──────────────────────────────────────────────────────────────
function Payment({ store, toast }) {
  const { purchases,payments,getSuppliers,getTotalForScope,getPaidForScope,getDepositForScope,getPaidByCategoryForScope,getTransportTotalForScope,getRiceCostForScope,addPayment,delPayment } = store
  const [date, setDate]           = useState(today())
  const [supplier, setSupplier]   = useState('')
  const [riceType, setRiceType]   = useState('')
  const [category, setCategory]   = useState('ဆန်ဖိုး')
  const [amount, setAmount]       = useState('')
  const [method, setMethod]       = useState('Cash')
  const [depositFor, setDepositFor] = useState('ဆန်ဖိုး')
  const [confirm, setConfirm]     = useState(null)

  const suppliers = getSuppliers()
  const supplierTypes = useMemo(()=>{
    if(!supplier)return[]
    return[...new Set(purchases.filter(p=>p.supplier===supplier).map(p=>p.type))]
  },[supplier,purchases])

  const thisAmt      = parseFloat(amount)||0
  const scope        = riceType||null
  const orderTotal   = supplier?getTotalForScope(supplier,scope):0
  const alreadyPaid  = supplier?getPaidForScope(supplier,scope):0
  const catPaid      = supplier?getPaidByCategoryForScope(supplier,scope):{}
  const deposit      = supplier?getDepositForScope(supplier,scope):0
  const remaining    = orderTotal-alreadyPaid
  const transOwed    = supplier?getTransportTotalForScope(supplier,scope):0
  const riceOwed     = supplier?getRiceCostForScope(supplier,scope):0
  const ricePaid     = catPaid['ဆန်ဖိုး']||0
  const transPaid    = catPaid['ကားခ']||0
  const riceRem      = Math.max(0,riceOwed-ricePaid)
  const transRem     = Math.max(0,transOwed-transPaid)
  const afterBal     = category==='စရံ'?remaining:remaining-thisAmt

  const handleSave = () => {
    if(!date||!supplier||!thisAmt||thisAmt<=0){toast('Fill in required fields');return}
    setConfirm({date,supplier,type:riceType,category,depositFor:category==='စရံ'?depositFor:null,amount:thisAmt,method,orderTotal,alreadyPaid,afterBal,riceOwed,transportOwed:transOwed})
  }
  const commitPayment = () => {
    addPayment({date:confirm.date,supplier:confirm.supplier,type:confirm.type,category:confirm.category,depositFor:confirm.depositFor,amount:confirm.amount,method:confirm.method})
    setConfirm(null);setSupplier('');setRiceType('');setCategory('ဆန်ဖိုး');setAmount('');setDate(today())
    toast('Payment saved')
  }

  return (
    <div>
      <Card title="New Payment Entry">
        <div className="form-grid">
          <Field label="Date *">
            <DateTab value={date} onChange={e=>setDate(e.target.value)} />
          </Field>
          <Field label="Supplier *">
            <select className="field-input" value={supplier} onChange={e=>{setSupplier(e.target.value);setRiceType('');setAmount('')}}>
              <option value="">— Select Supplier —</option>
              {suppliers.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <div className="form-grid">
          <Field label="Rice Type">
            <select className="field-input" value={riceType} onChange={e=>{setRiceType(e.target.value);setAmount('')}} disabled={!supplier}>
              <option value="">{supplier?'All Types':'Select supplier first'}</option>
              {supplierTypes.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Payment Category *">
            <select className="field-input" value={category} onChange={e=>{setCategory(e.target.value);setAmount('')}} disabled={!supplier}>
              {PAY_CATS.map(c=><option key={c} value={c}>{CAT_LABEL[c]} ({c})</option>)}
            </select>
          </Field>
        </div>

        {category==='စရံ'&&supplier&&(
          <div className="form-grid">
            <Field label="Deposit applies to" full>
              <select className="field-input" value={depositFor} onChange={e=>setDepositFor(e.target.value)}>
                <option value="ဆန်ဖိုး">Rice Cost (ဆန်ဖိုး)</option>
                <option value="ကားခ">Transport (ကားခ)</option>
              </select>
            </Field>
          </div>
        )}

        <div className="form-grid">
          <Field label="Amount (Ks) *">
            <input className="field-input" type="number" min="1" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="" disabled={!supplier} />
          </Field>
          <Field label="Payment Method">
            <select className="field-input" value={method} onChange={e=>setMethod(e.target.value)}>
              <option>Cash</option><option>KPay / Wave</option><option>Check</option><option>Other</option>
            </select>
          </Field>
        </div>

        {supplier&&(
          <div className="pay-panel">
            <div className="pay-panel-title">Balance Breakdown</div>
            <div className="pay-row">
              <span className="pay-row-lbl">Total Cost</span>
              <span style={{color:'var(--accent)',fontWeight:600,fontFamily:'var(--mono)'}}>{fmt(orderTotal)} Ks</span>
            </div>
            <div className="pay-cat-block">
              <div className="pay-cat-top">
                <span>Rice Cost (ဆန်ဖိုး)</span>
                <span style={{color:'var(--accent)',fontFamily:'var(--mono)'}}>{fmt(riceOwed)} Ks</span>
              </div>
              <div className="pay-cat-detail">
                <span>Paid: <strong style={{color:'var(--green)'}}>{fmt(ricePaid)} Ks</strong></span>
                <span>Remaining: <strong style={{color:riceRem<=0?'var(--green)':'var(--red)'}}>{fmt(riceRem)} Ks</strong></span>
              </div>
            </div>
            {transOwed>0&&(
              <div className="pay-cat-block">
                <div className="pay-cat-top">
                  <span>Transport (ကားခ)</span>
                  <span style={{color:'var(--blue)',fontFamily:'var(--mono)'}}>{fmt(transOwed)} Ks</span>
                </div>
                <div className="pay-cat-detail">
                  <span>Paid: <strong style={{color:'var(--green)'}}>{fmt(transPaid)} Ks</strong></span>
                  <span>Remaining: <strong style={{color:transRem<=0?'var(--green)':'var(--blue)'}}>{fmt(transRem)} Ks</strong></span>
                </div>
              </div>
            )}
            {deposit>0&&<div className="pay-row" style={{borderTop:'1px dashed var(--border)',marginTop:6,paddingTop:8}}>
              <span className="pay-row-lbl">Deposit (စရံ) — separate</span>
              <span style={{color:'var(--green)',fontFamily:'var(--mono)'}}>{fmt(deposit)} Ks</span>
            </div>}
            <div className="pay-divider"/>
            <div className="pay-total-row">
              <span style={{fontWeight:600,color:'var(--text)',fontSize:12}}>Total Remaining</span>
              <span style={{color:remaining<=0?'var(--green)':'var(--red)',fontWeight:700,fontSize:14,fontFamily:'var(--mono)'}}>{fmt(remaining)} Ks</span>
            </div>
            {thisAmt>0&&category!=='စရံ'&&(
              <div className="pay-preview">
                <span>After this payment ({CAT_LABEL[category]})</span>
                <span style={{color:afterBal<=0?'var(--green)':'var(--red)',fontWeight:700,fontFamily:'var(--mono)'}}>{fmt(Math.max(0,afterBal))} Ks</span>
              </div>
            )}
            {thisAmt>0&&category==='စရံ'&&(
              <div className="deposit-note">
                Deposit of {fmt(thisAmt)} Ks for {depositFor} — tracked separately, does not reduce balance.
              </div>
            )}
          </div>
        )}

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={()=>{setSupplier('');setRiceType('');setAmount('');setDate(today())}}>Reset</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Payment</button>
        </div>
      </Card>

      <Card title="Supplier Balance Overview">
        {!suppliers.length?<p className="no-data">No suppliers yet</p>:suppliers.map(sup=>{
          const total  = getTotalForScope(sup,null)
          const paid   = getPaidForScope(sup,null)
          const dep    = getDepositForScope(sup,null)
          const cats   = getPaidByCategoryForScope(sup,null)
          const tOwed  = getTransportTotalForScope(sup,null)
          const rOwed  = getRiceCostForScope(sup,null)
          const bal    = Math.max(0,total-paid)
          const pct    = total>0?Math.min(100,Math.round(paid/total*100)):0
          const col    = bal<=0?'var(--green)':pct>=50?'var(--blue)':'var(--red)'
          const tagT   = bal<=0?'tag-green':pct>=50?'tag-blue':'tag-red'
          const rPaid  = cats['ဆန်ဖိုး']||0
          const tPaid  = cats['ကားခ']||0
          return(
            <div key={sup} className="entity-card">
              <div className="entity-top">
                <span className="entity-name">{sup}</span>
                <Tag t={tagT}>{bal<=0?'Settled':pct>=50?'>50% Paid':'Balance Due'}</Tag>
              </div>
              <div className="mini-row">
                <MiniBox val={fmt(total)} lbl="Cost"  color="var(--accent)" />
                <MiniBox val={fmt(paid)}  lbl="Paid"  color="var(--green)" />
                <MiniBox val={fmt(bal)}   lbl="Remaining" color={col} />
              </div>
              <div className="cat-section">
                <div className="cat-row"><span>Rice Cost — owed</span><span style={{color:'var(--accent)',fontFamily:'var(--mono)'}}>{fmt(rOwed)} Ks</span></div>
                <div className="cat-row"><span>Rice Cost — paid</span><span style={{color:'var(--green)',fontFamily:'var(--mono)'}}>{fmt(rPaid)} Ks</span></div>
                <div className="cat-row"><span>Rice Cost — remaining</span><span style={{color:Math.max(0,rOwed-rPaid)<=0?'var(--green)':'var(--red)',fontFamily:'var(--mono)',fontWeight:600}}>{fmt(Math.max(0,rOwed-rPaid))} Ks</span></div>
                {tOwed>0&&<>
                  <div className="cat-sep"/>
                  <div className="cat-row"><span>Transport — owed</span><span style={{color:'var(--blue)',fontFamily:'var(--mono)'}}>{fmt(tOwed)} Ks</span></div>
                  <div className="cat-row"><span>Transport — paid</span><span style={{color:'var(--green)',fontFamily:'var(--mono)'}}>{fmt(tPaid)} Ks</span></div>
                  <div className="cat-row"><span>Transport — remaining</span><span style={{color:Math.max(0,tOwed-tPaid)<=0?'var(--green)':'var(--blue)',fontFamily:'var(--mono)',fontWeight:600}}>{fmt(Math.max(0,tOwed-tPaid))} Ks</span></div>
                </>}
                {dep>0&&<><div className="cat-sep"/><div className="cat-row"><span>Deposit (separate)</span><span style={{color:'var(--green)',fontFamily:'var(--mono)'}}>{fmt(dep)} Ks</span></div></>}
              </div>
              <div className="prog" style={{marginTop:10}}><div className="prog-fill" style={{width:`${pct}%`,background:col}}/></div>
              <div className="prog-label">{pct}% paid</div>
            </div>
          )
        })}
      </Card>

      <Card title="Payment History">
        {!payments.length?<p className="no-data">No payment records yet</p>:(
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Supplier</th><th>Type</th><th>Category</th><th>Amount (Ks)</th><th>Method</th><th></th></tr></thead>
              <tbody>{payments.map(p=>(
                <tr key={p.id}>
                  <td className="mono td-muted">{p.date}</td>
                  <td>{p.supplier}</td>
                  <td>{p.type?<Tag>{p.type}</Tag>:'—'}</td>
                  <td>
                    <span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:3,background:p.category==='ဆန်ဖိုး'?'var(--accent-dim)':p.category==='ကားခ'?'var(--blue-dim)':'var(--green-dim)',color:CAT_COLOR[p.category],border:`1px solid ${p.category==='ဆန်ဖိုး'?'rgba(200,168,75,.2)':p.category==='ကားခ'?'rgba(77,144,214,.2)':'rgba(61,186,111,.2)'}`}}>
                      {CAT_LABEL[p.category]}{p.depositFor?` · ${p.depositFor}`:''}
                    </span>
                  </td>
                  <td className="mono" style={{color:p.category==='စရံ'?'var(--green)':'var(--accent)',fontWeight:600}}>{fmt(p.amount)}</td>
                  <td className="td-muted">{p.method}</td>
                  <td><button className="btn btn-danger" onClick={()=>delPayment(p.id)}>Del</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Card>

      {confirm&&(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">Confirm Payment</div>
              <div className="modal-sub">{confirm.supplier} {confirm.type?`· ${confirm.type}`:''} · {confirm.date}</div>
            </div>
            <div className="modal-rows">
              <div className="modal-row"><span>Total Cost</span><span style={{color:'var(--accent)',fontFamily:'var(--mono)',fontWeight:600}}>{fmt(confirm.orderTotal)} Ks</span></div>
              <div className="modal-row"><span>Rice Cost owed</span><span style={{color:'var(--accent)',fontFamily:'var(--mono)'}}>{fmt(confirm.riceOwed)} Ks</span></div>
              <div className="modal-row"><span>Transport owed</span><span style={{color:'var(--blue)',fontFamily:'var(--mono)'}}>{fmt(confirm.transportOwed)} Ks</span></div>
              <div className="modal-row"><span>Previously paid</span><span style={{color:'var(--green)',fontFamily:'var(--mono)',fontWeight:600}}>{fmt(confirm.alreadyPaid)} Ks</span></div>
              <div className="modal-row modal-row-hl">
                <span>{CAT_LABEL[confirm.category]}{confirm.depositFor?` · ${confirm.depositFor} deposit`:' — this payment'}</span>
                <span style={{color:CAT_COLOR[confirm.category],fontFamily:'var(--mono)',fontWeight:700,fontSize:14}}>{fmt(confirm.amount)} Ks</span>
              </div>
            </div>
            <div className="modal-result" style={{color:confirm.category==='စရံ'?'var(--green)':confirm.afterBal<=0?'var(--green)':'var(--red)'}}>
              {confirm.category==='စရံ'?`Deposit for ${confirm.depositFor} — tracked separately`:confirm.afterBal<=0?'Fully settled':`${fmt(confirm.afterBal)} Ks remaining after payment`}
            </div>
            <div className="modal-method">{confirm.method}</div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setConfirm(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={commitPayment}>Confirm & Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Stock ────────────────────────────────────────────────────────────────
function Stock({ store, toast }) {
  const { purchases, payments, sales, getRiceTypes, getStockByType, addSale, delSale } = store
  const INIT = { date:today(), type:'', qty:'', buyer:'', price:'', transport:'' }
  const [form, setForm] = useState(INIT)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const qty       = parseFloat(form.qty)||0
  const price     = parseFloat(form.price)||0
  const transport = parseFloat(form.transport)||0
  const types     = getRiceTypes()

  const selectedStock = form.type ? getStockByType(form.type) : null
  const stockOk       = selectedStock && selectedStock.remaining > 0

  const save = () => {
    if(!form.date||!form.type||!qty){toast('Fill in required fields');return}
    const stock = getStockByType(form.type)
    if(qty>stock.remaining){toast(`Insufficient stock (${stock.remaining} bags remaining)`);return}
    addSale({...form,qty,price,transport,transportTotal:transport*qty,total:(price+transport)*qty})
    setForm(INIT);toast('Sale recorded')
  }

  return (
    <div>
      <Card title="Record Sale">
        <div className="form-grid">
          <Field label="Date *" full>
            <DateTab value={form.date} onChange={e=>set('date',e.target.value)} />
          </Field>
        </div>
        <div className="form-grid">
          <Field label="Rice Type *" full>
            <select
              className="field-input"
              value={form.type}
              onChange={e=>set('type',e.target.value)}
              style={{
                borderColor: form.type ? (stockOk?'var(--green)':'var(--red)') : 'var(--border2)',
                color: form.type ? 'var(--text)' : 'var(--text3)',
              }}
            >
              <option value="">— Select type —</option>
              {types.map(t=>{
                const st=getStockByType(t)
                return <option key={t} value={t}>{t} ({fmt(st.remaining)} bags)</option>
              })}
            </select>
            {form.type && selectedStock && (
              <div style={{
                marginTop:5, fontSize:11, fontFamily:'var(--mono)',
                color: stockOk ? 'var(--green)' : 'var(--red)',
                background: stockOk ? 'var(--green-dim)' : 'var(--red-dim)',
                border: `1px solid ${stockOk?'rgba(61,186,111,.2)':'rgba(224,85,85,.2)'}`,
                borderRadius:4, padding:'5px 9px',
                display:'flex', justifyContent:'space-between'
              }}>
                <span>Available stock</span>
                <strong>{fmt(selectedStock.remaining)} bags</strong>
              </div>
            )}
          </Field>
        </div>
        <div className="form-grid">
          <Field label="Quantity (bags) *">
            <input className="field-input" type="number" min="1" value={form.qty} onChange={e=>set('qty',e.target.value)} placeholder=""/>
          </Field>
          <Field label="Buyer">
            <input className="field-input" value={form.buyer} onChange={e=>set('buyer',e.target.value)} placeholder=""/>
          </Field>
        </div>
        <div className="form-grid">
          <Field label="Sale Price / bag (Ks)">
            <input className="field-input" type="number" min="0" value={form.price} onChange={e=>set('price',e.target.value)} placeholder=""/>
          </Field>
          <Field label="Transport / bag (Ks)">
            <input className="field-input" type="number" min="0" value={form.transport} onChange={e=>set('transport',e.target.value)} placeholder=""/>
          </Field>
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={()=>setForm(INIT)}>Reset</button>
          <button className="btn btn-primary" onClick={save}>Save Sale</button>
        </div>
      </Card>

      <Card title="Stock Levels">
        {!types.length?<p className="no-data">No purchase records yet</p>:types.map(type=>{
          const{bought,sold,remaining}=getStockByType(type)
          const pct=bought>0?Math.min(100,Math.round(remaining/bought*100)):0
          const col=remaining<=0?'var(--red)':pct<20?'var(--accent)':'var(--green)'
          const tagT=remaining<=0?'tag-red':pct<20?'tag-gold':'tag-green'
          return(
            <div key={type} className="stock-card">
              <div className="stock-head">
                <span style={{fontWeight:600,fontSize:13}}>{type}</span>
                <Tag t={tagT}>{remaining<=0?'Out of Stock':pct<20?'Low Stock':'In Stock'}</Tag>
              </div>
              <div className="stock-section">
                <div className="mini-row">
                  <MiniBox val={fmt(bought)}    lbl="Purchased" color="var(--blue)" />
                  <MiniBox val={fmt(sold)}       lbl="Sold"      color="var(--accent)" />
                  <MiniBox val={fmt(remaining)}  lbl="Remaining" color={col} />
                </div>
                <ProgBar pct={pct} color={col} label={`${pct}% remaining`} />
              </div>
            </div>
          )
        })}
      </Card>

      <Card title="Sales Records">
        {!sales.length?<p className="no-data">No sales recorded yet</p>:(
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Type</th><th>Buyer</th><th>Bags</th><th>Price/bag</th><th>Total (Ks)</th><th></th></tr></thead>
              <tbody>{sales.map(p=>(
                <tr key={p.id}>
                  <td className="mono td-muted">{p.date}</td>
                  <td><Tag>{p.type}</Tag></td>
                  <td>{p.buyer||'—'}</td>
                  <td className="mono">{fmt(p.qty)}</td>
                  <td className="mono td-muted">{p.price?fmt(p.price):'—'}</td>
                  <td className="mono" style={{color:'var(--green)',fontWeight:600}}>{p.total?fmt(p.total):'—'}</td>
                  <td><button className="btn btn-danger" onClick={()=>delSale(p.id)}>Del</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

// ─── Search ───────────────────────────────────────────────────────────────
function Search({ store }) {
  const { purchases, payments, getRiceTypes, getSuppliers } = store
  const [type, setType]     = useState('')
  const [supplier, setSup]  = useState('')
  const types     = getRiceTypes()
  const suppliers = getSuppliers()
  const rows      = purchases.filter(p=>(!type||p.type===type)&&(!supplier||p.supplier===supplier))
  const totalQty  = rows.reduce((a,p)=>a+p.qty,0)
  const totalCost = rows.reduce((a,p)=>a+p.total,0)
  const avgPrice  = totalQty>0?totalCost/totalQty:0
  const typePaid  = type?payments.filter(p=>p.type===type&&(!supplier||p.supplier===supplier)).reduce((a,p)=>a+p.amount,0):0
  const remain    = Math.max(0,totalCost-typePaid)

  return (
    <div>
      <Card title="Search & Filter">
        <div className="form-grid">
          <Field label="Rice Type" full>
            <select className="field-input" value={type} onChange={e=>setType(e.target.value)}>
              <option value="">— Select Rice Type —</option>
              {types.map(t=><option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        <div className="form-grid">
          <Field label="Supplier" full>
            <select className="field-input" value={supplier} onChange={e=>setSup(e.target.value)}>
              <option value="">All Suppliers</option>
              {suppliers.map(s=><option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        {type?(
          <>
            <div className="stat-grid" style={{marginTop:14}}>
              <StatCard value={fmt(totalQty)}  label="Total Bags"     color="gold" />
              <StatCard value={fmt(totalCost)} label="Total Cost"    color="blue" />
              <StatCard value={fmt(avgPrice)}  label="Avg Price/bag" color="green" />
              <StatCard value={fmt(remain)}    label="Remaining"     color="red" />
            </div>
            <div className="table-wrap" style={{marginTop:14}}>
              {!rows.length?<p className="no-data">No records found</p>:(
                <table>
                  <thead><tr><th>Date</th><th>Supplier</th><th>Bags</th><th>Price/bag</th><th>Transport</th><th>Cost/bag</th><th>Total (Ks)</th></tr></thead>
                  <tbody>{rows.map(p=>(
                    <tr key={p.id}>
                      <td className="mono td-muted">{p.date}</td>
                      <td>{p.supplier}</td>
                      <td className="mono">{fmt(p.qty)}</td>
                      <td className="mono td-muted">{fmt(p.price)}</td>
                      <td className="mono td-muted">{fmt(p.transport)}</td>
                      <td className="mono" style={{color:'var(--blue)',fontWeight:600}}>{fmt(p.price+p.transport)}</td>
                      <td className="mono" style={{color:'var(--accent)',fontWeight:600}}>{fmt(p.total)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          </>
        ):<p className="no-data" style={{marginTop:20}}>Select a rice type to begin</p>}
      </Card>
    </div>
  )
}

// ─── App Shell ─────────────────────────────────────────────────────────────
const PAGES = [
  { id:'dashboard', label:'Dashboard',  sub:'ထွန်းဆန်ဆိုင် — Stock Availability' },
  { id:'purchase',  label:'Purchases',  sub:'Purchase Management' },
  { id:'payment',   label:'Payments',   sub:'Payment Management' },
  { id:'stock',     label:'Stock',      sub:'Stock Management' },
  { id:'search',    label:'Search',     sub:'Search & Filter' },
]

export default function App() {
  const store  = useStore()
  const [page, setPage]       = useState('dashboard')
  const [drawer, setDrawer]   = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast]     = useState({ msg:'', show:false })
  const timerRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2200)
    return () => clearTimeout(t)
  }, [])

  const showToast = useCallback((msg) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ msg, show:true })
    timerRef.current = setTimeout(()=>setToast(t=>({...t,show:false})), 2600)
  }, [])

  const goPage = (id) => { setPage(id); setDrawer(false) }
  const cur      = PAGES.find(p=>p.id===page)
  const PageComp = { dashboard:Dashboard, purchase:Purchase, payment:Payment, stock:Stock, search:Search }[page]

  const SidebarContent = () => (
    <>
      <div className="brand">
        <div className="brand-mark">ထွန်းဆန်ဆိုင်</div>
        <div className="brand-name">Stock<br/>Availability</div>
        <div className="brand-sub">Stock Availability App</div>
      </div>
      <nav className="nav">
        {PAGES.map(p=>(
          <div key={p.id} className={`nav-item${page===p.id?' active':''}`} onClick={()=>goPage(p.id)}>
            <div className="nav-dot" />
            {p.label}
          </div>
        ))}
      </nav>
      <div className="nav-footer">v2.0 · Vite + React</div>
    </>
  )

  if (loading) return (
    <>
      <style>{css}{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.6; transform:scale(.96); }
        }
        @keyframes barGrow {
          from { width:0%; }
          to   { width:100%; }
        }
        .splash {
          width:100vw; height:100vh;
          background: var(--ivory);
          display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          font-family: var(--font);
          position:relative;
          overflow:hidden;
        }
        .splash::before {
          content:'';
          position:absolute; top:0; left:0; right:0; height:3px;
          background: linear-gradient(90deg, var(--leather), var(--wheat), var(--leather));
          background-size:200%;
        }
        .splash-logo {
          animation: fadeUp .6s ease both;
          margin-bottom:20px;
          text-align:center;
        }
        .logo-circle {
          width:82px; height:82px;
          border-radius:50%;
          background: var(--surface);
          border:2px solid var(--border2);
          display:flex; align-items:center; justify-content:center;
          margin:0 auto 14px;
          box-shadow: 0 4px 20px rgba(160,120,72,0.15);
          animation: pulse 2s ease-in-out infinite;
        }
        .logo-word {
          font-family: var(--serif);
          font-size:32px;
          font-weight:600;
          color:#C0392B;
          letter-spacing:1px;
          line-height:1;
        }
        .splash-name {
          animation: fadeUp .6s .15s ease both;
          text-align:center;
          margin-bottom:6px;
        }
        .splash-title {
          font-family: var(--serif);
          font-size:26px;
          font-weight:600;
          color:var(--text);
          line-height:1.2;
          letter-spacing:.5px;
        }
        .splash-sub {
          animation: fadeUp .6s .25s ease both;
          font-size:12px;
          color:var(--text3);
          letter-spacing:1.5px;
          text-transform:uppercase;
          margin-bottom:40px;
        }
        .splash-bar-wrap {
          animation: fadeUp .6s .35s ease both;
          width:120px;
          height:2px;
          background:var(--border2);
          border-radius:2px;
          overflow:hidden;
          margin-bottom:48px;
        }
        .splash-bar {
          height:100%;
          background:var(--leather);
          border-radius:2px;
          animation: barGrow 1.8s .4s cubic-bezier(.4,0,.2,1) both;
        }
        .splash-dev {
          animation: fadeUp .6s .45s ease both;
          position:absolute;
          bottom:24px;
          text-align:center;
          font-size:11px;
          color:var(--text3);
          letter-spacing:.4px;
        }
        .splash-dev strong {
          color:var(--leather);
          font-weight:600;
        }
      `}</style>
      <div className="splash">
        <div className="splash-logo">
          <div className="logo-circle">
            <span className="logo-word">ထွန်း</span>
          </div>
        </div>
        <div className="splash-name">
          <div className="splash-title">ထွန်းဆန်ဆိုင်</div>
        </div>
        <div className="splash-sub">Stock Availability App</div>
        <div className="splash-bar-wrap">
          <div className="splash-bar" />
        </div>
        <div className="splash-dev">Developed by <strong>Shane</strong></div>
      </div>
    </>
  )

  return (
    <>
      <style>{css}</style>
      <div className="app">

        {/* Desktop sidebar */}
        <aside className="sidebar">
          <SidebarContent />
        </aside>

        {/* Mobile drawer overlay */}
        <div className={`drawer-overlay${drawer?' open':''}`} onClick={()=>setDrawer(false)} />

        {/* Mobile sidebar drawer */}
        <div className={`sidebar-drawer${drawer?' open':''}`}>
          <SidebarContent />
        </div>

        <div className="main">
          <div className="topbar">
            <button className="ham-btn" onClick={()=>setDrawer(v=>!v)}>
              <span/><span/><span/>
            </button>
            <span className="page-title">{cur.label}</span>
            <span className="page-sub">{cur.sub}</span>
          </div>
          <div className="content">
            <PageComp store={store} toast={showToast} />
          </div>
        </div>

        <nav className="bnav">
          {PAGES.map(p=>(
            <div key={p.id} className={`bnav-item${page===p.id?' bnav-active':''}`} onClick={()=>goPage(p.id)}>
              <div className="bnav-pip" />
              <span className="bnav-label">{p.label}</span>
            </div>
          ))}
        </nav>

        <div className={`toast${toast.show?' toast-show':''}`}>{toast.msg}</div>
      </div>
    </>
  )
}
