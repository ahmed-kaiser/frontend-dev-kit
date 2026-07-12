import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PxRemState } from "../../types";
import { buildCSS, buildHTML, freshState } from "../../lib/pxRemModel";
import Topbar from "../Topbar";
import Toast from "../Toast";
import Controls from "./Controls";
import Preview from "./Preview";
import CodePanel from "../CodePanel";
import "./PxRemTool.css";

export type Update = (fn: (draft: PxRemState) => void) => void;

interface History {
  past: PxRemState[];
  present: PxRemState;
  future: PxRemState[];
}

const HISTORY_LIMIT = 100;
const COALESCE_MS = 450; // merge rapid consecutive edits into one undo step

export default function PxRemTool() {
  const [hist, setHist] = useState<History>(() => ({ past: [], present: freshState(), future: [] }));
  const [toast, setToast] = useState({ message: "", show: false });
  const lastTs = useRef(0);

  const S = hist.present;

  const flash = useCallback((message: string) => {
    setToast({ message, show: true });
    window.setTimeout(() => setToast((t) => ({ ...t, show: false })), 1400);
  }, []);

  const commit = useCallback((producer: (prev: PxRemState) => PxRemState, force = false) => {
    setHist((h) => {
      const now = Date.now();
      const shouldPush = force || now - lastTs.current > COALESCE_MS;
      lastTs.current = now;
      const present = producer(h.present);
      return {
        past: shouldPush ? [...h.past, h.present].slice(-HISTORY_LIMIT) : h.past,
        present,
        future: [],
      };
    });
  }, []);

  const update: Update = useCallback((fn) => {
    commit((prev) => {
      const d = structuredClone(prev) as PxRemState;
      fn(d);
      return d;
    });
  }, [commit]);

  const undo = useCallback(() => {
    setHist((h) => {
      if (!h.past.length) return h;
      lastTs.current = 0;
      const prev = h.past[h.past.length - 1];
      return { past: h.past.slice(0, -1), present: prev, future: [h.present, ...h.future].slice(0, HISTORY_LIMIT) };
    });
  }, []);

  const redo = useCallback(() => {
    setHist((h) => {
      if (!h.future.length) return h;
      lastTs.current = 0;
      const next = h.future[0];
      return { past: [...h.past, h.present].slice(-HISTORY_LIMIT), present: next, future: h.future.slice(1) };
    });
  }, []);

  const reset = useCallback(() => {
    commit(() => freshState(), true);
    flash("Reset to defaults");
  }, [commit, flash]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((k === "z" && e.shiftKey) || k === "y") { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const css = useMemo(() => buildCSS(S), [S]);
  const html = useMemo(() => buildHTML(S), [S]);

  const copy = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    flash(label + " copied!");
  }, [flash]);

  return (
    <div className="main">
      <Topbar
        title="PX ↔ REM"
        desc="Pixel / rem converter"
        canUndo={hist.past.length > 0}
        canRedo={hist.future.length > 0}
        onUndo={undo}
        onRedo={redo}
        onReset={reset}
        onCopy={() => copy(css + "\n\n" + html, "Full code")}
      />
      <div className="workspace">
        <div className="controls">
          <Controls S={S} update={update} />
        </div>
        <div className="output">
          <Preview S={S} update={update} onCopy={copy} />
          <CodePanel css={css} html={html} onCopy={copy} />
        </div>
      </div>
      <Toast message={toast.message} show={toast.show} />
    </div>
  );
}
