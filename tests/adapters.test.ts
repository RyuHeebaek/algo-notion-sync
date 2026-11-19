import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import * as path from 'path';
import { SWEAAdapter } from '../extension/src/adapters/swea';
import { JungolAdapter } from '../extension/src/adapters/jungol';
import { BOJAdapter } from '../extension/src/adapters/boj';

describe('Site Adapters Extraction Tests', () => {
  const sweaHtml = fs.readFileSync(path.resolve(__dirname, 'fixtures/swea_problem.html'), 'utf-8');
  const jungolHtml = fs.readFileSync(path.resolve(__dirname, 'fixtures/jungol_problem.html'), 'utf-8');

  it('SWEAAdapter should accurately extract problem metadata, login state, and submission', () => {
    const dom = new JSDOM(sweaHtml, { url: 'https://swexpertacademy.com/main/code/problem/problemDetail.do?contestProbId=1204' });
    const adapter = new SWEAAdapter();

    // 1. Matches
    expect(adapter.matches('https://swexpertacademy.com/main/code/problem/problemDetail.do')).toBe(true);
    expect(adapter.matches('https://acmicpc.net/problem/1000')).toBe(false);

    // 2. Login Check
    const loginStatus = adapter.checkLogin(dom.window.document);
    expect(loginStatus.isLoggedIn).toBe(true);
    expect(loginStatus.username).toBe('AlgorithmMaster');

    // 3. Problem Extraction
    const problem = adapter.extractProblem(dom.window.document, 'https://swexpertacademy.com/main/code/problem/problemDetail.do?contestProbId=1204');
    expect(problem).not.toBeNull();
    expect(problem?.problemId).toBe('1204');
    expect(problem?.title).toBe('[S/W 문제해결 기본] 1일차 - 최빈수 구하기');
    expect(problem?.difficulty).toBe('D2');
    expect(problem?.tags).toContain('구현');
    expect(problem?.tags).toContain('빈도수');

    // 4. Submission Extraction
    const submission = adapter.extractSubmission(dom.window.document, 'https://swexpertacademy.com/main/code/problem/problemDetail.do?contestProbId=1204');
    expect(submission).not.toBeNull();
    expect(submission?.status).toBe('Accepted');
    expect(submission?.language).toBe('Java');
    expect(submission?.code).toContain('import java.util.Scanner;');
  });

  it('JungolAdapter should accurately extract problem metadata, login state, and submission', () => {
    const dom = new JSDOM(jungolHtml, { url: 'http://www.jungol.co.kr/problem.php?id=1828' });
    const adapter = new JungolAdapter();

    // 1. Matches
    expect(adapter.matches('http://www.jungol.co.kr/problem.php?id=1828')).toBe(true);
    expect(adapter.matches('https://swexpertacademy.com')).toBe(false);

    // 2. Login Check
    const loginStatus = adapter.checkLogin(dom.window.document);
    expect(loginStatus.isLoggedIn).toBe(true);
    expect(loginStatus.username).toBe('정올러');

    // 3. Problem Extraction
    const problem = adapter.extractProblem(dom.window.document, 'http://www.jungol.co.kr/problem.php?id=1828');
    expect(problem).not.toBeNull();
    expect(problem?.problemId).toBe('1828');
    expect(problem?.title).toBe('냉장고');
    expect(problem?.tags).toContain('그리디(Greedy)');

    // 4. Submission Extraction
    const submission = adapter.extractSubmission(dom.window.document, 'http://www.jungol.co.kr/problem.php?id=1828');
    expect(submission).not.toBeNull();
    expect(submission?.status).toBe('Accepted');
    expect(submission?.language).toBe('C++');
    expect(submission?.code).toContain('#include <iostream>');
  });

  it('BOJAdapter should not report a submission for a plain problem page', () => {
    const html = '<html><body><div id="problem_title">동전 0</div></body></html>';
    const dom = new JSDOM(html, { url: 'https://www.acmicpc.net/problem/11047' });
    const adapter = new BOJAdapter();

    expect(adapter.matches('https://www.acmicpc.net/problem/11047')).toBe(true);
    expect(adapter.extractProblem(dom.window.document, 'https://www.acmicpc.net/problem/11047')?.problemId).toBe('11047');
    // A problem page carries no judging result, so nothing may be auto-synced as Accepted.
    expect(adapter.extractSubmission(dom.window.document, 'https://www.acmicpc.net/problem/11047')).toBeNull();
  });

  it('BOJAdapter should read the result from a status row', () => {
    const html = `<html><body><div id="problem_title">동전 0</div>
      <table id="status-table"><tbody><tr>
        <td>1</td><td>11047</td><td>ryu</td><td>맞았습니다!!</td><td>Java 11</td><td>128 ms</td><td>2026-11-19 21:14:03</td>
      </tr></tbody></table></body></html>`;
    const dom = new JSDOM(html, { url: 'https://www.acmicpc.net/status?problem_id=11047' });
    const submission = new BOJAdapter().extractSubmission(dom.window.document, 'https://www.acmicpc.net/status?problem_id=11047');

    expect(submission?.status).toBe('Accepted');
    expect(submission?.language).toBe('Java 11');
  });
});
