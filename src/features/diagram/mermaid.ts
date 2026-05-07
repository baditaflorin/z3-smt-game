let counter = 0;

export async function renderMermaid(
  source: string,
  target: HTMLElement,
): Promise<void> {
  const mermaid = await import("mermaid");
  mermaid.default.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    themeVariables: {
      fontFamily: "Inter, system-ui, sans-serif",
      primaryColor: "#f6f3e7",
      primaryTextColor: "#15251f",
      primaryBorderColor: "#15251f",
      lineColor: "#2c6f62",
      secondaryColor: "#d8efe8",
      tertiaryColor: "#ffe1bd",
    },
  });

  const id = `z3-smt-diagram-${counter++}`;
  const { svg } = await mermaid.default.render(id, source);
  target.innerHTML = svg;
}
