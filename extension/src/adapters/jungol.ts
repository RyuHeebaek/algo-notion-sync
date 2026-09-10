import { ProblemMeta, SiteLoginStatus, SubmissionMeta } from '../types';
import { SiteAdapter } from '../core/adapter';

export class JungolAdapter implements SiteAdapter {
  public site = 'JUNGOL' as const;

  public matches(url: string): boolean {
    return url.includes('jungol.co.kr');
  }

  public checkLogin(doc: Document): SiteLoginStatus {
    const logoutBtn = Array.from(doc.querySelectorAll('a, button')).find(
      el => el.textContent?.includes('로그아웃') || el.getAttribute('href')?.includes('logout')
    );
    const usernameEl = doc.querySelector('.member-name, .user-name, .profile-name');

    const isLoggedIn = !!logoutBtn;
    return {
      site: this.site,
      isLoggedIn,
      username: usernameEl?.textContent?.trim() || undefined
    };
  }

  public extractProblem(doc: Document, url: string): ProblemMeta | null {
    const urlObj = new URL(url, 'http://www.jungol.co.kr');
    const idFromUrl = urlObj.searchParams.get('id') || '';

    const titleEl = doc.querySelector('.problem-title, .panel-title, h4, h3, .title');
    const rawTitle = titleEl?.textContent?.trim() || '';

    let problemId = idFromUrl;
    let title = rawTitle;

    const match = rawTitle.match(/^(\d+)\s*[:\.]\s*(.*)$/);
    if (match) {
      problemId = match[1];
      title = match[2].trim();
    }

    const tags: string[] = [];
    const breadcrumbs = doc.querySelectorAll('.breadcrumb li, .category-badge, .nav-tabs li');
    breadcrumbs.forEach(el => {
      const text = el.textContent?.trim();
      if (text && !text.includes('홈') && !text.includes('문제은행')) {
        tags.push(text);
      }
    });

    return {
      site: this.site,
      problemId: problemId || 'JUNGOL',
      title: title || 'JUNGOL Problem',
      difficulty: tags.length > 0 ? tags[0] : undefined,
      tags,
      problemUrl: url
    };
  }

  public extractSubmission(doc: Document, url: string): SubmissionMeta | null {
    const problem = this.extractProblem(doc, url);
    if (!problem) return null;

    // STRICT status detection for JUNGOL
    const statusEl = doc.querySelector(
      '.result-status, .label-success, .label-danger, .status-text, td.result, span.result'
    );

    let status: SubmissionMeta['status'] = 'Submitted';

    if (statusEl) {
      const text = (statusEl.textContent || '').trim().toLowerCase();
      if (text.includes('정답') || text.includes('100점') || text.includes('accepted')) {
        status = 'Accepted';
      } else if (text.includes('틀렸습니다') || text.includes('wrong answer')) {
        status = 'Wrong Answer';
      } else if (text.includes('시간') && text.includes('초과')) {
        status = 'Time Limit Exceeded';
      } else if (text.includes('메모리') && text.includes('초과')) {
        status = 'Memory Limit Exceeded';
      } else if (text.includes('컴파일') && text.includes('에러')) {
        status = 'Compilation Error';
      } else if (text.includes('런타임')) {
        status = 'Runtime Error';
      }
    } else {
      status = 'Submitted';
    }

    // Language
    const langEl = doc.querySelector('select[name="language"], .source-lang, td.language');
    const language = langEl?.textContent?.trim() || 'C++';

    // Source code: from textarea or pre tag
    const codeEl = doc.querySelector('textarea#source, textarea[name="source"], pre.prettyprint, pre code');
    const code = (codeEl as HTMLTextAreaElement)?.value || codeEl?.textContent || undefined;

    return {
      ...problem,
      status,
      language,
      submittedAt: new Date().toISOString(),
      code: code?.trim()
    };
  }
}
