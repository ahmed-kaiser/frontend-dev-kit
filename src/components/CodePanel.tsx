import { useState } from "react";
import { hlCSS, hlHTML } from "../lib/highlight";
import "./CodePanel.css";

interface Props {
  css: string;
  html: string;
  onCopy: (text: string, label: string) => void;
}

export default function CodePanel({ css, html, onCopy }: Props) {
  const [tab, setTab] = useState<"css" | "html">("css");
  const active = tab === "css" ? css : html;
  const highlighted = tab === "css" ? hlCSS(css) : hlHTML(html);

  return (
    <div className="code-wrap">
      <div className="code-tabs">
        <div className={"code-tab" + (tab === "css" ? " on" : "")} onClick={() => setTab("css")}>CSS</div>
        <div className={"code-tab" + (tab === "html" ? " on" : "")} onClick={() => setTab("html")}>HTML</div>
        <div className="spacer" />
        <button className="btn ghost" onClick={() => onCopy(active, tab.toUpperCase())}>⧉ Copy</button>
      </div>
      <div className="code-body">
        <pre dangerouslySetInnerHTML={{ __html: highlighted }} />
      </div>
    </div>
  );
}
