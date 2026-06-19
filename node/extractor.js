/**
 * google-ai-extractor.js
 * Google Search AI Mode HTML → Markdown / Chat JSON 변환기 (Node.js)
 *
 * 사용법 (CLI):
 *   node google-ai-extractor.js input.html              → JSON 출력 (stdout)
 *   node google-ai-extractor.js input.html output.json  → JSON 파일 저장
 *   node google-ai-extractor.js input.html --md         → 마크다운 출력
 *
 * 사용법 (모듈):
 *   const { extractChat, extractMarkdown } = require('./google-ai-extractor');
 *   const chat = extractChat(htmlString);   // [{role, parts:[{text}]}, ...]
 *   const md   = extractMarkdown(htmlString); // 전체 대화 마크다운 문자열
 */

'use strict';

const { JSDOM }  = require('jsdom');
const fs         = require('fs');
const path       = require('path');

// ─────────────────────────────────────────────────────────────
// § 마크다운 변환 핵심 로직
// ─────────────────────────────────────────────────────────────
function buildConverter(document) {
    const STOP = new Set([
        'Jd31eb','IPFD1d','xqrfzf','b8PhZd',
        'alk4p','q4PqPb','LIBz9e','P8PNlb','IeADvc','ntxe','Fsg96',
    ]);

    // 소스 카드 수집 (페이지 전체)
    const sourceCards = {};
    document.querySelectorAll('div.b8PhZd').forEach(card => {
        const srcId = card.dataset && card.dataset.srcId;
        const link  = card.querySelector('a[href]');
        if (!srcId || !link) return;
        const href  = link.getAttribute('href') || '';
        const texts = [...card.querySelectorAll('*')]
            .flatMap(el => [...el.childNodes])
            .filter(n => n.nodeType === 3
                      && n.textContent.trim().length > 3
                      && !n.textContent.includes('http'))
            .map(n => n.textContent.trim());
        sourceCards[srcId] = { url: href, title: texts[0] || href };
    });

    // ── 노드 변환 ──────────────────────────────────────────────
    function ch(el, depth = 0) {
        return [...el.childNodes].map(n => nd(n, depth)).join('');
    }

    function nd(el, depth = 0) {
        // 텍스트 노드
        if (el.nodeType === 3) {
            const t = el.textContent;
            return t.includes('TgQPHd') ? '' : t;
        }
        // 주석 노드
        if (el.nodeType === 8) return '';
        // 엘리먼트 노드만
        if (el.nodeType !== 1) return '';

        const tag = el.tagName.toLowerCase();
        const cls = el.classList || { contains: () => false };
        const clsArr = el.getAttribute('class')
            ? el.getAttribute('class').split(/\s+/)
            : [];
        const clsSet = new Set(clsArr);

        // 숨김
        const style = el.getAttribute('style') || '';
        if (style.includes('display:none') || style.includes('display: none')) return '';
        if (el.getAttribute('aria-hidden') === 'true') return '';

        // 무시 태그
        if (['script','style','noscript','svg','path','button'].includes(tag)) return '';

        // STOP 클래스
        if (clsArr.some(c => STOP.has(c))) return '';

        // 응답 종료 경계
        if (tag === 'div' && clsArr.length === 0) {
            const peek = (el.textContent || '').slice(0, 30);
            if (peek.includes('Share public link')) return '';
        }

        // ── 헤딩 ──
        if (cls.contains('otQkpb'))
            return `\n\n## ${el.textContent.trim()}\n\n`;

        // ── 코드 블록 ──
        if (cls.contains('r1PmQe') || cls.contains('pHpOfb')) {
            const lg = el.querySelector('.vVRw1d');
            const ce = el.querySelector('code') || el.querySelector('pre');
            const lang = lg ? lg.textContent.trim().toLowerCase() : '';
            const code = ce ? ce.textContent.trim() : '';
            return `\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
        }

        // ── 인라인 코드 ──
        if (tag === 'code' && cls.contains('KDcb0c'))
            return `\`${el.textContent.trim()}\``;

        if (tag === 'pre') {
            const ce = el.querySelector('code');
            return `\n\n\`\`\`\n${(ce || el).textContent.trim()}\n\`\`\`\n\n`;
        }

        // ── 서식 ──
        if (tag === 'strong' || tag === 'b' || cls.contains('Yjhzub'))
            return `**${ch(el, depth).trim()}**`;

        if (tag === 'em' || cls.contains('eujQNb')) {
            return el.querySelector('strong, b')
                ? `***${el.textContent.trim()}***`
                : `*${ch(el, depth).trim()}*`;
        }

        if (tag === 's' || cls.contains('iVKwMc'))
            return `~~${el.textContent.trim()}~~`;

        // ── 가로선 ──
        if (tag === 'hr') return '\n\n---\n\n';

        // ── blockquote ──
        if (tag === 'blockquote') {
            const inner = ch(el, depth).trim();
            return '\n\n' + inner.split('\n').map(l => '> ' + l).join('\n') + '\n\n';
        }

        // ── 테이블 ──
        if (tag === 'table') return convTable(el);
        if (clsSet.has('Fv6NCb') || clsSet.has('jT79ld')) {
            const t = el.querySelector('table');
            return t ? convTable(t) : ch(el, depth);
        }

        // ── 리스트 ──
        if (tag === 'ul') return convList(el, false, depth);
        if (tag === 'ol') return convList(el, true,  depth);
        if (tag === 'li') return convLi(el, '*', depth);

        // ── 링크 ──
        if (tag === 'a') {
            const href = el.getAttribute('href') || '';
            const skip = ['policies.google', 'support.google', 'gstatic'];
            if (!href || skip.some(s => href.includes(s))) return ch(el, depth);
            const text = ch(el, depth).trim();
            return `[${text || href}](${href})`;
        }

        // ── 이미지 ──
        if (tag === 'img') {
            const src = el.getAttribute('src') || '';
            if (src.includes('gstatic') || src.startsWith('data:')) return '';
            return `![${el.getAttribute('alt') || ''}](${src})`;
        }

        // ── br ──
        if (tag === 'br') return '\n';

        // ── 단락 ──
        if (cls.contains('n6owBd')) {
            const inner = ch(el, depth).trim();
            return inner ? `\n\n${inner}\n\n` : '';
        }

        return ch(el, depth);
    }

    function convList(el, ordered, level) {
        const items = [];
        let counter = 1;
        for (const child of el.children) {
            if (child.tagName.toLowerCase() === 'li') {
                const bullet = ordered ? `${counter}.` : '*';
                items.push(convLi(child, bullet, level));
                if (ordered) counter++;
            }
        }
        const r = items.join('');
        return level === 0 ? `\n\n${r}\n` : r;
    }

    function convLi(el, bullet, level) {
        const pad  = '   '.repeat(level);
        const ps   = [];
        const subs = [];
        for (const child of el.childNodes) {
            if (child.nodeType === 1
                && ['ul', 'ol'].includes(child.tagName.toLowerCase())) {
                subs.push(child);
            } else {
                ps.push(nd(child, level));
            }
        }
        let text = ps.join('').trim()
            .replace(/\[(\d+)\]\s*\[(\d+)\]/g, '[$1, $2]')
            .replace(/\[(\d+),\s*(\d+)\]\s*\[(\d+)\]/g, '[$1, $2, $3]');

        let result = `${pad}${bullet} ${text}\n`;
        for (const sub of subs) {
            result += convList(sub, sub.tagName.toLowerCase() === 'ol', level + 1);
        }
        return result;
    }

    function convTable(el) {
        if (!el) return '';
        const rows = [];
        el.querySelectorAll('tr').forEach(tr => {
            const cells = [...tr.querySelectorAll('th, td')]
                .map(td => td.textContent.trim().replace(/\s+/g, ' ')); // ← 공백 보존
            if (cells.length) rows.push(cells);
        });
        if (!rows.length) return '';
        const maxCols = Math.max(...rows.map(r => r.length));
        rows.forEach(r => { while (r.length < maxCols) r.push(''); });
        const lines = [
            '| ' + rows[0].join(' | ') + ' |',
            '| ' + Array(maxCols).fill('---').join(' | ') + ' |',
            ...rows.slice(1).map(r => '| ' + r.join(' | ') + ' |'),
        ];
        return '\n\n' + lines.join('\n') + '\n\n';
    }

    // ── 엘리먼트 → 마크다운 (최종 정리 포함) ────────────────────
    function toMarkdown(el) {
        const container = el.querySelector('[data-container-id="4"]') || el;
        let text = ch(container)
            .trim()
            .replace(/\n{4,}/g, '\n\n\n')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/  +/g, ' ');

        // 소스 각주
        if (Object.keys(sourceCards).length) {
            const refs = Object.keys(sourceCards)
                .sort((a, b) => +a - +b)
                .map(id => `[${id}] [${sourceCards[id].title}](${sourceCards[id].url})`)
                .join('\n\n');
            text += '\n\n---\n\n**참조:**\n\n' + refs;
        }
        return text.trim();
    }

    return { toMarkdown, ch };
}

