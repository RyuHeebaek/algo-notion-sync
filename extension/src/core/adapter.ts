import { ProblemMeta, SiteLoginStatus, SiteType, SubmissionMeta } from '../types';

export interface SiteAdapter {
  site: SiteType;
  /** Matches whether this URL belongs to the site */
  matches(url: string): boolean;
  /** Checks if the user is currently logged in using DOM elements */
  checkLogin(doc: Document): SiteLoginStatus;
  /** Extracts problem metadata from problem view pages */
  extractProblem(doc: Document, url: string): ProblemMeta | null;
  /** Extracts submission details (status, code, language, time) from submission or result pages */
  extractSubmission(doc: Document, url: string): SubmissionMeta | null;
}

export class AdapterRegistry {
  private adapters: SiteAdapter[] = [];

  public register(adapter: SiteAdapter): void {
    this.adapters.push(adapter);
  }

  public getAdapterForUrl(url: string): SiteAdapter | undefined {
    return this.adapters.find(adapter => adapter.matches(url));
  }

  public getAdapterForSite(site: SiteType): SiteAdapter | undefined {
    return this.adapters.find(adapter => adapter.site === site);
  }

  public getAllAdapters(): SiteAdapter[] {
    return this.adapters;
  }
}

export const globalAdapterRegistry = new AdapterRegistry();
