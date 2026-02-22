type CodeBlockProps = {
  code: string;
  title?: string;
};

export default function CodeBlock({ code, title }: CodeBlockProps) {
  return (
    <div className="terminal overflow-hidden">
      {title && (
        <div className="terminal-bar">
          <span className="font-mono text-xs text-text-faint">{title}</span>
        </div>
      )}
      <div className="terminal-body">
        <pre className="overflow-x-auto text-sm leading-relaxed text-text-muted">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
