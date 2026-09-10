import { describe, it, expect, vi } from 'vitest';
import { NotionService } from '../extension/src/services/notion';
import { SubmissionMeta } from '../extension/src/types';

describe('NotionService Unit Tests', () => {
  const fakeToken = 'secret_test_token_12345';
  const fakeDbId = 'test-database-id-xyz';

  it('should list databases correctly from Notion API response', async () => {
    const mockApiResponse = {
      results: [
        {
          id: 'db-1',
          title: [{ plain_text: '알고리즘 문제풀이' }]
        },
        {
          id: 'db-2',
          title: [{ plain_text: 'PS Archive' }]
        }
      ]
    };

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    } as any);

    const service = new NotionService(fakeToken);
    const databases = await service.listDatabases();

    expect(databases).toHaveLength(2);
    expect(databases[0]).toEqual({ id: 'db-1', title: '알고리즘 문제풀이' });
    expect(databases[1]).toEqual({ id: 'db-2', title: 'PS Archive' });

    fetchSpy.mockRestore();
  });

  it('should format and send submission properties accurately when creating page', async () => {
    const submission: SubmissionMeta = {
      site: 'SWEA',
      problemId: '1204',
      title: '최빈수 구하기',
      difficulty: 'D2',
      tags: ['구현', '수학'],
      problemUrl: 'https://swexpertacademy.com/main/code/problem/problemDetail.do?contestProbId=1204',
      status: 'Accepted',
      language: 'Java',
      submittedAt: '2026-09-10T12:00:00.000Z',
      code: 'public class Solution { ... }'
    };

    let createBodySent: any = null;

    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(async (url: any, options: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/databases/test-database-id-xyz/query')) {
        return {
          ok: true,
          json: async () => ({ results: [] })
        } as any;
      }
      if (urlStr.includes('/databases/test-database-id-xyz')) {
        return {
          ok: true,
          json: async () => ({
            properties: {
              '문제명': { type: 'title' },
              '사이트': { type: 'select' },
              '문제번호': { type: 'rich_text' },
              '상태': { type: 'select' },
              '난이도': { type: 'select' },
              '알고리즘': { type: 'multi_select' },
              '제출일': { type: 'date' },
              '문제 링크': { type: 'url' }
            }
          })
        } as any;
      }
      if (urlStr.includes('/pages')) {
        createBodySent = JSON.parse(options.body);
        return {
          ok: true,
          json: async () => ({ id: 'new-page-id' })
        } as any;
      }
      return { ok: true, json: async () => ({}) } as any;
    });

    const service = new NotionService(fakeToken);
    const res = await service.syncSubmission(fakeDbId, submission);

    expect(res).toEqual({ id: 'new-page-id' });
    expect(createBodySent).not.toBeNull();
    expect(createBodySent.parent.database_id).toBe(fakeDbId);

    const props = createBodySent.properties;
    expect(props['문제명'].title[0].text.content).toBe('SWEA. 1204. 최빈수 구하기');
    expect(props['사이트'].select.name).toBe('SWEA');
    expect(props['상태'].select.name).toBe('Accepted');
    expect(props['난이도'].select.name).toBe('D2');
    expect(props['알고리즘'].multi_select).toHaveLength(2);

    expect(createBodySent.children).toHaveLength(1);
    expect(createBodySent.children[0].type).toBe('code');
    expect(createBodySent.children[0].code.language).toBe('java');

    fetchSpy.mockRestore();
  });
});
