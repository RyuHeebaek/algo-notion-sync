import { ProblemMeta, SiteLoginStatus, SubmissionMeta } from '../types';
import { SiteAdapter } from '../core/adapter';

export class SWEAAdapter implements SiteAdapter {
  public site = 'SWEA' as const;

  public matches(url: string): boolean {
    return url.includes('swexpertacademy.com');
  }

  public checkLogin(doc: Document): SiteLoginStatus {
    const logoutBtn = doc.querySelector('a[href*="logout.do"], .btn_logout, .user_name, .my_info');
    const loginBtn = doc.querySelector('a[href*="login.do"], .btn_login');
    const usernameEl = doc.querySelector('.user_name, .user_id, .nick_name');

    const isLoggedIn = !!logoutBtn || (!loginBtn && !!usernameEl);
    return {
      site: this.site,
      isLoggedIn,
      username: usernameEl?.textContent?.trim() || undefined
    };
  }

  public extractProblem(doc: Document, url: string): ProblemMeta | null {
    const titleEl = doc.querySelector('.problem_title, .title_box h3, .tit_box .tit, .code_title');
    const rawTitle = titleEl?.textContent?.trim();

    const urlObj = new URL(url, 'https://swexpertacademy.com');
    const probIdFromUrl = urlObj.searchParams.get('contestProbId') || '';

    let problemId = probIdFromUrl;
    let title = rawTitle || 'SWEA Problem';

    if (rawTitle) {
      const match = rawTitle.match(/^(\d+)\.\s*(.*)$/);
      if (match) {
        problemId = match[1];
        title = match[2].trim();
      }
    }

    let difficulty: string | undefined;
    const badgeEl = doc.querySelector('.badge_d, .badge_difficulty, .difficulty, span[class*="badge"]');
    if (badgeEl?.textContent) {
      difficulty = badgeEl.textContent.trim();
    } else {
      const diffMatch = doc.body.textContent?.match(/\b(D[1-8])\b/);
      if (diffMatch) difficulty = diffMatch[1];
    }

    const tags: string[] = [];
    const tagElements = doc.querySelectorAll('.tag_list li, .keyword_box a, .tags span');
    tagElements.forEach(el => {
      const t = el.textContent?.replace(/^#/, '').trim();
      if (t) tags.push(t);
    });

    return {
      site: this.site,
      problemId: problemId || 'SWEA',
      title,
      difficulty,
      tags,
      problemUrl: url
    };
  }

  public extractSubmission(doc: Document, url: string): SubmissionMeta | null {
    const problem = this.extractProblem(doc, url);
    if (!problem) return null;

    // STRICT Result Status Detection:
    // Only query dedicated result elements (NOT the entire doc.body to avoid false positives like "password")
    const statusEl = doc.querySelector(
      '.result_msg, .pass_box, .fail_box, .solve_status, .status_txt, ' +
      '#resultDiv, .result_area, .popup_result, td.result, span.solve_ok, span.solve_fail'
    );

    let status: SubmissionMeta['status'] = 'Submitted';

    if (statusEl) {
      const text = (statusEl.textContent || '').trim().toLowerCase();
      if (text.includes('pass') || text.includes('정답') || text.includes('accepted') || text.includes('맞았습니다')) {
        status = 'Accepted';
      } else if (text.includes('fail') || text.includes('오답') || text.includes('틀렸습니다')) {
        status = 'Wrong Answer';
      } else if (text.includes('시간초과') || text.includes('time limit')) {
        status = 'Time Limit Exceeded';
      } else if (text.includes('메모리초과') || text.includes('memory limit')) {
        status = 'Memory Limit Exceeded';
      } else if (text.includes('런타임') || text.includes('runtime')) {
        status = 'Runtime Error';
      } else if (text.includes('컴파일') || text.includes('compile')) {
        status = 'Compilation Error';
      }
    } else {
      // If there is no result element on the page at all, this is just a problem viewing page (Not submitted yet)
      status = 'Submitted';
    }

    // Language
    let language: string | undefined;
    const langEl = doc.querySelector('.lang_select, .code_lang, .select_lang, select#selectLang');
    if (langEl) {
      language = (langEl as HTMLSelectElement).value || langEl.textContent?.trim();
    }

    // Code: extracted from textarea or ACE editor
    let code: string | undefined;
    const codeArea = doc.querySelector('textarea#userCode, textarea[name="code"], .ace_content, pre.code');
    if (codeArea) {
      code = (codeArea as HTMLTextAreaElement).value || codeArea.textContent || undefined;
    }

    return {
      ...problem,
      status,
      language: language || 'Java',
      submittedAt: new Date().toISOString(),
      code: code?.trim()
    };
  }
}
