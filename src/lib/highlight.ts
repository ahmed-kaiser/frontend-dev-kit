/* tiny CSS/HTML syntax highlighters -> HTML strings for dangerouslySetInnerHTML */
export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function hlCSS(code: string): string {
  return code.split("\n").map((line) => {
    const t = line.trim();
    if (t.startsWith("@media")) {
      return line.replace(/(@media)(.*?)(\{)/, (_m, a, b, c) =>
        `<span class="tok-at">${a}</span><span class="tok-val">${esc(b)}</span><span class="tok-punc">${c}</span>`);
    }
    if (t.endsWith("{")) {
      return line.replace(/(\.[\w-]+)/g, '<span class="tok-sel">$1</span>').replace(/(\{)/, '<span class="tok-punc">$1</span>');
    }
    if (t === "}") return line.replace(/(\})/, '<span class="tok-punc">$1</span>');
    const m = line.match(/^(\s*)([\w-]+):\s*(.+);$/);
    if (m) {
      return `${m[1]}<span class="tok-prop">${m[2]}</span><span class="tok-punc">:</span> <span class="tok-val">${esc(m[3])}</span><span class="tok-punc">;</span>`;
    }
    return esc(line);
  }).join("\n");
}

export function hlHTML(code: string): string {
  return esc(code)
    .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="tok-tag">$2</span>')
    .replace(/([\w-]+)=(&quot;[^&]*&quot;)/g, '<span class="tok-attr">$1</span>=<span class="tok-val">$2</span>');
}
