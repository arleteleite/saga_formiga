type Filho = Node | string | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  atributos: Record<string, string> = {},
  ...filhos: Filho[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(atributos)) {
    if (k === 'class') el.className = v;
    else el.setAttribute(k, v);
  }
  for (const f of filhos) {
    if (f === null || f === undefined || f === false) continue;
    el.append(f);
  }
  return el;
}

export function botao(rotulo: string, aoClicar: () => void, classe = 'btn'): HTMLButtonElement {
  const b = h('button', { class: classe, type: 'button' }, rotulo);
  b.addEventListener('click', aoClicar);
  return b;
}
