export interface SitemapEntry {
  loc: string;
  lastmod?: string;
}

export interface SiteMapIndexes {
  sitemapindex: {
    $: object;
    sitemap: SitemapEntry[];
  };
}

export interface SiteMapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

export interface SiteMaps {
  urlset: {
    $: object;
    url: SiteMapUrl[];
  };
}

export interface FetchMethod {
  fetch(): Promise<SiteMapIndexes | SiteMaps | undefined>;
}

export interface SiteMapServiceMethods {
  checkSiteMapIndexes(): boolean;
  checkSiteMaps(): boolean;

  getSiteMapIndexes(): SiteMapIndexes | null;
  getSiteMaps(): SiteMaps | null;
}
