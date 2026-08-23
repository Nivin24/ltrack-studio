import React, { useRef } from 'react';

export interface CollaboratorTag {
  name: string;
  color?: string;
  isEditing?: boolean;
}

interface PythonCodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  height?: string;
  readOnly?: boolean;
  activeBorderColor?: string;
}

// Highlight Python syntax tokens with color classification
export function highlightPythonCode(code: string): React.ReactNode[] {
  const lines = code.split('\n');

  return lines.map((line, lineIdx) => {
    // Tokenize line with regex capturing strings, comments, words, numbers, and symbols
    const tokenRegex = /(#.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b(?:async|await|def|from|import|try|except|finally|yield|return|if|elif|else|while|for|in|class|with|as|pass|raise|lambda|assert|break|continue)\b)|(\b(?:AsyncGenerator|AsyncSession|Session|dict|list|set|tuple|str|int|float|bool|None|True|False|sum|len|math|range|print|round|next|close|zip|object|re|math|isinstance|match)\b)|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_]\w*(?=\s*\())|([{}()[\]:.,+\-*/=<>!&|]+)|(\s+)|([a-zA-Z_]\w*)/g;

    const elements: React.ReactNode[] = [];
    let match: RegExpExecArray | null;
    let keyIdx = 0;

    while ((match = tokenRegex.exec(line)) !== null) {
      const [
        fullMatch,
        comment,
        stringLit,
        keyword,
        builtinType,
        numberLit,
        funcName,
        symbol,
        whitespace,
        identifier
      ] = match;

      const key = `${lineIdx}-${keyIdx++}`;

      if (comment) {
        elements.push(
          <span key={key} style={{ color: '#736d65', fontStyle: 'italic' }}>
            {comment}
          </span>
        );
      } else if (stringLit) {
        elements.push(
          <span key={key} style={{ color: '#34d399', fontWeight: 500 }}>
            {stringLit}
          </span>
        );
      } else if (keyword) {
        elements.push(
          <span key={key} style={{ color: '#e58872', fontWeight: 700 }}>
            {keyword}
          </span>
        );
      } else if (builtinType) {
        elements.push(
          <span key={key} style={{ color: '#38bdf8', fontWeight: 600 }}>
            {builtinType}
          </span>
        );
      } else if (numberLit) {
        elements.push(
          <span key={key} style={{ color: '#fbbf24', fontWeight: 600 }}>
            {numberLit}
          </span>
        );
      } else if (funcName) {
        elements.push(
          <span key={key} style={{ color: '#e5b982', fontWeight: 600 }}>
            {funcName}
          </span>
        );
      } else if (symbol) {
        elements.push(
          <span key={key} style={{ color: '#c4b5a0' }}>
            {symbol}
          </span>
        );
      } else if (whitespace) {
        elements.push(
          <span key={key}>
            {whitespace}
          </span>
        );
      } else if (identifier) {
        elements.push(
          <span key={key} style={{ color: '#eae6e1' }}>
            {identifier}
          </span>
        );
      } else {
        elements.push(fullMatch);
      }
    }

    return (
      <div key={lineIdx} style={{ minHeight: '1.5em', display: 'flex' }}>
        <span style={{ display: 'inline-block', width: '100%' }}>
          {elements.length > 0 ? elements : '\u00A0'}
        </span>
      </div>
    );
  });
}

export const PythonCodeEditor: React.FC<PythonCodeEditorProps> = ({
  code,
  onChange,
  onKeyDown,
  height = '360px',
  readOnly = false,
  activeBorderColor
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const linesCount = Math.max(1, code.split('\n').length);
  const lineNumbers = Array.from({ length: linesCount }, (_, i) => i + 1);

  // Sync scroll position between textarea, highlighted pre, and line numbers gutter
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = target.scrollTop;
      preRef.current.scrollLeft = target.scrollLeft;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = target.scrollTop;
    }
  };

  // Handle Tab indentation inside textarea
  const handleKeyDownInternal = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const updatedCode = code.substring(0, start) + '    ' + code.substring(end);

      onChange(updatedCode);

      // Restore cursor position after state re-render
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
      return;
    }

    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: height === '100%' ? '100%' : height,
        minHeight: '180px',
        background: '#0a0a0e',
        border: activeBorderColor
          ? `1px solid ${activeBorderColor}80`
          : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: activeBorderColor
          ? `0 0 20px ${activeBorderColor}18, inset 0 1px 0 0 rgba(255, 255, 255, 0.08)`
          : 'none',
        borderRadius: '12px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, "Fira Code", "Courier New", monospace',
        fontSize: '0.84rem',
        lineHeight: 1.55,
        boxSizing: 'border-box',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease'
      }}
    >
      {/* Line Numbers Gutter */}
      <div
        ref={lineNumbersRef}
        aria-hidden="true"
        style={{
          width: '44px',
          padding: '16px 0',
          background: 'rgba(0, 0, 0, 0.35)',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
          color: 'rgba(255, 255, 255, 0.22)',
          textAlign: 'right',
          userSelect: 'none',
          overflow: 'hidden',
          flexShrink: 0
        }}
      >
        {lineNumbers.map((num) => (
          <div key={num} style={{ paddingRight: '12px', minHeight: '1.55em' }}>
            {num}
          </div>
        ))}
      </div>

      {/* Editor Content Area (Layered Pre for syntax colors + Transparent Textarea for typing) */}
      <div style={{ position: 'relative', flex: 1, height: '100%', overflow: 'hidden' }}>
        {/* Layer 1: Syntax Highlighted Preview */}
        <pre
          ref={preRef}
          aria-hidden="true"
          style={{
            margin: 0,
            padding: '16px',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            whiteSpace: 'pre',
            wordWrap: 'normal',
            tabSize: 4
          }}
        >
          {highlightPythonCode(code)}
        </pre>

        {/* Layer 2: Editable Transparent Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDownInternal}
          onScroll={handleScroll}
          readOnly={readOnly}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          style={{
            margin: 0,
            padding: '16px',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'transparent',
            color: 'transparent', // Text is rendered by the highlighted pre layer below
            caretColor: activeBorderColor || '#d4a373', // Vibrant primary cursor color
            border: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            whiteSpace: 'pre',
            wordWrap: 'normal',
            tabSize: 4,
            resize: 'none',
            overflow: 'auto',
            zIndex: 2
          }}
          placeholder="Type Python code here..."
        />
      </div>
    </div>
  );
};
