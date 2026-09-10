import { ProblemMeta, SiteLoginStatus, SubmissionMeta } from '../types';
import { SiteAdapter } from '../core/adapter';

export class SWEAAdapter implements SiteAdapter {
  public site = 'SWEA' as const;

  public matches(url: string): boolean {
    return url.includes('swexpertacademy.com');
  }

  public checkLogin(doc: Document): SiteLoginStatus {
    // On SWEA, logged-in users see logout buttons or user profile links (e.g. .btn_logout, /main/user/logout.do)
    // Logged out users see login link (.btn_login, /main/login/login.do)
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
    // Problem detail page: typically /main/code/problem/problemDetail.do?contestProbId=XXXXX
    const titleEl = doc.querySelector('.problem_title, .title_box h3, .tit_box .tit, .code_title');
    const rawTitle = titleEl?.textContent?.trim();

    // Problem ID can be parsed from URL params or page text
    const urlObj = new URL(url, 'https://swexpertacademy.com');
    const probIdFromUrl = urlObj.searchParams.get('contestProbId') || '';

    // SWEA Problem Titles often look like "1204. [S/W 문제해결 기본] 1일차 - 최빈수 구하기"
    let problemId = probIdFromUrl;
    let title = rawTitle || 'SWEA Problem';

    if (rawTitle) {
      const match = rawTitle.match(/^(\d+)\.\s*(.*)$/);
      if (match) {
        problemId = match[1];
        title = match[2].trim();
      }
    }

    // Difficulty level: D1 ~ D8 or box badge
    let difficulty: string | undefined;
    const badgeEl = doc.querySelector('.badge_d, .badge_difficulty, .difficulty, span[class*="badge"]');
    if (badgeEl?.textContent) {
      difficulty = badgeEl.textContent.trim();
    } else {
      const diffMatch = doc.body.textContent?.match(/\b(D[1-8])\b/);
      if (diffMatch) difficulty = diffMatch[1];
    }

    // Algorithm tags
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

    // Result/status in SWEA: Pass, Fail, etc.
    let status: SubmissionMeta['status'] = 'Submitted';
    const statusEl = doc.querySelector('.result_msg, .pass_box, .fail_box, .solve_status, .status_txt');
    const textContent = (statusEl?.textContent || doc.body.textContent || '').toLowerCase();

    if (textContent.includes('pass') || textContent.includes('정답') || textContent.includes('accepted')) {
      status = 'Accepted';
    } else if (textContent.includes('fail') || textContent.includes('오답') || textContent.includes('wrong')) {
      status = 'Wrong Answer';
    } else if (textContent.includes('시간초과') || textContent.includes('time limit')) {
      status = 'Time Limit Exceeded';
    } else if (textContent.includes('메모리초과') || textContent.includes('memory limit')) {
      status = 'Memory Limit Exceeded';
    } else if (textContent.includes('런타임에러') || textContent.includes('runtime error')) {
      status = 'Runtime Error';
    }

    // Language
    let language: string | undefined;
    const langEl = doc.querySelector('.lang_select, .code_lang, .select_lang');
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
