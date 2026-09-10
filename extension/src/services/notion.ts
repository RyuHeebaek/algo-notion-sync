import { NotionDatabase, SubmissionMeta } from '../types';

export class NotionService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Notion API Error (${response.status}): ${errBody}`);
    }

    return response.json();
  }

  /**
   * Searches for databases accessible to the bot integration
   */
  public async listDatabases(): Promise<NotionDatabase[]> {
    const result = await this.request('/search', {
      method: 'POST',
      body: JSON.stringify({
        filter: {
          value: 'database',
          property: 'object'
        },
        page_size: 50
      })
    });

    return (result.results || []).map((db: any) => {
      const titleProp = db.title || [];
      const title = titleProp.map((t: any) => t.plain_text).join('') || 'Untitled Database';
      return {
        id: db.id,
        title
      };
    });
  }

  /**
   * Retrieves the schema/properties of the target database
   */
  public async getDatabase(databaseId: string): Promise<any> {
    return await this.request(`/databases/${databaseId}`, { method: 'GET' });
  }

  /**
   * Adds or updates a problem submission in the specified database
   * Checks for duplicates and updates existing page instead of creating multiples!
   */
  public async syncSubmission(databaseId: string, submission: SubmissionMeta): Promise<any> {
    // 1. Fetch target DB schema to see exact columns
    const dbInfo = await this.getDatabase(databaseId);
    const dbSchema: Record<string, any> = dbInfo.properties || {};

    const properties: Record<string, any> = {};

    // 2. Find Title property (every Notion DB has exactly one title property)
    const titleKey = Object.keys(dbSchema).find(k => dbSchema[k].type === 'title');
    if (titleKey) {
      properties[titleKey] = {
        title: [
          {
            text: {
              content: `${submission.site}. ${submission.problemId}. ${submission.title}`
            }
          }
        ]
      };
    }

    // Helper: only match existing property by case-insensitive name and matching type
    const findExisting = (candidates: string[], type?: string) => {
      return Object.keys(dbSchema).find(k => {
        const nameMatch = candidates.some(c => c.toLowerCase() === k.toLowerCase());
        const typeMatch = !type || dbSchema[k].type === type;
        return nameMatch && typeMatch;
      });
    };

    // 3. Date / 날짜 (Crucial for Calendar & Heatmap views!)
    const dateProp = findExisting(['날짜', '제출일', '제출일자', 'date', 'Date', '일자'], 'date') ||
                     Object.keys(dbSchema).find(k => dbSchema[k].type === 'date');
    if (dateProp) {
      const todayStr = submission.submittedAt.split('T')[0] || new Date().toISOString().split('T')[0];
      properties[dateProp] = {
        date: { start: todayStr }
      };
    }

    // 4. Site / 사이트
    const siteProp = findExisting(['사이트', '플랫폼', 'site', 'Platform']);
    if (siteProp) {
      if (dbSchema[siteProp].type === 'select') {
        properties[siteProp] = { select: { name: submission.site } };
      } else if (dbSchema[siteProp].type === 'rich_text') {
        properties[siteProp] = { rich_text: [{ text: { content: submission.site } }] };
      }
    }

    // 5. Problem Number / 문제번호
    const numProp = findExisting(['문제번호', '번호', 'number', 'ProblemId']);
    if (numProp) {
      if (dbSchema[numProp].type === 'number') {
        const n = parseInt(submission.problemId, 10);
        if (!isNaN(n)) properties[numProp] = { number: n };
      } else if (dbSchema[numProp].type === 'rich_text') {
        properties[numProp] = { rich_text: [{ text: { content: String(submission.problemId) } }] };
      }
    }

    // 6. Status / 상태
    const statusProp = findExisting(['상태', '결과', 'status', 'Result'], 'select') ||
                       findExisting(['상태', '결과', 'status', 'Result'], 'status');
    if (statusProp) {
      if (dbSchema[statusProp].type === 'status') {
        properties[statusProp] = { status: { name: submission.status } };
      } else if (dbSchema[statusProp].type === 'select') {
        properties[statusProp] = { select: { name: submission.status } };
      }
    }

    // 7. Problem URL / 링크
    const urlProp = findExisting(['문제 링크', '문제링크', '링크', 'url', 'Link', 'URL'], 'url');
    if (urlProp) {
      properties[urlProp] = { url: submission.problemUrl };
    }

    // 8. Difficulty / 난이도
    if (submission.difficulty) {
      const diffProp = findExisting(['난이도', 'difficulty', 'Tier', '레벨']);
      if (diffProp) {
        if (dbSchema[diffProp].type === 'select') {
          properties[diffProp] = { select: { name: submission.difficulty } };
        } else if (dbSchema[diffProp].type === 'rich_text') {
          properties[diffProp] = { rich_text: [{ text: { content: submission.difficulty } }] };
        }
      }
    }

    // 9. Language / 언어
    if (submission.language) {
      const langProp = findExisting(['언어', 'language', 'Language']);
      if (langProp) {
        if (dbSchema[langProp].type === 'select') {
          properties[langProp] = { select: { name: submission.language } };
        } else if (dbSchema[langProp].type === 'rich_text') {
          properties[langProp] = { rich_text: [{ text: { content: submission.language } }] };
        }
      }
    }

    // 10. Tags / 알고리즘
    if (submission.tags && submission.tags.length > 0) {
      const tagProp = findExisting(['알고리즘', '태그', 'tags', 'Tags', '유형', '분류'], 'multi_select');
      if (tagProp) {
        properties[tagProp] = {
          multi_select: submission.tags.map(t => ({ name: t.replace(/,/g, '').trim() })).filter(t => t.name)
        };
      }
    }

    // 11. Code Block in page children
    const children: any[] = [];
    if (submission.code) {
      let notionLang = 'plain text';
      const langLower = (submission.language || '').toLowerCase();
      if (langLower.includes('py')) notionLang = 'python';
      else if (langLower.includes('java')) notionLang = 'java';
      else if (langLower.includes('c++') || langLower.includes('cpp')) notionLang = 'c++';
      else if (langLower.includes('c')) notionLang = 'c';
      else if (langLower.includes('js') || langLower.includes('javascript')) notionLang = 'javascript';

      const chunks = this.chunkString(submission.code, 2000);
      children.push({
        object: 'block',
        type: 'code',
        code: {
          rich_text: chunks.map(chunk => ({
            type: 'text',
            text: { content: chunk }
          })),
          language: notionLang
        }
      });
    }

    // 12. Check if problem already exists in database (De-duplication)
    const existing = await this.findExistingPage(databaseId, submission.site, submission.problemId);

    if (existing) {
      // If already exists, update properties only (prevent creating 2nd/3rd duplicates)
      return await this.request(`/pages/${existing.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          properties
        })
      });
    } else {
      // Create new page
      return await this.request('/pages', {
        method: 'POST',
        body: JSON.stringify({
          parent: { database_id: databaseId },
          properties,
          children: children.length > 0 ? children : undefined
        })
      });
    }
  }

  private async findExistingPage(databaseId: string, site: string, problemId: string): Promise<any | null> {
    try {
      const response = await this.request(`/databases/${databaseId}/query`, {
        method: 'POST',
        body: JSON.stringify({
          page_size: 50
        })
      });

      const results = response.results || [];
      return results.find((page: any) => {
        const props = page.properties || {};
        const titleProp = Object.values(props).find((p: any) => (p as any).type === 'title') as any;
        const plainTitle = titleProp?.title?.map((t: any) => t.plain_text).join('') || '';
        return plainTitle.includes(String(problemId));
      }) || null;
    } catch {
      return null;
    }
  }

  private chunkString(str: string, size: number): string[] {
    const numChunks = Math.ceil(str.length / size);
    const chunks = new Array(numChunks);
    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
      chunks[i] = str.substr(o, size);
    }
    return chunks;
  }
}