// ─────────────────────────────────────────────────────────────
// § 공개 API
// ─────────────────────────────────────────────────────────────

/**
 * HTML → Chat JSON 배열
 * @param {string} html
 * @returns {Array<{role: string, parts: [{text: string}]}>}
 */
function extractChat(html) {
    const { document } = new JSDOM(html).window;
    const { toMarkdown } = buildConverter(document);
    const chatData = [];

    document.querySelectorAll('.tonYlb').forEach(block => {
        // 사용자
        const userEl = block.querySelector('.VndcI.veK2kb');
        if (userEl) {
            const text = userEl.textContent.trim();
            if (text) chatData.push({ role: 'user', parts: [{ text }] });
        }
        // 모델
        const modelEl = block.querySelector('.CKgc1d');
        if (modelEl) {
            const text = toMarkdown(modelEl);
            if (text) chatData.push({ role: 'model', parts: [{ text }] });
        }
    });

    return chatData;
}

/**
 * HTML → 마크다운 문자열 (전체 대화)
 * @param {string} html
 * @returns {string}
 */
function extractMarkdown(html) {
    const { document } = new JSDOM(html).window;
    const { toMarkdown } = buildConverter(document);
    const parts = [];

    document.querySelectorAll('.tonYlb').forEach(block => {
        const userEl  = block.querySelector('.VndcI.veK2kb');
        const modelEl = block.querySelector('.CKgc1d');

        if (userEl) {
            const q = userEl.textContent.trim();
            if (q) parts.push(`**사용자:** ${q}\n\n---`);
        }
        if (modelEl) {
            const md = toMarkdown(modelEl);
            if (md) parts.push(md);
        }
    });

    return parts.join('\n\n').replace(/\n{4,}/g, '\n\n\n').trim();
}

