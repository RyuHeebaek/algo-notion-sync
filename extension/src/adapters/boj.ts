import { ProblemMeta, SiteLoginStatus, SubmissionMeta } from '../types';
import { SiteAdapter } from '../core/adapter';

type SubmissionStatus = SubmissionMeta['status'];

/**
 * Baekjoon adapter.
 *
 * A Baekjoon problem page (acmicpc.net/problem/N) never shows a judging result, so
 * extractSubmission() returns null there: otherwise every problem page a user opens
 * would be written to Notion as if it had been accepted. A result is only reported
 * when the page really carries one (submission / status pages).
 */
export class BOJAdapter implements SiteAdapter {
  public site = 'BOJ' as const;

  private static readonly STATUS_PATTERNS: Array<[RegExp, SubmissionStatus]> = [
    [/맞았습니다|Accepted/i, 'Accepted'],
    [/틀렸습니다|Wrong Answer/i, 'Wrong Answer'],
    [/시간 초과|Time Limit Exceeded/i, 'Time Limit Exceeded'],
    [/메모리 초과|Memory Limit Exceeded/i, 'Memory Limit Exceeded'],
    [/런타임 에러|Runtime Error/i, 'Runtime Error'],
    [/컴파일 에러|Compilation Error/i, 'Compilation Error'],
  ];

  public matches(url: string): boolean {
    return url.includes('acmicpc.net');
  }

  public checkLogin(doc: Document): SiteLoginStatus {
    const logoutBtn = doc.querySelector('a[href*="/logout"]');
    const usernameEl = doc.querySelector('.username');
    return {
      site: this.site,
      isLoggedIn: !!logoutBtn,
      username: usernameEl?.textContent?.trim() || undefined
    };
  }

  public extractProblem(doc: Document, url: string): ProblemMeta | null {
    const titleEl = doc.querySelector('#problem_title');
    const title = titleEl?.textContent?.trim() || 'BOJ Problem';
    const match = url.match(/\/problem\/(\d+)/);
    const problemId = match ? match[1] : '';

    const tags: string[] = [];
    doc.querySelectorAll('.spoiler-list a').forEach(el => {
      const text = el.textContent?.trim();
      if (text) tags.push(text);
    });

    return {
      site: this.site,
      problemId,
      title,
      tags,
      problemUrl: url
    };
  }

  public extractSubmission(doc: Document, url: string): SubmissionMeta | null {
    const problem = this.extractProblem(doc, url);
    if (!problem) return null;

    const statusTable = doc.querySelector('#status-table');
    const isSubmissionPage = /\/(submit|status|showsubmit|source)\//i.test(url) || !!statusTable;
    if (!isSubmissionPage) return null;

    const row = statusTable?.querySelector('tbody tr');
    const cells = row
      ? Array.from(row.querySelectorAll('td')).map(td => td.textContent?.trim() || '')
      : [];
    const resultText = cells.length >= 4 ? cells[3] : '';

    const matched = BOJAdapter.STATUS_PATTERNS.find(([pattern]) => pattern.test(resultText));
    if (!matched) return null;

    const code = doc.querySelector('#source, .source-code, pre#code')?.textContent?.trim();
    const submittedAt = cells[6] || new Date().toISOString();

    return {
      ...problem,
      status: matched[1],
      language: cells[4] || undefined,
      submittedAt,
      code: code && code.length > 0 ? code : undefined,
    };
  }
}
