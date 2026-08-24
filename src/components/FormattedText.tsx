import React from 'react';

/**
 * Reusable FormattedText Component
 * Finds all `inline code` backtick spans and formats them into stylish highlighted code boxes
 * with Python syntax coloring matching the Flashcards & Code Sandbox theme.
 */
export const FormattedText: React.FC<{
  text: string;
  className?: string;
  style?: React.CSSProperties;
  codeStyle?: React.CSSProperties;
}> = ({ text, className, style, codeStyle }) => {
  if (!text) return null;

  const parts = text.split(/(`[^`]+`)/g);

  const highlightInlineCode = (code: string) => {
    // Check if code contains python keywords, types, or operators
    const tokens = code.split(/(#.*$|f?"(?:\\.|[^"\\])*"|f?'(?:\\.|[^'\\])*'|\b(?:async|def|await|import|from|return|class|yield|with|if|elif|else|try|except|finally|for|while|in|as|pass|raise|break|continue|True|False|None)\b|\b(?:print|range|len|type|int|str|dict|list|set|tuple|float|bool|Depends|BaseModel|FastAPI|APIRouter|Session|select|func|Vector|Embeddings)\b|[{}()[\]:.,=+\-*/%><!&|^~]+)/g);

    return tokens.map((token, i) => {
      if (!token) return null;
      if (/^(async|def|await|import|from|return|class|yield|with|if|elif|else|try|except|finally|for|while|in|as|pass|raise|break|continue|True|False|None)$/.test(token)) {
        return <span key={i} style={{ color: '#f87171', fontWeight: 700 }}>{token}</span>;
      }
      if (/^(print|range|len|type|int|str|dict|list|set|tuple|float|bool|Depends|BaseModel|FastAPI|APIRouter|Session|select|func|Vector|Embeddings)$/.test(token) || /^\d+(\.\d+)?$/.test(token)) {
        return <span key={i} style={{ color: '#60a5fa', fontWeight: 700 }}>{token}</span>;
      }
      if (/^[{}()[\]:.,=+\-*/%><!&|^~]+$/.test(token)) {
        return <span key={i} style={{ color: '#f87171' }}>{token}</span>;
      }
      if (token.startsWith('"') || token.startsWith("'")) {
        return <span key={i} style={{ color: '#a7f3d0' }}>{token}</span>;
      }
      return <span key={i} style={{ color: '#eae6e1' }}>{token}</span>;
    });
  };

  return (
    <span className={className} style={{ display: 'inline', ...style }}>
      {parts.map((part, idx) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          const codeContent = part.slice(1, -1);
          return (
            <code
              key={idx}
              className="inline-code-box"
              style={{
                display: 'inline-block',
                background: 'rgba(212, 163, 115, 0.14)',
                border: '1px solid rgba(212, 163, 115, 0.35)',
                color: '#d4a373',
                borderRadius: '6px',
                padding: '1px 6px',
                fontSize: '0.86em',
                fontFamily: "'Fira Code', ui-monospace, SFMono-Regular, monospace",
                fontWeight: 600,
                margin: '0 3px',
                verticalAlign: 'baseline',
                letterSpacing: '-0.01em',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.25)',
                ...codeStyle
              }}
            >
              {highlightInlineCode(codeContent)}
            </code>
          );
        }

        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
};
