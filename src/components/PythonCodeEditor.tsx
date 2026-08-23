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
    // Tokenize line with regex capturing strings (closed & unclosed), comments, words, numbers, and symbols
    const tokenRegex = /(#.*$)|("""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:\\.|[^"\\])*(?:"|$)|'(?:\\.|[^'\\])*(?:'|$))|(\b(?:async|await|def|from|import|try|except|finally|yield|return|if|elif|else|while|for|in|class|with|as|pass|raise|lambda|assert|break|continue)\b)|(\b(?:AsyncGenerator|AsyncSession|Session|dict|list|set|tuple|str|int|float|bool|None|True|False|sum|len|math|range|print|round|next|close|zip|object|re|math|isinstance|match)\b)|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_]\w*(?=\s*\())|([{}()[\]:.,+\-*/=<>!&|^~%@;]+)|(\s+)|([a-zA-Z_]\w*)|(.)/g;

    const elements: React.ReactNode[] = [];
    let match: RegExpExecArray | null;
    let keyIdx = 0;

    while ((match = tokenRegex.exec(line)) !== null) {
      const [
        token,
        comment,
        str,
        keyword,
        builtin,
        num,
        funcCall,
        symbol,
        whitespace,
        ident,
        otherChar
      ] = match;

      const key = `${lineIdx}_${keyIdx++}`;

      if (comment) {
        elements.push(
          <span key={key} style={{ color: '#6e7681', fontStyle: 'italic' }}>
            {comment}
          </span>
        );
      } else if (str) {
        elements.push(
          <span key={key} style={{ color: '#a5d6ff' }}>
            {str}
          </span>
        );
      } else if (keyword) {
        elements.push(
          <span key={key} style={{ color: '#ff7b72', fontWeight: 600 }}>
            {keyword}
          </span>
        );
      } else if (builtin) {
        elements.push(
          <span key={key} style={{ color: '#79c0ff', fontWeight: 600 }}>
            {builtin}
          </span>
        );
      } else if (num) {
        elements.push(
          <span key={key} style={{ color: '#79c0ff' }}>
            {num}
          </span>
        );
      } else if (funcCall) {
        elements.push(
          <span key={key} style={{ color: '#d2a8ff', fontWeight: 500 }}>
            {funcCall}
          </span>
        );
      } else if (symbol) {
        elements.push(
          <span key={key} style={{ color: '#ff7b72' }}>
            {symbol}
          </span>
        );
      } else if (whitespace) {
        elements.push(<span key={key}>{whitespace}</span>);
      } else if (ident) {
        elements.push(
          <span key={key} style={{ color: '#e6edf3' }}>
            {ident}
          </span>
        );
      } else if (otherChar) {
        elements.push(
          <span key={key} style={{ color: '#eae6e1' }}>
            {otherChar}
          </span>
        );
      } else {
        elements.push(<span key={key}>{token}</span>);
      }
    }

    if (elements.length === 0) {
      elements.push(<span key={`empty_${lineIdx}`}>&nbsp;</span>);
    }

    return (
      <div key={lineIdx} style={{ minHeight: '1.55em' }}>
        {elements}
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

  // Python IDE Smart Auto-Indentation & Keyboard Engine
  const handleKeyDownInternal = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // 1. Enter Key: Python Smart Auto-Indentation (after colons :, inside brackets, etc.)
    if (e.key === 'Enter') {
      e.preventDefault();

      const beforeCursor = code.substring(0, start);
      const afterCursor = code.substring(end);
      const lines = beforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];

      // Extract leading indentation spaces from current line
      const indentMatch = currentLine.match(/^(\s*)/);
      let indent = indentMatch ? indentMatch[1] : '';

      // If line ends with a colon `:`, auto-indent by 4 spaces
      const trimmedLine = currentLine.trim();
      const needsColonIndent = trimmedLine.endsWith(':');
      if (needsColonIndent) {
        indent += '    ';
      }

      // Check if cursor is between matching braces/brackets ({|}, [|], (|))
      const charBefore = beforeCursor.slice(-1);
      const charAfter = afterCursor.slice(0, 1);
      const isBetweenBrackets =
        (charBefore === '{' && charAfter === '}') ||
        (charBefore === '[' && charAfter === ']') ||
        (charBefore === '(' && charAfter === ')');

      let updatedCode = '';
      let newCursorPos = start + 1 + indent.length;

      if (isBetweenBrackets) {
        // Create extra indented middle line and put closing bracket on a new line
        const extraIndent = indent + '    ';
        updatedCode = `${beforeCursor}\n${extraIndent}\n${indentMatch ? indentMatch[1] : ''}${afterCursor}`;
        newCursorPos = start + 1 + extraIndent.length;
      } else {
        updatedCode = `${beforeCursor}\n${indent}${afterCursor}`;
      }

      onChange(updatedCode);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newCursorPos;
        }
      }, 0);
      return;
    }

    // 2. Tab Key: Smart Indent / Multi-line Block Indent / Shift+Tab Unindent
    if (e.key === 'Tab') {
      e.preventDefault();

      // Multi-line selection indent/unindent
      if (start !== end && code.substring(start, end).includes('\n')) {
        const lineStart = code.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = code.indexOf('\n', end);
        const endPos = lineEnd === -1 ? code.length : lineEnd;

        const selectedText = code.substring(lineStart, endPos);
        const selectedLines = selectedText.split('\n');

        let modifiedText = '';
        if (e.shiftKey) {
          // Unindent all selected lines by up to 4 spaces
          modifiedText = selectedLines
            .map((line) => line.replace(/^ {1,4}/, ''))
            .join('\n');
        } else {
          // Indent all selected lines by 4 spaces
          modifiedText = selectedLines.map((line) => '    ' + line).join('\n');
        }

        const updatedCode = code.substring(0, lineStart) + modifiedText + code.substring(endPos);
        onChange(updatedCode);

        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = lineStart;
            textareaRef.current.selectionEnd = lineStart + modifiedText.length;
          }
        }, 0);
        return;
      }

      // Single line Shift+Tab unindent
      if (e.shiftKey) {
        const lineStart = code.lastIndexOf('\n', start - 1) + 1;
        const currentLine = code.substring(lineStart, start);
        if (currentLine.startsWith('    ')) {
          const updatedCode = code.substring(0, lineStart) + currentLine.substring(4) + code.substring(start);
          onChange(updatedCode);
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = Math.max(lineStart, start - 4);
            }
          }, 0);
        }
        return;
      }

      // Single line 4-space Tab insert
      const updatedCode = code.substring(0, start) + '    ' + code.substring(end);
      onChange(updatedCode);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
      return;
    }

    // 3. Smart Backspace: Remove 4 spaces at once if at indentation boundary
    if (e.key === 'Backspace' && start === end) {
      const beforeCursor = code.substring(0, start);
      const lineStart = beforeCursor.lastIndexOf('\n') + 1;
      const currentLineBeforeCursor = beforeCursor.substring(lineStart);

      if (currentLineBeforeCursor.length > 0 && currentLineBeforeCursor.length % 4 === 0 && /^ +$/.test(currentLineBeforeCursor)) {
        e.preventDefault();
        const updatedCode = code.substring(0, start - 4) + code.substring(end);
        onChange(updatedCode);

        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start - 4;
          }
        }, 0);
        return;
      }
    }

    // 4. Auto-Close Pairs: ( ), [ ], { }, " ", ' '
    const pairMap: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'"
    };

    if (pairMap[e.key] && !readOnly) {
      const closingChar = pairMap[e.key];
      // If user selected text, wrap selection with pair
      if (start !== end) {
        e.preventDefault();
        const selectedText = code.substring(start, end);
        const updatedCode = code.substring(0, start) + e.key + selectedText + closingChar + code.substring(end);
        onChange(updatedCode);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start + 1;
            textareaRef.current.selectionEnd = end + 1;
          }
        }, 0);
        return;
      }
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
