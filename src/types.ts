export interface TechStackItem {
  category: string;
  name: string;
  badge: string;
}

export interface ChangelogItem {
  version: string;
  date: string;
  added?: string[];
  improved?: string[];
  fixed?: string[];
  changes?: string[];
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface GalleryItem {
  title: string;
  url: string;
}

export interface DownloadAssets {
  windows?: string;
  mac?: string;
  linux?: string;
  android?: string;
  cli?: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  status: 'stable' | 'beta' | 'alpha' | 'paused' | 'archived' | string;
  roadmapStage: 'Ideas' | 'Planning' | 'Development' | 'Testing' | 'Released' | 'Archived' | string;
  version: string;
  platform: string;
  platformIcon: string;
  progress: number;
  lastUpdated: string;
  colorTheme?: string;
  accentColor?: string;
  githubUrl: string;
  bugReportUrl?: string;
  featureRequestUrl?: string;
  documentationUrl?: string;
  projectPageUrl?: string;
  currentlyShipping?: boolean;
  expectedNextRelease?: string;
  problem?: string;
  solution?: string;
  downloadAssets?: DownloadAssets;
  expectedFeatures: string[];
  techStack: TechStackItem[];
  knownIssues?: string[];
  changelog: ChangelogItem[];
  faq?: FAQItem[];
  gallery?: GalleryItem[];
}

export interface AppState {
  activeFilter: string;
  searchQuery: string;
  sortBy: 'newest' | 'oldest' | 'alphabetical' | string;
  viewMode: 'grid' | 'list' | string;
  activeProject: Project | null;
  selectedCmdIndex: number;
}
