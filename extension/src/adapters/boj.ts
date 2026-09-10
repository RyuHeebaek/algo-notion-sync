import { ProblemMeta, SiteLoginStatus, SubmissionMeta } from '../types';
import { SiteAdapter } from '../core/adapter';

export class BOJAdapter implements SiteAdapter {
  public site = 'BOJ' as const;

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

    return {
      ...problem,
      status: 'Accepted',
      submittedAt: new Date().toISOString()
    };
  }
}
