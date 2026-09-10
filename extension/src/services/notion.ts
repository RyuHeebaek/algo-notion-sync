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
   * Adds or updates a problem submission in the specified database
   */
  public async syncSubmission(databaseId: string, submission: SubmissionMeta): Promise<any> {
    // 1. Check if the problem already exists in the database
    const existing = await this.findExistingPage(databaseId, submission.site, submission.problemId);

    // Build Notion properties matching standard schema
    const properties: Record<string, any> = {
      '문제명': {
        title: [
          {
            text: {
              content: `${submission.problemId}. ${submission.title}`
            }
          }
        ]
      },
      '사이트': {
        select: {
          name: submission.site
        }
      },
      '문제번호': {
        rich_text: [
          {
            text: {
              content: String(submission.problemId)
            }
          }
        ]
      },
      '상태': {
        select: {
          name: submission.status
        }
      },
      '제출일': {
        date: {
          start: submission.submittedAt.split('T')[0] || new Date().toISOString().split('T')[0]
        }
      },
      '문제 링크': {
        url: submission.problemUrl
      }
    };

    if (submission.difficulty) {
      properties['난이도'] = {
        select: {
          name: submission.difficulty
        }
      };
    }

    if (submission.language) {
      properties['언어'] = {
        select: {
          name: submission.language
        }
      };
    }

    if (submission.tags && submission.tags.length > 0) {
      properties['알고리즘'] = {
        multi_select: submission.tags.map(t => ({ name: t.replace(/,/g, '') }))
      };
    }

    // Children blocks (Code block if source code available)
    const children: any[] = [];
    if (submission.code) {
      // Map language to Notion supported code block language
      let notionLang = 'plain text';
      const langLower = (submission.language || '').toLowerCase();
      if (langLower.includes('py')) notionLang = 'python';
      else if (langLower.includes('java')) notionLang = 'java';
      else if (langLower.includes('c++') || langLower.includes('cpp')) notionLang = 'c++';
      else if (langLower.includes('c')) notionLang = 'c';
      else if (langLower.includes('js') || langLower.includes('javascript')) notionLang = 'javascript';

      // Notion blocks have max 2000 chars per text element, chunk if necessary
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

    if (existing) {
      // Update existing page
      return await this.request(`/pages/${existing.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          properties
        })
      });
    } else {
      // Create new page in database
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
          filter: {
            and: [
              {
                property: '사이트',
                select: {
                  equals: site
                }
              },
              {
                property: '문제번호',
                rich_text: {
                  equals: String(problemId)
                }
              }
            ]
          },
          page_size: 1
        })
      });
      return response.results && response.results.length > 0 ? response.results[0] : null;
    } catch {
      // If query fails (e.g. database schema does not have those exact properties yet), fallback to new creation
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