// ─────────────────────────────────────────────────────────────
// § CLI 진입점
// ─────────────────────────────────────────────────────────────
if (require.main === module) {
    const args    = process.argv.slice(2);
    const input   = args.find(a => !a.startsWith('--'));
    const mdMode  = args.includes('--md');
    const output  = args.find(a => a.endsWith('.json') || a.endsWith('.md'));

    if (!input) {
        console.error([
            '사용법:',
            '  node google-ai-extractor.js <input.html>              # JSON → stdout',
            '  node google-ai-extractor.js <input.html> output.json  # JSON 파일 저장',
            '  node google-ai-extractor.js <input.html> --md         # 마크다운 → stdout',
            '  node google-ai-extractor.js <input.html> output.md    # 마크다운 파일 저장',
        ].join('\n'));
        process.exit(1);
    }

    const html   = fs.readFileSync(path.resolve(input), 'utf-8');
    const isMd   = mdMode || (output && output.endsWith('.md'));
    const result = isMd
        ? extractMarkdown(html)
        : JSON.stringify(extractChat(html), null, 2);

    if (output) {
        fs.writeFileSync(path.resolve(output), result, 'utf-8');
        const lines = result.split('\n').length;
        console.log(`✅ 저장 완료: ${output} (${lines}줄)`);
    } else {
        process.stdout.write(result + '\n');
    }
}

// ─────────────────────────────────────────────────────────────
// § 모듈 내보내기
// ─────────────────────────────────────────────────────────────
module.exports = { extractChat, extractMarkdown };
