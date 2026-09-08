#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

function walkDir(dir, cb) {
const entries = fs.readdirSync(dir, { withFileTypes: true });
for (const ent of entries) {
const full = path.join(dir, ent.name);
if (ent.isDirectory()) walkDir(full, cb);
else cb(full);
}
}

function extractScriptsFromHtml(source) {
const scripts = [];
const re = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = re.exec(source)) !== null) {
    const before = source.slice(0, match.index);
    const startLine = before.split('\n').length;
    scripts.push({ code: match[1], startLine });
    }
    return scripts;
    }

    function detectInAst(node) {
    if (!node || typeof node !== 'object') return false;
    const typesThatMayThrow = new Set([
    'ThrowStatement',
    'CallExpression',
    'NewExpression',
    'AwaitExpression',
    'YieldExpression',
    'ImportExpression',
    'TaggedTemplateExpression',
    ]);
    if (typesThatMayThrow.has(node.type)) return true;
    for (const k of Object.keys(node)) {
    const v = node[k];
    if (Array.isArray(v)) {
    for (const item of v) if (detectInAst(item)) return true;
    } else if (v && typeof v === 'object') {
    if (detectInAst(v)) return true;
    }
    }
    return false;
    }

    function findTryIssues(ast, report) {
    function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'TryStatement') {
    const block = node.block;
    const canThrow = detectInAst(block);
    if (!canThrow) {
    report(node);
    }
    }
    for (const k of Object.keys(node)) {
    const v = node[k];
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') walk(v);
    }
    }
    walk(ast);
    }

    function parseAndReport(code, file, lineOffset = 0) {
    let ast;
    try {
    ast = parser.parse(code, {
    sourceType: 'unambiguous',
    plugins: [
    'jsx',
    'classProperties',
    'optionalChaining',
    'nullishCoalescingOperator',
    'dynamicImport',
    'topLevelAwait',
    ],
    errorRecovery: true,
    ranges: false,
    locations: true,
    });
    } catch (e) {
    console.error(`parse error ${file}: ${e.message}`);
    return 0;
    }

    const issues = [];
    findTryIssues(ast, (node) => {
    const loc = node.loc && node.loc.start ? node.loc.start : { line: 1, column: 0 };
    issues.push({ line: loc.line + lineOffset, column: loc.column });
    });

    for (const it of issues) {
    console.log(
    `${file}:${it.line}:${it.column} — try block appears to contain no throws/calls/new/await`
    );
    }
    return issues.length;
    }

    function shouldCheckFile(file) {
    return (
    file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs') || file.endsWith('.html')
    );
    }

    function main() {
    const args = process.argv.slice(2);
    const root = args[0] || 'src';
    const absRoot = path.resolve(process.cwd(), root);
    if (!fs.existsSync(absRoot)) {
    console.error('Path not found:', absRoot);
    process.exit(2);
    }
    let total = 0;
    walkDir(absRoot, (file) => {
    if (!shouldCheckFile(file)) return;
    const src = fs.readFileSync(file, 'utf8');
    if (file.endsWith('.html')) {
    const scripts = extractScriptsFromHtml(src);
    for (const s of scripts) {
    total += parseAndReport(s.code, `${file} (inline script)`, s.startLine - 1);
    }
    } else {
    total += parseAndReport(src, file);
    }
    });

    if (total > 0) {
    console.log(`\nFound ${total} try-block(s) that look like they cannot throw.`);
    process.exit(1);
    } else {
    console.log('No obvious useless try-blocks found.');
    process.exit(0);
    }
    }

    if (require.main === module) main();
